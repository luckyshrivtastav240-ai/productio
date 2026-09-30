/**
 * Aetheris Media Platform - Settings & Storage Configuration View
 * Manages player settings, subtitle engines, storage caches, and Android architecture inspection.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Tv,
  Subtitles,
  Download,
  Trash2,
  HardDrive,
  Shield,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { StreamQuality, UserSettings } from '../types/media';
import { storage } from '../services/storage';
import { AndroidCodeExporter } from './AndroidCodeExporter';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const updateSetting = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    const updated = { ...localSettings, [key]: val };
    setLocalSettings(updated);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleClearImageCache = () => {
    const res = storage.clearImageCache();
    setCacheMessage(`Cleared cached artwork and posters (${res}).`);
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const handleClearMetadataCache = () => {
    const res = storage.clearMetadataCache();
    setCacheMessage(`Cleared indexed search metadata (${res}).`);
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const handleClearProviderCache = () => {
    const res = storage.clearProviderCache();
    setCacheMessage(`Cleared runtime extension cache (${res}).`);
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const handleClearAll = () => {
    const res = storage.clearAllCache();
    setCacheMessage(`Cleared total across all caches (${res}).`);
    setTimeout(() => setCacheMessage(null), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Platform Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure playback parameters, subtitle rendering, network behavior, and cache retention.
        </p>
      </div>

      {cacheMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{cacheMessage}</span>
        </div>
      )}

      {/* Playback & Quality Preferences */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Tv className="h-4 w-4 text-amber-400" />
          <span>Playback & Video Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Default Stream Quality</label>
            <select
              value={localSettings.defaultQuality}
              onChange={(e) => updateSetting('defaultQuality', e.target.value as StreamQuality)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="4K">4K UHD (Adaptive)</option>
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p Standard</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Preferred Audio Language</label>
            <input
              type="text"
              value={localSettings.preferredLanguage}
              onChange={(e) => updateSetting('preferredLanguage', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.hardwareAcceleration}
              onChange={(e) => updateSetting('hardwareAcceleration', e.target.checked)}
              className="h-4 w-4 rounded accent-amber-400"
            />
            <span>Hardware Video Acceleration (ExoPlayer MediaCodec)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.autoplayNext}
              onChange={(e) => updateSetting('autoplayNext', e.target.checked)}
              className="h-4 w-4 rounded accent-amber-400"
            />
            <span>Autoplay next episode / continuous streaming</span>
          </label>
        </div>
      </div>

      {/* Subtitle Engine Configuration */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Subtitles className="h-4 w-4 text-amber-400" />
          <span>Subtitle Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Preferred Subtitle Language</label>
            <input
              type="text"
              value={localSettings.preferredSubtitleLanguage}
              onChange={(e) => updateSetting('preferredSubtitleLanguage', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-medium">Default Subtitle Size</label>
            <select
              value={localSettings.subtitleFontSize}
              onChange={(e) =>
                updateSetting('subtitleFontSize', e.target.value as 'small' | 'medium' | 'large' | 'xlarge')
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (18px)</option>
              <option value="large">Large (22px)</option>
              <option value="xlarge">Extra Large (26px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cache & Local Storage Management */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <HardDrive className="h-4 w-4 text-amber-400" />
          <span>Local Storage & Cache Management</span>
        </div>

        <p className="text-xs text-slate-400">
          Clean individual caches or perform full data hygiene without touching your saved progress and favorites.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <button
            onClick={handleClearImageCache}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span className="font-semibold block text-white mb-0.5">Clear Posters</span>
            <span className="text-[10px] text-slate-500">Image memory cache</span>
          </button>

          <button
            onClick={handleClearMetadataCache}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span className="font-semibold block text-white mb-0.5">Clear Metadata</span>
            <span className="text-[10px] text-slate-500">Search indexes</span>
          </button>

          <button
            onClick={handleClearProviderCache}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-center text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span className="font-semibold block text-white mb-0.5">Clear Provider Logs</span>
            <span className="text-[10px] text-slate-500">Execution traces</span>
          </button>

          <button
            onClick={handleClearAll}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-rose-300 hover:bg-rose-500/20"
          >
            <span className="font-semibold block text-rose-200 mb-0.5">Clear All Caches</span>
            <span className="text-[10px] text-rose-400/80">Reclaims disk space</span>
          </button>
        </div>
      </div>

      {/* Android Studio Project Source Code Inspector */}
      <AndroidCodeExporter />
    </div>
  );
};
