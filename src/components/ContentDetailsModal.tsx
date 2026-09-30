/**
 * Aetheris Media Platform - Content Details & Multi-Source Inspector Modal
 * Displays complete metadata, episodic seasons, and all resolved streams across providers.
 */

import React, { useState } from 'react';
import { X, Play, Download, Bookmark, Check, ShieldCheck, Film, HardDrive, Clock, Radio } from 'lucide-react';
import { ContentItem, Episode, StreamSource } from '../types/media';
import { downloadManager } from '../services/downloads/downloadManager';

interface ContentDetailsModalProps {
  item: ContentItem;
  sources: StreamSource[];
  isFavorite: boolean;
  onPlay: (item: ContentItem, episode?: Episode, source?: StreamSource) => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

export const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({
  item,
  sources,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onClose,
}) => {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = async (source: StreamSource) => {
    const res = await downloadManager.startDownload(item, source);
    if (res.success) {
      setDownloadNotice(`Download started for ${source.quality}! Check Library > Downloads.`);
    } else {
      setDownloadNotice(`Download denied: ${res.error}`);
    }
    setTimeout(() => setDownloadNotice(null), 4500);
  };

  const seasons = item.seasons || [];
  const currentSeason = seasons[selectedSeasonIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-300 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Scroll Container */}
        <div className="overflow-y-auto">
          {/* Header Banner */}
          <div className="relative h-64 w-full bg-slate-950 sm:h-80">
            <img
              src={item.backdropUrl || item.posterUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

            {/* Quick Actions in Banner */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-amber-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Verified Provider Source
                  </span>
                  <span>·</span>
                  <span>{item.year}</span>
                  <span>·</span>
                  <span>{item.genres.join(', ')}</span>
                </div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{item.title}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(item, undefined, sources[0])}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Play</span>
                </button>
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    isFavorite
                      ? 'border-amber-400/40 bg-amber-400/20 text-amber-300'
                      : 'border-white/10 bg-black/40 text-slate-300 hover:text-white'
                  }`}
                >
                  {isFavorite ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {/* Download Status Notification */}
            {downloadNotice && (
              <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-300">
                {downloadNotice}
              </div>
            )}

            {/* Synopsis */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-200">Synopsis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.overview}</p>
            </div>

            {/* Resolved Stream Sources Section */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Film className="h-4 w-4 text-amber-400" />
                  Available Stream Sources ({sources.length})
                </h3>
                <span className="text-xs text-slate-400">Ranked by quality & latency</span>
              </div>

              <div className="space-y-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3.5 transition-colors hover:border-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold text-amber-400">
                        {source.quality}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{source.providerName}</span>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs text-slate-400 uppercase">{source.codec} / {source.container}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{source.audioLanguage}</span>
                          {source.latencyMs && (
                            <>
                              <span>·</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                {source.latencyMs}ms response
                              </span>
                            </>
                          )}
                          {source.fileSizeBytes && (
                            <>
                              <span>·</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                {Math.round(source.fileSizeBytes / (1024 * 1024))} MB
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {source.permitsDownload ? (
                        <button
                          onClick={() => handleDownload(source)}
                          title="Download stream"
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No download</span>
                      )}

                      <button
                        onClick={() => onPlay(item, undefined, source)}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300"
                      >
                        <Play className="h-3.5 w-3.5 fill-slate-950" />
                        <span>Stream</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Episodic Content (If Series) */}
            {seasons.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Episodes</h3>
                  {seasons.length > 1 && (
                    <div className="flex gap-2">
                      {seasons.map((s, idx) => (
                        <button
                          key={s.seasonNumber}
                          onClick={() => setSelectedSeasonIndex(idx)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            selectedSeasonIndex === idx ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          Season {s.seasonNumber}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {currentSeason?.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlay(item, ep)}
                      className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3 transition-colors hover:border-amber-400/40 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-400 group-hover:bg-amber-400 group-hover:text-slate-950">
                          {ep.episodeNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white group-hover:text-amber-300">{ep.title}</h4>
                          <p className="line-clamp-1 text-xs text-slate-400">{ep.overview}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 tabular-nums">{ep.durationMinutes} min</span>
                        <Play className="h-4 w-4 text-slate-400 group-hover:text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
