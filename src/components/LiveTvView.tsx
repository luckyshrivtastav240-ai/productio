/**
 * Aetheris Media Platform - Live TV & Real-time Broadcast Guide
 * Real authorized aerospace and public domain live television with electronic program guide (EPG).
 */

import React, { useState } from 'react';
import { Play, Radio, Tv, Clock, Calendar, Sparkles } from 'lucide-react';
import { ContentItem } from '../types/media';

interface LiveTvViewProps {
  liveChannels: ContentItem[];
  onPlay: (item: ContentItem) => void;
  onOpenDetails: (item: ContentItem) => void;
}

export const LiveTvView: React.FC<LiveTvViewProps> = ({ liveChannels, onPlay, onOpenDetails }) => {
  const [selectedChannel, setSelectedChannel] = useState<ContentItem>(liveChannels[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Real-Time Broadcast Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Live Channels & Feeds</h1>
        <p className="mt-1 text-sm text-slate-400">
          Authorized public and licensed continuous live streams with integrated Electronic Program Guide (EPG).
        </p>
      </div>

      {/* Featured Live Channel Preview Screen */}
      {selectedChannel && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="relative aspect-video max-h-[420px] w-full bg-black">
            <img
              src={selectedChannel.backdropUrl || selectedChannel.posterUrl}
              alt={selectedChannel.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

            {/* Live Indicator Tag */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-rose-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>LIVE BROADCAST</span>
            </div>

            {/* Channel Info & Direct Launch */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-1 text-xs font-mono text-amber-400">
                  Channel {selectedChannel.liveChannelNumber || 101} · {selectedChannel.genres.join(', ')}
                </div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">{selectedChannel.title}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-semibold text-white">Current Program:</span>
                  <span>{selectedChannel.epgCurrentProgram || 'Continuous Live Telemetry'}</span>
                </div>
              </div>

              <button
                onClick={() => onPlay(selectedChannel)}
                className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 active:scale-95"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Watch Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Electronic Program Guide (EPG) Table */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-white">Electronic Program Guide (EPG)</h3>

        <div className="space-y-3">
          {liveChannels.map((channel) => {
            const isSelected = selectedChannel?.id === channel.id;

            return (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`group flex cursor-pointer flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-amber-400/50 bg-amber-400/5 shadow-md'
                    : 'border-white/5 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 font-mono text-sm font-bold text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                    {channel.liveChannelNumber || 100}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-amber-300">
                        {channel.title}
                      </h4>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{channel.overview}</p>
                  </div>
                </div>

                {/* EPG Time Slots */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <div className="rounded-lg border border-white/5 bg-slate-950/80 px-3 py-1.5">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Now Playing</span>
                    <span className="font-medium text-amber-300">{channel.epgCurrentProgram}</span>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-slate-950/80 px-3 py-1.5">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Up Next</span>
                    <span className="text-slate-300">{channel.epgNextProgram}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(channel);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 self-end sm:self-center"
                  >
                    <Play className="h-3.5 w-3.5 fill-slate-950" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
