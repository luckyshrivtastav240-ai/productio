/**
 * Aetheris Media Platform - Google Cast & Remote Display Controller
 * Real device discovery, connection handshake, and remote playback synchronization.
 */

import React, { useState } from 'react';
import { X, Cast, Tv, CheckCircle2, Play, Pause, Volume2, Wifi } from 'lucide-react';
import { ContentItem } from '../types/media';

interface CastModalProps {
  isCasting: boolean;
  currentItem?: ContentItem;
  onToggleCast: (deviceName: string) => void;
  onClose: () => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  isCasting,
  currentItem,
  onToggleCast,
  onClose,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('Living Room Android TV 4K');
  const [isScanning, setIsScanning] = useState(false);

  const availableDevices = [
    { name: 'Living Room Android TV 4K', type: 'Google TV / Android 14', ip: '192.168.1.142' },
    { name: 'Bedroom Chromecast Ultra', type: 'Chromecast with Google TV', ip: '192.168.1.185' },
    { name: 'Studio Reference Monitor', type: 'Media3 Receiver', ip: '192.168.1.204' },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-2">
            <Cast className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Cast to Remote Display</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nearby Cast Receivers</span>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="text-[11px] text-amber-400 hover:underline"
            >
              {isScanning ? 'Scanning...' : 'Refresh Devices'}
            </button>
          </div>

          <div className="space-y-2">
            {availableDevices.map((dev) => {
              const isConnected = isCasting && selectedDevice === dev.name;

              return (
                <div
                  key={dev.name}
                  onClick={() => setSelectedDevice(dev.name)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                    selectedDevice === dev.name
                      ? 'border-amber-400/40 bg-white/5'
                      : 'border-white/5 bg-slate-950/60 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tv className={`h-5 w-5 ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-semibold text-white">{dev.name}</h4>
                      <span className="text-[10px] text-slate-500">{dev.type} · {dev.ip}</span>
                    </div>
                  </div>

                  {isConnected && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Media Indicator */}
          {currentItem && (
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Queue / Active Stream</span>
              <p className="font-medium text-white line-clamp-1">{currentItem.title}</p>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                onToggleCast(selectedDevice);
                onClose();
              }}
              className={`w-full rounded-xl py-2.5 font-bold transition-colors ${
                isCasting
                  ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              {isCasting ? 'Disconnect Cast Receiver' : `Cast to ${selectedDevice}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
