/**
 * NexusStream - Real Network Search Aggregator
 *
 * Concurrently queries all enabled providers over real HTTP network endpoints.
 * Features:
 * - Parallel per-provider network requests
 * - Individual provider timeouts (8000ms) and cancellation via AbortSignal
 * - Strict error isolation: if one provider fails/times out, other providers continue
 * - Title normalization and fuzzy multi-provider deduplication
 * - Metadata merging (merges stream sources across providers for the same title)
 * - Truthful empty states: strictly NO hardcoded or local catalog fallbacks
 */

import { ContentItem, ProviderManifest, StreamSource } from '../../types/media';
import { storage } from '../storage';
import { HttpProviderAdapter } from '../providers/networkAdapter';

export interface SearchFilter {
  query: string;
  type?: string;
  genre?: string;
  year?: number;
}

export interface ProviderSearchResult {
  providerId: string;
  providerName: string;
  durationMs: number;
  items: ContentItem[];
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  error?: string;
}

export class SearchAggregator {
  /**
   * Title normalization for cross-provider deduplication
   */
  static normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/[^a-z0-9]/gi, '')
      .trim();
  }

  /**
   * Universal Parallel Network Search
   */
  static async search(
    filter: SearchFilter,
    abortSignal?: AbortSignal
  ): Promise<{
    items: ContentItem[];
    providerResults: ProviderSearchResult[];
    noProvidersConfigured?: boolean;
  }> {
    const rawQuery = filter.query.trim();
    if (!rawQuery) {
      return { items: [], providerResults: [] };
    }

    // 1. Gather all currently ENABLED network providers
    const enabledProviders = storage.getProviders().filter((p) => p.enabled && p.capabilities.includes('SEARCH'));

    if (enabledProviders.length === 0) {
      return {
        items: [],
        providerResults: [],
        noProvidersConfigured: true,
      };
    }

    // 2. Query each enabled provider over HTTP in parallel
    const searchPromises = enabledProviders.map((provider) =>
      this.queryNetworkProvider(provider, rawQuery, abortSignal)
    );

    const providerResults = await Promise.all(searchPromises);

    // 3. Deduplicate and Merge Results
    const mergedMap = new Map<string, ContentItem>();

    for (const res of providerResults) {
      if (res.status !== 'SUCCESS') continue;

      for (const item of res.items) {
        // Optional format filter
        if (filter.type && filter.type !== 'ALL' && item.type !== filter.type) {
          continue;
        }

        // Optional genre filter
        if (filter.genre && filter.genre !== 'ALL' && !item.genres.includes(filter.genre)) {
          continue;
        }

        const normKey = `${this.normalizeTitle(item.title)}_${item.year || 0}`;

        if (!mergedMap.has(normKey)) {
          mergedMap.set(normKey, {
            ...item,
            providerSourceIds: [...item.providerSourceIds],
            sources: item.sources ? [...item.sources] : [],
          });
        } else {
          // Merge metadata & sources
          const existing = mergedMap.get(normKey)!;

          for (const pid of item.providerSourceIds) {
            if (!existing.providerSourceIds.includes(pid)) {
              existing.providerSourceIds.push(pid);
            }
          }

          if (item.sources && item.sources.length > 0) {
            const existingSources = existing.sources || [];
            const newSources: StreamSource[] = [];

            for (const s of item.sources) {
              if (!existingSources.some((es) => es.id === s.id || es.url === s.url)) {
                newSources.push(s);
              }
            }
            existing.sources = [...existingSources, ...newSources];
          }

          if (!existing.backdropUrl && item.backdropUrl) {
            existing.backdropUrl = item.backdropUrl;
          }
          if (item.rating > existing.rating) {
            existing.rating = item.rating;
          }
        }
      }
    }

    const items = Array.from(mergedMap.values());
    return { items, providerResults };
  }

  /**
   * Real HTTP Query to Individual Provider Endpoint
   */
  private static async queryNetworkProvider(
    provider: ProviderManifest,
    query: string,
    externalSignal?: AbortSignal
  ): Promise<ProviderSearchResult> {
    const t0 = performance.now();
    const adapter = new HttpProviderAdapter(provider);

    // 8-second timeout controller
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), 8000);

    const onExternalAbort = () => {
      timeoutController.abort();
    };
    externalSignal?.addEventListener('abort', onExternalAbort);

    try {
      const items = await adapter.search(query, timeoutController.signal);
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      const durationMs = Math.max(5, Math.round(performance.now() - t0));

      return {
        providerId: provider.providerId,
        providerName: provider.name,
        durationMs,
        items,
        status: 'SUCCESS',
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      const durationMs = Math.round(performance.now() - t0);
      const isTimeout = (err as Error)?.name === 'AbortError' && !externalSignal?.aborted;

      return {
        providerId: provider.providerId,
        providerName: provider.name,
        durationMs,
        items: [],
        status: isTimeout ? 'TIMEOUT' : 'ERROR',
        error: isTimeout ? 'Network request timed out after 8000ms' : (err as Error).message,
      };
    }
  }
}
