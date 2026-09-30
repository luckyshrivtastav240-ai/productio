/**
 * NexusStream - Real Network Source Resolver Engine
 *
 * Fetches stream sources over the network by calling getSources() on compatible
 * enabled provider adapters. Verifies reachability, normalizes metadata, and ranks sources.
 */

import { ContentItem, Episode, ProviderManifest, StreamQuality, StreamSource } from '../types/media';
import { storage } from './storage';
import { HttpProviderAdapter } from './providers/networkAdapter';

export class SourceResolver {
  private static QUALITY_SCORE: Record<StreamQuality, number> = {
    '4K': 400,
    '1080p': 300,
    '720p': 200,
    '480p': 100,
    'Auto': 250,
  };

  /**
   * Resolves and ranks all available sources for a title or episode across enabled network providers
   */
  static async resolveSources(
    item: ContentItem,
    episode?: Episode,
    signal?: AbortSignal
  ): Promise<{ sources: StreamSource[]; candidateCount: number; errors?: string[] }> {
    const enabledProviders = storage.getProviders().filter((p) => p.enabled && p.capabilities.includes('STREAMS'));
    const relevantProviders = enabledProviders.filter((p) =>
      item.providerSourceIds ? item.providerSourceIds.includes(p.providerId) : p.providerId === item.primaryProviderId
    );

    const collectedSources: StreamSource[] = [];
    const errors: string[] = [];

    // Query each provider adapter over network
    for (const provider of relevantProviders) {
      try {
        const adapter = new HttpProviderAdapter(provider);
        const remoteSources = await adapter.getSources(item.id, episode?.id, signal);

        if (Array.isArray(remoteSources) && remoteSources.length > 0) {
          for (const s of remoteSources) {
            collectedSources.push({
              ...s,
              providerId: provider.providerId,
              providerName: provider.name,
            });
          }
        }
      } catch (err: unknown) {
        errors.push(`Provider '${provider.name}' failed to return sources: ${(err as Error).message}`);
      }
    }

    // If item already carries pre-validated sources (e.g. from search response) and network returned empty, use them
    if (collectedSources.length === 0 && item.sources && item.sources.length > 0) {
      const allowed = item.sources.filter((s) => enabledProviders.some((p) => p.providerId === s.providerId));
      collectedSources.push(...allowed);
    }

    // Rank sources:
    // 1. Playable status (healthy > degraded > offline)
    // 2. Resolution quality (4K > 1080p > 720p > 480p)
    // 3. Response latency
    const ranked = collectedSources.sort((a, b) => {
      const statusWeightA = a.status === 'healthy' ? 1000 : a.status === 'degraded' ? 500 : 0;
      const statusWeightB = b.status === 'healthy' ? 1000 : b.status === 'degraded' ? 500 : 0;
      if (statusWeightA !== statusWeightB) {
        return statusWeightB - statusWeightA;
      }

      const qA = this.QUALITY_SCORE[a.quality] || 0;
      const qB = this.QUALITY_SCORE[b.quality] || 0;
      if (qA !== qB) {
        return qB - qA;
      }

      const latA = a.latencyMs ?? 100;
      const latB = b.latencyMs ?? 100;
      return latA - latB;
    });

    return {
      sources: ranked,
      candidateCount: collectedSources.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Automatic Fallback: Returns the next best alternative stream when current fails
   */
  static getFallbackSource(currentSourceId: string, availableSources: StreamSource[]): StreamSource | null {
    const candidates = availableSources.filter((s) => s.id !== currentSourceId && s.status !== 'offline');
    return candidates.length > 0 ? candidates[0] : null;
  }
}
