/**
 * Aetheris Media Platform - Cinematic Hero Showcase
 * Features measured contrast scrims, unboxed metadata, and direct stream launch
 */

import React from 'react';
import { Play, Info, Bookmark, Check, ShieldCheck } from 'lucide-react';
import { ContentItem, WatchProgress } from '../types/media';

interface HeroShowcaseProps {
  item: ContentItem;
  watchProgress?: WatchProgress;
  isFavorite: boolean;
  onPlay: (item: ContentItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (item: ContentItem) => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  item,
  watchProgress,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const resumePercent = watchProgress
    ? Math.round((watchProgress.positionSeconds / (watchProgress.durationSeconds || 1)) * 100)
    : 0;

  return (
    <div className="relative mb-8 h-[480px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 sm:h-[540px]">
      {/* Background Cinematic Artwork with measured scrim */}
      <img
        src={item.backdropUrl || item.posterUrl}
        alt={item.title}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover object-center brightness-75 transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/90 via-[#0B0E14]/40 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 max-w-3xl p-6 sm:p-10">
        {/* Unboxed Metadata Line with typographic separators */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-amber-400/90">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified Open Core
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{item.year}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{item.genres.join(', ')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300">Rating: {item.rating.toFixed(1)}/10</span>
          {item.durationMinutes > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{item.durationMinutes} min</span>
            </>
          )}
        </div>

        {/* Cinematic Title */}
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          {item.title}
        </h1>

        {/* Narrative Overview */}
        <p className="mb-6 line-clamp-3 text-sm text-slate-300 leading-relaxed sm:text-base">
          {item.overview}
        </p>

        {/* Watch Progress Resumption Bar */}
        {resumePercent > 0 && (
          <div className="mb-4 max-w-sm">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Resume playback ({resumePercent}%)</span>
              <span className="tabular-nums">
                {Math.floor(watchProgress!.positionSeconds / 60)}m / {Math.floor(watchProgress!.durationSeconds / 60)}m
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${resumePercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onPlay(item)}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 hover:scale-105 active:scale-95"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>{resumePercent > 0 ? 'Resume' : 'Play Now'}</span>
          </button>

          <button
            onClick={() => onOpenDetails(item)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            <Info className="h-4 w-4" />
            <span>Details & Sources</span>
          </button>

          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              isFavorite
                ? 'border-amber-400/40 bg-amber-400/20 text-amber-300'
                : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            {isFavorite ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
