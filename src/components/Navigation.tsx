/**
 * Aetheris Media Platform - Top Navigation Bar
 * Follows strict 3-Zone Top Bar Contract from Universal Frontend Design Constitution:
 * Zone 1: Single text element brand wordmark
 * Zone 2: Clean 5-link text navigation
 * Zone 3: Device Mode switcher & Cast action
 */

import React from 'react';
import { Cast, Smartphone, Tablet, Tv } from 'lucide-react';

export type NavTab = 'discover' | 'search' | 'library' | 'live' | 'providers' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  deviceMode: 'mobile' | 'tablet' | 'tv';
  onDeviceModeChange: (mode: 'mobile' | 'tablet' | 'tv') => void;
  onOpenCast: () => void;
  isCasting: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  deviceMode,
  onDeviceModeChange,
  onOpenCast,
  isCasting,
}) => {
  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'search', label: 'Search' },
    { id: 'library', label: 'Library' },
    { id: 'live', label: 'Live TV' },
    { id: 'providers', label: 'Providers' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('discover')}
          className="text-left text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          NexusStream
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Device Layout Switcher & Cast) */}
        <div className="flex items-center gap-3">
          {/* Device Profile Switcher */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => onDeviceModeChange('mobile')}
              title="Mobile Form Factor"
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                deviceMode === 'mobile' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Phone</span>
            </button>
            <button
              onClick={() => onDeviceModeChange('tablet')}
              title="Tablet Landscape"
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                deviceMode === 'tablet' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => onDeviceModeChange('tv')}
              title="Android TV Leanback Mode"
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                deviceMode === 'tv' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">TV Mode</span>
            </button>
          </div>

          {/* Cast Target Action */}
          <button
            onClick={onOpenCast}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isCasting
                ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            <Cast className={`h-3.5 w-3.5 ${isCasting ? 'animate-pulse text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isCasting ? 'Connected' : 'Cast'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (for mobile viewports) */}
      <div className="flex overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
        <div className="flex gap-4">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
