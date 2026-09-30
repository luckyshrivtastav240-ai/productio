/**
 * NexusStream - Real Network Provider Adapter Engine
 *
 * Each provider connects over HTTP to its real configured endpoints:
 * - search(query): executes real HTTP GET /search?q=...
 * - getDetails(id): executes real HTTP GET /details/:id
 * - getEpisodes(id): executes real HTTP GET /episodes/:id
 * - getSources(id, episodeId): executes real HTTP GET /sources/:id
 * - getLiveContent(): executes real HTTP GET /live
 * - healthCheck(): executes real HTTP GET /health
 *
 * Strictly NO local catalog filtering or simulated delays.
 */

import { ContentItem, Episode, ProviderManifest, StreamSource, SubtitleTrack } from '../../types/media';

export interface ProviderAdapter {
  manifest: ProviderManifest;
  search(query: string, signal?: AbortSignal): Promise<ContentItem[]>;
  getDetails(contentId: string, signal?: AbortSignal): Promise<ContentItem | null>;
  getEpisodes(seriesId: string, signal?: AbortSignal): Promise<Episode[]>;
  getSources(contentId: string, episodeId?: string, signal?: AbortSignal): Promise<StreamSource[]>;
  getLiveContent(signal?: AbortSignal): Promise<ContentItem[]>;
  healthCheck(signal?: AbortSignal): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number; error?: string }>;
}

export class HttpProviderAdapter implements ProviderAdapter {
  public manifest: ProviderManifest;
  private baseUrl: string;

  constructor(manifest: ProviderManifest) {
    this.manifest = manifest;
    // Base URL from manifest or endpoint
    this.baseUrl = (manifest as any).baseUrl || `/api/providers/${manifest.providerId.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
  }

  private resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async healthCheck(signal?: AbortSignal): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number; error?: string }> {
    const t0 = performance.now();
    try {
      const url = this.resolveUrl('/health');
      const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      const latencyMs = Math.max(4, Math.round(performance.now() - t0));

      if (res.ok) {
        return { status: 'UP', latencyMs };
      }
      return { status: 'DOWN', latencyMs, error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: unknown) {
      return {
        status: 'DOWN',
        latencyMs: Math.round(performance.now() - t0),
        error: (err as Error).message || 'Connection failed',
      };
    }
  }

  async search(query: string, signal?: AbortSignal): Promise<ContentItem[]> {
    if (!this.manifest.capabilities.includes('SEARCH')) {
      return [];
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const url = this.resolveUrl(`/search?q=${encodeURIComponent(trimmed)}`);
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      throw new Error(`Provider '${this.manifest.name}' search returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.items)) {
      return [];
    }

    // Normalize to NexusStream ContentItem
    return data.items.map((item: any) => ({
      ...item,
      primaryProviderId: this.manifest.providerId,
      providerSourceIds: [this.manifest.providerId],
    }));
  }

  async getDetails(contentId: string, signal?: AbortSignal): Promise<ContentItem | null> {
    if (!this.manifest.capabilities.includes('DETAILS')) {
      return null;
    }

    const url = this.resolveUrl(`/details/${encodeURIComponent(contentId)}`);
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.success || !data.item) {
      return null;
    }

    return {
      ...data.item,
      primaryProviderId: this.manifest.providerId,
      providerSourceIds: [this.manifest.providerId],
    };
  }

  async getEpisodes(seriesId: string, signal?: AbortSignal): Promise<Episode[]> {
    if (!this.manifest.capabilities.includes('EPISODES')) {
      return [];
    }

    const url = this.resolveUrl(`/episodes/${encodeURIComponent(seriesId)}`);
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.seasons)) {
      return [];
    }

    return data.seasons.flatMap((s: any) => s.episodes || []);
  }

  async getSources(contentId: string, episodeId?: string, signal?: AbortSignal): Promise<StreamSource[]> {
    if (!this.manifest.capabilities.includes('STREAMS')) {
      return [];
    }

    const endpoint = episodeId
      ? `/sources/${encodeURIComponent(contentId)}?episodeId=${encodeURIComponent(episodeId)}`
      : `/sources/${encodeURIComponent(contentId)}`;

    const url = this.resolveUrl(endpoint);
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.sources)) {
      return [];
    }

    return data.sources.map((s: any) => ({
      ...s,
      providerId: this.manifest.providerId,
      providerName: this.manifest.name,
    }));
  }

  async getLiveContent(signal?: AbortSignal): Promise<ContentItem[]> {
    if (!this.manifest.capabilities.includes('LIVE')) {
      return [];
    }

    const url = this.resolveUrl('/live');
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.channels)) {
      return [];
    }

    return data.channels.map((c: any) => ({
      ...c,
      primaryProviderId: this.manifest.providerId,
      providerSourceIds: [this.manifest.providerId],
    }));
  }
}
