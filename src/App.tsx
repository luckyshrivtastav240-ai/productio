/**
 * Aetheris Media Platform - Main Application Controller
 * High-fidelity, production-grade modular media platform with real providers,
 * real streams, custom cinema player, sandbox security, and multi-form-factor support.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
  NavTab,
} from './components/Navigation';
import { HeroShowcase } from './components/HeroShowcase';
import { MediaCard } from './components/MediaCard';
import { PlayerModal } from './components/PlayerModal';
import { ContentDetailsModal } from './components/ContentDetailsModal';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { LiveTvView } from './components/LiveTvView';
import { ProviderCenter } from './components/ProviderCenter/ProviderCenter';
import { SettingsView } from './components/SettingsView';
import { CastModal } from './components/CastModal';
import { TvRemoteControl } from './components/TvRemoteControl';

import {
  ContentItem,
  Episode,
  StreamSource,
  UserSettings,
  WatchProgress,
  ProviderManifest,
  RepositoryManifest,
  DownloadItem,
} from './types/media';
import { storage } from './services/storage';
import { SourceResolver } from './services/sourceResolver';
import { downloadManager } from './services/downloads/downloadManager';
import { HttpProviderAdapter } from './services/providers/networkAdapter';
import { Sparkles, Film, Radio, ShieldCheck, Loader2 } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('discover');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'tv'>('tablet');

  // Persistence & Platform State
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [allMedia, setAllMedia] = useState<ContentItem[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderManifest[]>(storage.getProviders());
  const [repositories, setRepositories] = useState<RepositoryManifest[]>(storage.getRepositories());
  const [watchProgressList, setWatchProgressList] = useState<WatchProgress[]>(storage.getWatchProgressList());
  const [favorites, setFavorites] = useState<string[]>(storage.getFavorites());
  const [watchlist, setWatchlist] = useState<string[]>(storage.getWatchlist());
  const [downloads, setDownloads] = useState<DownloadItem[]>(storage.getDownloads());

  // Active Modals & Overlay State
  const [activePlayerItem, setActivePlayerItem] = useState<ContentItem | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | undefined>(undefined);
  const [activeStreamSource, setActiveStreamSource] = useState<StreamSource | undefined>(undefined);
  const [activeSourcesList, setActiveSourcesList] = useState<StreamSource[]>([]);

  const [inspectingItem, setInspectingItem] = useState<ContentItem | null>(null);
  const [inspectingSources, setInspectingSources] = useState<StreamSource[]>([]);

  const [isCasting, setIsCasting] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);

  // TV D-Pad Focus State
  const [tvFocusedIndex, setTvFocusedIndex] = useState(0);

  // Fetch real media over network from all enabled providers
  const loadProviderMedia = useCallback(async (currentProviders: ProviderManifest[]) => {
    const enabled = currentProviders.filter((p) => p.enabled);
    if (enabled.length === 0) {
      setAllMedia([]);
      return;
    }

    setIsMediaLoading(true);
    try {
      const results = await Promise.allSettled(
        enabled.map(async (provider) => {
          const adapter = new HttpProviderAdapter(provider);
          const items: ContentItem[] = [];
          if (provider.capabilities.includes('SEARCH')) {
            const catalog = await adapter.search('');
            items.push(...catalog);
          }
          if (provider.capabilities.includes('LIVE')) {
            const live = await adapter.getLiveContent();
            items.push(...live);
          }
          return items;
        })
      );

      const mergedMap = new Map<string, ContentItem>();
      for (const res of results) {
        if (res.status === 'fulfilled') {
          for (const item of res.value) {
            if (!mergedMap.has(item.id)) {
              mergedMap.set(item.id, { ...item });
            } else {
              const existing = mergedMap.get(item.id)!;
              for (const pid of item.providerSourceIds) {
                if (!existing.providerSourceIds.includes(pid)) {
                  existing.providerSourceIds.push(pid);
                }
              }
              if (item.sources && item.sources.length > 0) {
                const existingSources = existing.sources || [];
                for (const s of item.sources) {
                  if (!existingSources.some((es) => es.id === s.id || es.url === s.url)) {
                    existingSources.push(s);
                  }
                }
                existing.sources = existingSources;
              }
            }
          }
        }
      }
      setAllMedia(Array.from(mergedMap.values()));
    } catch {
      // Network error handled gracefully
    } finally {
      setIsMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviderMedia(providers);
  }, [providers, loadProviderMedia]);

  // Refresh dynamic state
  const refreshStorageData = useCallback(() => {
    setSettings(storage.getSettings());
    const currentProvs = storage.getProviders();
    setProviders(currentProvs);
    setRepositories(storage.getRepositories());
    setWatchProgressList(storage.getWatchProgressList());
    setFavorites(storage.getFavorites());
    setWatchlist(storage.getWatchlist());
    setDownloads(storage.getDownloads());
    loadProviderMedia(currentProvs);
  }, [loadProviderMedia]);

  // Subscribe to real background downloads
  useEffect(() => {
    const unsub = downloadManager.subscribe(() => {
      setDownloads(storage.getDownloads());
    });
    return unsub;
  }, []);

  // Filter media based on enabled providers
  const enabledProviderIds = providers.filter((p) => p.enabled).map((p) => p.providerId);
  const visibleMedia = allMedia.filter((item) =>
    item.providerSourceIds.some((pid) => enabledProviderIds.includes(pid))
  );

  const featuredItem = visibleMedia.find((m) => m.id === 'tears-of-steel-2012') || visibleMedia[0];
  const openCinemaItems = visibleMedia.filter((m) => m.type === 'MOVIE' && m.id !== featuredItem?.id);
  const seriesItems = visibleMedia.filter((m) => m.type === 'SERIES');
  const liveChannels = visibleMedia.filter((m) => m.type === 'LIVE');

  // Launch Player Handler
  const handlePlayMedia = async (item: ContentItem, episode?: Episode, specificSource?: StreamSource) => {
    const { sources } = await SourceResolver.resolveSources(item, episode);
    if (sources.length === 0) {
      alert('No active streams available from enabled providers for this title.');
      return;
    }
    storage.addToHistory(item.id);
    setActiveSourcesList(sources);
    setActiveStreamSource(specificSource || sources[0]);
    setActiveEpisode(episode);
    setActivePlayerItem(item);
    setInspectingItem(null);
  };

  // Inspect Details Handler
  const handleOpenDetails = async (item: ContentItem) => {
    const { sources } = await SourceResolver.resolveSources(item);
    setInspectingSources(sources);
    setInspectingItem(item);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    storage.toggleFavorite(id);
    setFavorites(storage.getFavorites());
  };

  // Toggle Cast Receiver
  const handleToggleCast = (deviceName: string) => {
    setIsCasting(!isCasting);
  };

  // TV Mode D-Pad Keyboard Navigation Listener
  useEffect(() => {
    if (deviceMode !== 'tv') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePlayerItem || inspectingItem) return;

      const totalItems = visibleMedia.length;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTvFocusedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTvFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTvFocusedIndex((prev) => (prev + 4) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTvFocusedIndex((prev) => (prev - 4 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = visibleMedia[tvFocusedIndex];
        if (selected) {
          handlePlayMedia(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deviceMode, visibleMedia, tvFocusedIndex, activePlayerItem, inspectingItem]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Device Form Factor Container Wrapper */}
      <div
        className={`mx-auto min-h-screen transition-all duration-300 ${
          deviceMode === 'mobile'
            ? 'max-w-md shadow-2xl border-x border-white/5'
            : deviceMode === 'tv'
            ? 'w-full px-2 sm:px-4'
            : 'w-full'
        }`}
      >
        {/* Universal Top Navigation Bar */}
        <Navigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
          onOpenCast={() => setShowCastModal(true)}
          isCasting={isCasting}
        />

        {/* Tab 1: Discover (Home Screen) */}
        {currentTab === 'discover' && (
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Loading State */}
            {isMediaLoading && visibleMedia.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mb-4" />
                <p className="text-sm font-medium text-slate-200">Connecting to enabled provider endpoints...</p>
                <p className="text-xs text-slate-500 mt-1">Retrieving live media manifests over HTTP</p>
              </div>
            )}

            {/* No Active Providers Empty State */}
            {!isMediaLoading && visibleMedia.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center my-8 shadow-2xl backdrop-blur-md">
                <Radio className="mx-auto mb-4 h-12 w-12 text-amber-400/80" />
                <h2 className="text-2xl font-bold text-white mb-2">No Active Network Provider Configured</h2>
                <p className="max-w-lg mx-auto text-sm text-slate-400 mb-6 leading-relaxed">
                  NexusStream connects directly to authorized media provider repositories.
                  Connect repository code <strong className="text-amber-300 font-mono">3737</strong> (Open Cinema Core) or <strong className="text-amber-300 font-mono">3670</strong> (Public Heritage & Space) to install and enable verified open media providers.
                </p>
                <button
                  onClick={() => setCurrentTab('providers')}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 shadow-lg shadow-amber-400/10 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Open Provider Center (Enter Code)
                </button>
              </div>
            )}

            {/* Featured Hero Showcase */}
            {featuredItem && (
              <HeroShowcase
                item={featuredItem}
                watchProgress={storage.getWatchProgress(featuredItem.id)}
                isFavorite={favorites.includes(featuredItem.id)}
                onPlay={handlePlayMedia}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={handleOpenDetails}
              />
            )}

            {/* Continue Watching Shelf (Only renders when real progress exists) */}
            {watchProgressList.length > 0 && (
              <section className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white tracking-tight sm:text-xl">Continue Watching</h2>
                  <button
                    onClick={() => setCurrentTab('library')}
                    className="text-xs font-medium text-amber-400 hover:underline"
                  >
                    View Library ({watchProgressList.length})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {watchProgressList.slice(0, 5).map((p) => {
                    const item = allMedia.find((m) => m.id === p.contentId);
                    if (!item) return null;
                    return (
                      <MediaCard
                        key={p.contentId}
                        item={item}
                        watchProgress={p}
                        isFavorite={favorites.includes(item.id)}
                        onPlay={handlePlayMedia}
                        onOpenDetails={handleOpenDetails}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Verified Open Cinema Section */}
            {openCinemaItems.length > 0 && (
              <section className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight sm:text-xl">
                      Verified Open Cinema & Archival Films
                    </h2>
                    <p className="text-xs text-slate-400">
                      Licensed 4K and 1080p open-source productions with multi-language subtitle tracks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {openCinemaItems.map((item, idx) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      watchProgress={storage.getWatchProgress(item.id)}
                      isFavorite={favorites.includes(item.id)}
                      onPlay={handlePlayMedia}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      tvFocused={deviceMode === 'tv' && tvFocusedIndex === idx}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Live TV Preview Shelf */}
            {liveChannels.length > 0 && (
              <section className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>Live Aerospace Feeds</span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight sm:text-xl">
                      Live Science & Satellite Observation
                    </h2>
                  </div>
                  <button
                    onClick={() => setCurrentTab('live')}
                    className="text-xs font-medium text-amber-400 hover:underline"
                  >
                    All Channels & EPG
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {liveChannels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => handlePlayMedia(channel)}
                      className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4 transition-all hover:border-amber-400/40 hover:shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={channel.posterUrl}
                          alt={channel.title}
                          referrerPolicy="no-referrer"
                          className="h-16 w-12 rounded object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                              LIVE
                            </span>
                            <span className="text-xs font-mono text-slate-400">CH {channel.liveChannelNumber}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 mt-1">
                            {channel.title}
                          </h4>
                          <p className="line-clamp-1 text-xs text-slate-400 mt-0.5">
                            {channel.epgCurrentProgram}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Creative Commons Animation & Episodic Content */}
            {seriesItems.length > 0 && (
              <section className="mb-10">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight sm:text-xl">
                    Episodic Series & Animation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Community-funded and open-license episodic productions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {seriesItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      watchProgress={storage.getWatchProgress(item.id)}
                      isFavorite={favorites.includes(item.id)}
                      onPlay={handlePlayMedia}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}
          </main>
        )}

        {/* Tab 2: Universal Search */}
        {currentTab === 'search' && (
          <SearchView
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}

        {/* Tab 3: Personal Library */}
        {currentTab === 'library' && (
          <LibraryView
            watchProgressList={watchProgressList}
            favorites={favorites}
            watchlist={watchlist}
            downloads={downloads}
            allMedia={allMedia}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
            onToggleFavorite={handleToggleFavorite}
            onRefreshData={refreshStorageData}
          />
        )}

        {/* Tab 4: Live TV & EPG */}
        {currentTab === 'live' && (
          <LiveTvView
            liveChannels={liveChannels}
            onPlay={handlePlayMedia}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {/* Tab 5: Provider Center */}
        {currentTab === 'providers' && (
          <ProviderCenter
            providers={providers}
            repositories={repositories}
            onRefresh={refreshStorageData}
          />
        )}

        {/* Tab 6: Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
          />
        )}

        {/* Active Cinema Media Player Modal */}
        {activePlayerItem && (
          <PlayerModal
            item={activePlayerItem}
            episode={activeEpisode}
            initialSource={activeStreamSource}
            availableSources={activeSourcesList}
            userSettings={settings}
            onClose={() => {
              setActivePlayerItem(null);
              setActiveEpisode(undefined);
              setActiveStreamSource(undefined);
              refreshStorageData();
            }}
          />
        )}

        {/* Content Details & Source Inspector Modal */}
        {inspectingItem && (
          <ContentDetailsModal
            item={inspectingItem}
            sources={inspectingSources}
            isFavorite={favorites.includes(inspectingItem.id)}
            onPlay={handlePlayMedia}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setInspectingItem(null)}
          />
        )}

        {/* Cast Receiver Modal */}
        {showCastModal && (
          <CastModal
            isCasting={isCasting}
            currentItem={activePlayerItem || featuredItem}
            onToggleCast={handleToggleCast}
            onClose={() => setShowCastModal(false)}
          />
        )}

        {/* Android TV Mode On-Screen D-Pad Remote Simulator */}
        {deviceMode === 'tv' && (
          <TvRemoteControl
            onUp={() => setTvFocusedIndex((prev) => (prev - 4 + visibleMedia.length) % visibleMedia.length)}
            onDown={() => setTvFocusedIndex((prev) => (prev + 4) % visibleMedia.length)}
            onLeft={() => setTvFocusedIndex((prev) => (prev - 1 + visibleMedia.length) % visibleMedia.length)}
            onRight={() => setTvFocusedIndex((prev) => (prev + 1) % visibleMedia.length)}
            onSelect={() => {
              const selected = visibleMedia[tvFocusedIndex];
              if (selected) handlePlayMedia(selected);
            }}
            onBack={() => {
              if (activePlayerItem) setActivePlayerItem(null);
              else if (inspectingItem) setInspectingItem(null);
              else setCurrentTab('discover');
            }}
          />
        )}
      </div>
    </div>
  );
}
