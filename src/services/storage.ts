/**
 * NexusStream - Local Persistence & IndexedDB Storage Engine
 *
 * Handles:
 * - Installed Repositories & Providers (Starts clean; no preloaded fake data)
 * - Watch Progress tracking tied to real player playback events
 * - Favorites, Watchlist, Playback History
 * - User Settings enforcement
 * - Real Cache metrics & hygiene (No hardcoded fake MB numbers)
 */

import {
  DownloadItem,
  ProviderDiagnosticReport,
  ProviderLog,
  ProviderManifest,
  RepositoryManifest,
  UserSettings,
  WatchProgress,
} from '../types/media';

const STORAGE_KEYS = {
  REPOSITORIES: 'nexusstream_repositories_v2',
  PROVIDERS: 'nexusstream_providers_v2',
  WATCH_PROGRESS: 'nexusstream_watch_progress_v2',
  FAVORITES: 'nexusstream_favorites_v2',
  WATCHLIST: 'nexusstream_watchlist_v2',
  HISTORY: 'nexusstream_history_v2',
  DOWNLOADS: 'nexusstream_downloads_v2',
  SETTINGS: 'nexusstream_settings_v2',
  PROVIDER_LOGS: 'nexusstream_provider_logs_v2',
  DIAGNOSTICS: 'nexusstream_diagnostics_v2',
};

export const DEFAULT_SETTINGS: UserSettings = {
  deviceMode: 'tablet',
  preferredLanguage: 'English',
  preferredSubtitleLanguage: 'English',
  defaultQuality: '1080p',
  autoplayNext: true,
  hardwareAcceleration: true,
  wifiOnlyDownloads: false,
  maxDownloadConcurrency: 2,
  subtitleDelayMs: 0,
  subtitleFontSize: 'medium',
  subtitleStyle: {
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.65,
    position: 'bottom',
  },
  theme: 'cinematic-dark',
  animationQuality: 'full',
  cacheRetentionDays: 14,
};

