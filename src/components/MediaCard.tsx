/**
 * Aetheris Media Platform - Media Card Component
 * Strict Zero-Pill discipline: unboxed text metadata, high-contrast imagery, smooth interaction
 */

import React from 'react';
import { Play, Bookmark, Check } from 'lucide-react';
import { ContentItem, WatchProgress } from '../types/media';

interface MediaCardProps {
  item: ContentItem;
  watchProgress?: WatchProgress;
  isFavorite?: boolean;
  onPlay: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
  onToggleFavorite?: (id: string) => void;
  tvFocused?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  watchProgress,
  isFavorite,
  onPlay,
  onOpenDetails,
  onToggleFavorite,
  tvFocused,
}) => {
  const resumePercent = watchProgress
    ? Math.round((watchProgress.positionSeconds / (watchProgress.durationSeconds || 1)) * 100)
    : 0;

  const sourceCount = item.providerSourceIds?.length || 1;

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-950/20 ${
        tvFocused ? 'ring-4 ring-amber-400 scale-105 border-amber-400' : 'border-white/10'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={item.posterUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Quick-Play Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 transition-transform hover:scale-110 active:scale-95"
          >
            <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
          </button>
        </div>

        {/* Top-Right Favorite Toggle */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-amber-400 hover:text-slate-950"
          >
            {isFavorite ? (
              <Check className="h-4 w-4 text-amber-400 group-hover:text-slate-950" />
            ) : (
              <Bookmark className="h-4 w-4 text-slate-300" />
            )}
          </button>
        )}

        {/* Watch Progress Bottom Bar */}
        {resumePercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${resumePercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Metadata Section (Zero-Pill Discipline) */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Unboxed Metadata Line with typographic separators */}
        <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
          <span>{item.year}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{item.genres[0] || 'Film'}</span>
          {sourceCount > 1 && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400/90 font-mono text-[11px]">{sourceCount} sources</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-amber-300">
          {item.title}
        </h3>

        {/* Rating and Duration */}
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono tabular-nums text-slate-300">★ {item.rating.toFixed(1)}</span>
          {item.durationMinutes > 0 ? (
            <span className="tabular-nums">{item.durationMinutes}m</span>
          ) : item.isLive ? (
            <span className="font-medium text-rose-400">LIVE</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
