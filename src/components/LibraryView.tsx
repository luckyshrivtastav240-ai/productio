/**
 * Aetheris Media Platform - Personal Media Library
 * Shelves: Continue Watching, Favorites, Watchlist, History, Downloads
 */

import React, { useState } from 'react';
import { Play, Trash2, Pause, Download, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContentItem, DownloadItem, WatchProgress } from '../types/media';
import { storage } from '../services/storage';
import { downloadManager } from '../services/downloads/downloadManager';
import { MediaCard } from './MediaCard';

interface LibraryViewProps {
  watchProgressList: WatchProgress[];
  favorites: string[];
  watchlist: string[];
  downloads: DownloadItem[];
  allMedia: ContentItem[];
  onPlay: (item: ContentItem, episode?: undefined, source?: undefined) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleFavorite: (id: string) => void;
  onRefreshData: () => void;
}

type LibraryTab = 'continue' | 'favorites' | 'watchlist' | 'downloads' | 'history';

export const LibraryView: React.FC<LibraryViewProps> = ({
  watchProgressList,
  favorites,
  watchlist,
  downloads,
  allMedia,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('continue');

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'continue', label: 'Continue Watching', count: watchProgressList.length },
    { id: 'favorites', label: 'Favorites', count: favorites.length },
    { id: 'watchlist', label: 'Watchlist', count: watchlist.length },
    { id: 'downloads', label: 'Downloads', count: downloads.length },
    { id: 'history', label: 'History', count: storage.getHistory().length },
  ];

  const favoriteItems = allMedia.filter((m) => favorites.includes(m.id));
  const watchlistItems = allMedia.filter((m) => watchlist.includes(m.id));

  // Resume item from progress list
  const handleResumeProgress = (p: WatchProgress) => {
    const item = allMedia.find((m) => m.id === p.contentId);
    if (item) {
      onPlay(item);
    }
  };

  const handleRemoveProgress = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.removeWatchProgress(contentId);
    onRefreshData();
  };

  const handleClearHistory = () => {
    storage.clearHistory();
    onRefreshData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Personal Media Library</h1>
          <p className="mt-1 text-sm text-slate-400">
            Locally indexed watch progress, favorites, and downloaded offline packages.
          </p>
        </div>

        {activeTab === 'history' && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/10'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                activeTab === tab.id ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Continue Watching Tab */}
      {activeTab === 'continue' && (
        <div>
          {watchProgressList.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
              No titles currently in progress. Start playing any title to automatically track resume points.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {watchProgressList.map((p) => {
                const percent = Math.round((p.positionSeconds / (p.durationSeconds || 1)) * 100);
                const remainingSecs = Math.max(0, p.durationSeconds - p.positionSeconds);
                const remainingMins = Math.ceil(remainingSecs / 60);

                return (
                  <div
                    key={p.contentId}
                    onClick={() => handleResumeProgress(p)}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all hover:border-amber-400/40 hover:shadow-xl"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={p.posterUrl}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                          <Play className="h-4 w-4 fill-slate-950 ml-0.5" />
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemoveProgress(p.contentId, e)}
                        title="Remove from Continue Watching"
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-amber-300">
                        {p.title}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{remainingMins} min remaining</span>
                        <span className="font-mono tabular-nums">{percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteItems.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
              No favorites saved yet. Click the bookmark icon on any card to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {favoriteItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isFavorite={true}
                  onPlay={onPlay}
                  onOpenDetails={onOpenDetails}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div>
          {watchlistItems.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
              Your watchlist is currently empty.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {watchlistItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onPlay={onPlay}
                  onOpenDetails={onOpenDetails}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Downloads Tab */}
      {activeTab === 'downloads' && (
        <div className="space-y-3">
          {downloads.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
              No downloaded media found. Streams with offline download permissions can be downloaded for offline viewing.
            </div>
          ) : (
            downloads.map((d) => {
              const speedMB = (d.speedBytesPerSec / (1024 * 1024)).toFixed(1);
              const downloadedMB = Math.round(d.downloadedBytes / (1024 * 1024));
              const totalMB = Math.round(d.fileSizeBytes / (1024 * 1024));

              return (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900 p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={d.posterUrl}
                      alt={d.title}
                      referrerPolicy="no-referrer"
                      className="h-14 w-10 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{d.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-amber-400">{d.quality}</span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {downloadedMB} MB / {totalMB} MB
                        </span>
                        {d.status === 'downloading' && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-emerald-400">{speedMB} MB/s</span>
                          </>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10 sm:w-64">
                        <div
                          className={`h-full transition-all ${
                            d.status === 'completed'
                              ? 'bg-emerald-400'
                              : d.status === 'failed'
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${d.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {d.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready Offline
                      </span>
                    )}

                    {d.status === 'failed' && (
                      <span className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    )}

                    {d.status === 'downloading' && (
                      <button
                        onClick={() => downloadManager.pauseDownload(d.id)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => downloadManager.cancelDownload(d.id)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {storage.getHistory().length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
              Playback history is clean.
            </div>
          ) : (
            storage.getHistory().map((id) => {
              const item = allMedia.find((m) => m.id === id);
              if (!item) return null;
              return (
                <div
                  key={id}
                  onClick={() => onOpenDetails(item)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-3 hover:border-amber-400/40"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="h-10 w-8 rounded object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-white">{item.title}</h4>
                      <span className="text-xs text-slate-500">{item.year} · {item.genres.join(', ')}</span>
                    </div>
                  </div>
                  <Play className="h-4 w-4 text-slate-400 hover:text-amber-400" />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