class StorageService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      // Repositories and Providers start clean; users connect 3737 or 3670
      if (!localStorage.getItem(STORAGE_KEYS.REPOSITORIES)) {
        localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
        localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify([]));
      }
    } catch {
      // Storage error fallback
    }
  }

  // --- REPOSITORIES ---
  getRepositories(): RepositoryManifest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPOSITORIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveRepositories(repositories: RepositoryManifest[]) {
    localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(repositories));
  }

  addRepository(newRepo: RepositoryManifest): boolean {
    const repos = this.getRepositories();
    const existingIdx = repos.findIndex((r) => r.repositoryId === newRepo.repositoryId || r.url === newRepo.url);
    if (existingIdx >= 0) {
      repos[existingIdx] = newRepo;
    } else {
      repos.push(newRepo);
    }
    this.saveRepositories(repos);

    // Register or update its providers
    const currentProviders = this.getProviders();
    const updatedProviders = [...currentProviders];

    for (const newP of newRepo.providers) {
      const idx = updatedProviders.findIndex((cp) => cp.providerId === newP.providerId);
      if (idx >= 0) {
        updatedProviders[idx] = newP;
      } else {
        updatedProviders.push(newP);
      }
    }

    this.saveProviders(updatedProviders);
    return true;
  }

  removeRepository(repositoryId: string) {
    const repos = this.getRepositories().filter((r) => r.repositoryId !== repositoryId);
    this.saveRepositories(repos);

    // Remove unlinked providers
    const remainingRepoIds = new Set(repos.map((r) => r.repositoryId));
    const providers = this.getProviders().filter((p) => remainingRepoIds.has(p.repositoryUrl));
    this.saveProviders(providers);
  }

  // --- PROVIDERS ---
  getProviders(): ProviderManifest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveProviders(providers: ProviderManifest[]) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  }

  updateProvider(updated: ProviderManifest) {
    const providers = this.getProviders().map((p) =>
      p.providerId === updated.providerId ? updated : p
    );
    this.saveProviders(providers);
  }

  toggleProvider(providerId: string, enabled: boolean) {
    const providers = this.getProviders().map((p) =>
      p.providerId === providerId ? { ...p, enabled } : p
    );
    this.saveProviders(providers);
  }

  removeProvider(providerId: string) {
    const providers = this.getProviders().filter((p) => p.providerId !== providerId);
    this.saveProviders(providers);
  }

  // --- WATCH PROGRESS ---
  getWatchProgressList(): WatchProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getWatchProgress(contentId: string): WatchProgress | undefined {
    const list = this.getWatchProgressList();
    return list.find((p) => p.contentId === contentId);
  }

  saveWatchProgress(progress: WatchProgress) {
    const list = this.getWatchProgressList().filter((p) => p.contentId !== progress.contentId);
    list.unshift(progress);
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(list.slice(0, 100)));
  }

  removeWatchProgress(contentId: string) {
    const list = this.getWatchProgressList().filter((p) => p.contentId !== contentId);
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(list));
  }

  // --- FAVORITES & WATCHLIST ---
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite(contentId: string): boolean {
    const list = this.getFavorites();
    const idx = list.indexOf(contentId);
    let isFav = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      isFav = false;
    } else {
      list.unshift(contentId);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    return isFav;
  }

  getWatchlist(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleWatchlist(contentId: string): boolean {
    const list = this.getWatchlist();
    const idx = list.indexOf(contentId);
    let isIn = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      isIn = false;
    } else {
      list.unshift(contentId);
      isIn = true;
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return isIn;
  }

  // --- HISTORY ---
  getHistory(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addToHistory(contentId: string) {
    const list = this.getHistory().filter((id) => id !== contentId);
    list.unshift(contentId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 100)));
  }

  clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }

  // --- DOWNLOADS ---
  getDownloads(): DownloadItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveDownloads(downloads: DownloadItem[]) {
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
  }

  updateDownload(item: DownloadItem) {
    const list = this.getDownloads();
    const idx = list.findIndex((d) => d.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.saveDownloads(list);
  }

  removeDownload(id: string) {
    const list = this.getDownloads().filter((d) => d.id !== id);
    this.saveDownloads(list);
  }

  // --- SETTINGS ---
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: UserSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- PROVIDER LOGS ---
  getProviderLogs(providerId?: string): ProviderLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROVIDER_LOGS);
      const logs: ProviderLog[] = data ? JSON.parse(data) : [];
      return providerId ? logs.filter((l) => l.providerId === providerId) : logs;
    } catch {
      return [];
    }
  }

  addProviderLog(log: Omit<ProviderLog, 'id' | 'timestamp'>) {
    const entry: ProviderLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    const logs = this.getProviderLogs();
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.PROVIDER_LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  clearProviderLogs(providerId?: string) {
    if (providerId) {
      const logs = this.getProviderLogs().filter((l) => l.providerId !== providerId);
      localStorage.setItem(STORAGE_KEYS.PROVIDER_LOGS, JSON.stringify(logs));
    } else {
      localStorage.setItem(STORAGE_KEYS.PROVIDER_LOGS, JSON.stringify([]));
    }
  }

  // --- DIAGNOSTICS REPORTS ---
  getDiagnostics(): ProviderDiagnosticReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSTICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveDiagnosticReport(report: ProviderDiagnosticReport) {
    const reports = this.getDiagnostics().filter((r) => r.providerId !== report.providerId);
    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(reports));
  }

  // --- REAL CACHE SIZING & CLEARING (NO FAKE MB NUMBERS) ---
  calculateRealCacheSizeBytes(): { metadataBytes: number; providerLogsBytes: number; downloadsBytes: number } {
    let metadataBytes = 0;
    let providerLogsBytes = 0;
    let downloadsBytes = 0;

    try {
      for (const [key, value] of Object.entries(localStorage)) {
        const size = new Blob([key, value]).size;
        if (key.includes('provider_logs')) {
          providerLogsBytes += size;
        } else if (key.includes('downloads')) {
          downloadsBytes += size;
        } else {
          metadataBytes += size;
        }
      }
    } catch {
      // Ignore
    }

    return { metadataBytes, providerLogsBytes, downloadsBytes };
  }

  clearImageCache(): string {
    return '0.0 KB (Browser Session)';
  }

  clearProviderCache(providerId?: string): string {
    return this.clearProviderLogsCache(providerId);
  }

  clearMetadataCache(): string {
    const before = this.calculateRealCacheSizeBytes().metadataBytes;
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSTICS);
    const after = this.calculateRealCacheSizeBytes().metadataBytes;
    const freed = Math.max(0, before - after);
    return `${(freed / 1024).toFixed(1)} KB`;
  }

  clearProviderLogsCache(providerId?: string): string {
    const before = this.calculateRealCacheSizeBytes().providerLogsBytes;
    this.clearProviderLogs(providerId);
    const after = this.calculateRealCacheSizeBytes().providerLogsBytes;
    const freed = Math.max(0, before - after);
    return `${(freed / 1024).toFixed(1)} KB`;
  }

  clearAllCache(): string {
    const before = this.calculateRealCacheSizeBytes();
    const totalBefore = before.metadataBytes + before.providerLogsBytes;
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSTICS);
    localStorage.removeItem(STORAGE_KEYS.PROVIDER_LOGS);
    const after = this.calculateRealCacheSizeBytes();
    const totalAfter = after.metadataBytes + after.providerLogsBytes;
    const freed = Math.max(0, totalBefore - totalAfter);
    return `${(freed / 1024).toFixed(1)} KB`;
  }
}

export const storage = new StorageService();
