/**
 * Aetheris Media Platform - Core Type Definitions
 * Specification for Modular Provider/Repository Engine, Media Playback & Local Persistence
 */

export type ProviderCapability =
  | 'SEARCH'
  | 'DETAILS'
  | 'EPISODES'
  | 'STREAMS'
  | 'SUBTITLES'
  | 'DOWNLOAD'
  | 'LIVE'
  | 'CAST';

export type ProviderPermission =
  | 'NETWORK'
  | 'METADATA'
  | 'PLAYBACK'
  | 'SUBTITLE'
  | 'DOWNLOAD'
  | 'STORAGE'
  | 'AUTHENTICATION';

export type ContentType =
  | 'MOVIE'
  | 'SERIES'
  | 'ANIME'
  | 'LIVE'
  | 'DOCUMENTARY';

export type StreamQuality = '4K' | '1080p' | '720p' | '480p' | 'Auto';

export type VideoCodec = 'H.264' | 'H.265' | 'VP9' | 'AV1';

export type StreamContainer = 'mp4' | 'm3u8' | 'mpd' | 'webm';

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  format: 'vtt' | 'srt';
  isDefault?: boolean;
}

export interface StreamSource {
  id: string;
  providerId: string;
  providerName: string;
  url: string;
  quality: StreamQuality;
  codec: VideoCodec;
  container: StreamContainer;
  audioLanguage: string;
  subtitles: SubtitleTrack[];
  durationSeconds?: number;
  fileSizeBytes?: number;
  bitrateKbps?: number;
  headers?: Record<string, string>;
  isLive?: boolean;
  permitsDownload: boolean;
  status?: 'healthy' | 'degraded' | 'offline';
  latencyMs?: number;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  overview?: string;
  durationMinutes: number;
  thumbnailUrl?: string;
  sources?: StreamSource[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface ContentItem {
  id: string;
  title: string;
  originalTitle?: string;
  overview: string;
  year: number;
  posterUrl: string;
  backdropUrl?: string;
  genres: string[];
  rating: number; // 0 - 10
  durationMinutes: number;
  type: ContentType;
  primaryProviderId: string;
  providerSourceIds: string[]; // Providers that resolve this content
  seasons?: Season[];
  sources?: StreamSource[];
  isLive?: boolean;
  liveChannelNumber?: number;
  epgCurrentProgram?: string;
  epgNextProgram?: string;
}

export interface ProviderManifest {
  providerId: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  language: string;
  country: string;
  capabilities: ProviderCapability[];
  supportedContentTypes: ContentType[];
  apiVersion: string;
  requiredPermissions: ProviderPermission[];
  grantedPermissions: ProviderPermission[];
  repositoryUrl: string;
  updateUrl?: string;
  sha256Signature: string;
  enabled: boolean;
  installedAt: number;
  lastTestedAt?: number;
  lastTestStatus?: 'PASS' | 'FAIL' | 'NOT_TESTED';
}

export interface RepositoryManifest {
  repositoryId: string;
  name: string;
  version: string;
  author: string;
  description: string;
  url: string;
  icon?: string;
  providers: ProviderManifest[];
  sha256Signature: string;
  lastSyncedAt: number;
}

export interface WatchProgress {
  contentId: string;
  title: string;
  posterUrl: string;
  type: ContentType;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  positionSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number;
  selectedAudioLanguage?: string;
  selectedSubtitleId?: string;
  completed: boolean;
}

export interface DownloadItem {
  id: string;
  contentId: string;
  title: string;
  subtitle?: string;
  posterUrl: string;
  streamUrl: string;
  quality: StreamQuality;
  providerId: string;
  fileSizeBytes: number;
  downloadedBytes: number;
  progressPercent: number;
  speedBytesPerSec: number;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  errorReason?: string;
  localBlobUrl?: string;
}

export interface ProviderLog {
  id: string;
  timestamp: number;
  providerId: string;
  level: 'info' | 'warn' | 'error';
  category: 'manifest' | 'network' | 'search' | 'stream' | 'sandbox';
  message: string;
}

export interface DiagnosticStepResult {
  step: 'Connection' | 'Manifest' | 'Authentication' | 'Search' | 'Details' | 'Episodes' | 'Source Extraction' | 'Subtitle' | 'Playback';
  status: 'PASS' | 'FAIL' | 'NOT_SUPPORTED' | 'TIMEOUT';
  durationMs: number;
  message: string;
  details?: string;
}

export interface ProviderDiagnosticReport {
  providerId: string;
  providerName: string;
  timestamp: number;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  steps: DiagnosticStepResult[];
}

export interface UserSettings {
  deviceMode: 'mobile' | 'tablet' | 'tv';
  preferredLanguage: string;
  preferredSubtitleLanguage: string;
  defaultQuality: StreamQuality;
  autoplayNext: boolean;
  hardwareAcceleration: boolean;
  wifiOnlyDownloads: boolean;
  maxDownloadConcurrency: number;
  subtitleDelayMs: number;
  subtitleFontSize: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleStyle: {
    textColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
    position: 'bottom' | 'top';
  };
  theme: 'cinematic-dark' | 'obsidian-black' | 'midnight-navy';
  animationQuality: 'full' | 'reduced';
  cacheRetentionDays: number;
}
