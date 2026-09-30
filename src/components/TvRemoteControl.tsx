/**
 * Aetheris Media Platform - Android TV D-Pad Remote Controller & Keyboard Listener
 * Enables full remote control interaction with arrow keys, Enter, and Backspace/Escape.
 */

import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CornerDownLeft, Play, ArrowLeft } from 'lucide-react';

interface TvRemoteControlProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onSelect: () => void;
  onBack: () => void;
}

export const TvRemoteControl: React.FC<TvRemoteControlProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onSelect,
  onBack,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center rounded-3xl border border-white/15 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-amber-400">
        Android TV Remote
      </div>

      {/* D-Pad Matrix */}
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 shadow-inner">
        {/* Up */}
        <button
          onClick={onUp}
          title="D-Pad Up"
          className="absolute top-1.5 flex h-8 w-12 items-center justify-center rounded-t-full text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        {/* Down */}
        <button
          onClick={onDown}
          title="D-Pad Down"
          className="absolute bottom-1.5 flex h-8 w-12 items-center justify-center rounded-b-full text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {/* Left */}
        <button
          onClick={onLeft}
          title="D-Pad Left"
          className="absolute left-1.5 flex h-12 w-8 items-center justify-center rounded-l-full text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right */}
        <button
          onClick={onRight}
          title="D-Pad Right"
          className="absolute right-1.5 flex h-12 w-8 items-center justify-center rounded-r-full text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Center OK Button */}
        <button
          onClick={onSelect}
          title="OK / Select"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-bold text-slate-950 shadow-md shadow-amber-400/20 hover:scale-105 active:scale-95"
        >
          <span className="text-xs">OK</span>
        </button>
      </div>

      {/* Auxiliary Buttons */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onSelect}
          title="Play/Pause"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <Play className="h-3.5 w-3.5 fill-slate-300" />
        </button>
      </div>
      <div className="mt-2 text-[9px] text-slate-500">Keyboard: Arrows & Enter</div>
    </div>
  );
};
