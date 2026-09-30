/**
 * Aetheris Media Platform - Provider Details & Sandbox Permissions Inspector
 * Inspect provider metadata, revoke/grant granular permissions, view live execution logs, and clear cache.
 */

import React, { useState } from 'react';
import { X, Shield, Lock, Activity, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { ProviderManifest, ProviderPermission, ProviderLog } from '../../types/media';
import { storage } from '../../services/storage';
import { ProviderRegistry } from '../../services/providers/registry';

interface ProviderDetailsModalProps {
  provider: ProviderManifest;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'permissions' | 'logs'>('info');
  const [currentProvider, setCurrentProvider] = useState<ProviderManifest>(provider);
  const [logs, setLogs] = useState<ProviderLog[]>(storage.getProviderLogs(provider.providerId));
  const [isTesting, setIsTesting] = useState(false);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const allPossiblePermissions: ProviderPermission[] = [
    'NETWORK',
    'METADATA',
    'PLAYBACK',
    'SUBTITLE',
    'DOWNLOAD',
    'STORAGE',
    'AUTHENTICATION',
  ];

  const handleTogglePermission = (perm: ProviderPermission) => {
    let updatedPerms: ProviderPermission[];
    if (currentProvider.grantedPermissions.includes(perm)) {
      updatedPerms = currentProvider.grantedPermissions.filter((p) => p !== perm);
    } else {
      updatedPerms = [...currentProvider.grantedPermissions, perm];
    }
    const updated = { ...currentProvider, grantedPermissions: updatedPerms };
    setCurrentProvider(updated);
    storage.updateProvider(updated);
    onUpdate();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestNotice(null);
    const report = await ProviderRegistry.runProviderDiagnostics(currentProvider);
    setIsTesting(false);
    setTestNotice(`Diagnostics completed: ${report.overallStatus} (${report.steps.filter((s) => s.status === 'PASS').length}/${report.steps.length} passed)`);
    setLogs(storage.getProviderLogs(provider.providerId));
    onUpdate();
  };

  const handleClearCache = () => {
    storage.clearProviderCache(provider.providerId);
    setLogs(storage.getProviderLogs(provider.providerId));
    setTestNotice('Provider runtime cache cleared successfully.');
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove '${provider.name}'?`)) {
      storage.removeProvider(provider.providerId);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 font-bold font-mono">
              {provider.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">{provider.name}</h2>
              <p className="text-xs text-slate-400">
                v{provider.version} · {provider.providerId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview & Details
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Sandbox Permissions ({currentProvider.grantedPermissions.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Execution Logs ({logs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 text-xs">
          {testNotice && (
            <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
              {testNotice}
            </div>
          )}

          {/* Tab 1: Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-1">Description</h4>
                <p className="text-slate-300 leading-relaxed">{provider.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <div>
                  <span className="text-slate-500 block">Author</span>
                  <span className="text-slate-200 font-medium">{provider.author}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Language / Country</span>
                  <span className="text-slate-200 font-medium uppercase">
                    {provider.language} ({provider.country})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Host API Version</span>
                  <span className="text-amber-400 font-mono font-medium">{provider.apiVersion}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Last Diagnostic Status</span>
                  <span
                    className={`font-semibold ${
                      provider.lastTestStatus === 'PASS' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {provider.lastTestStatus || 'NOT_TESTED'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {provider.capabilities.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Cryptographic Integrity Signature</h4>
                <div className="rounded-lg border border-white/5 bg-black/40 p-2 font-mono text-[10px] text-slate-400 break-all select-all">
                  SHA-256: {provider.sha256Signature}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Sandbox Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Granular permission controls. Revoking permissions restricts the provider's sandbox capabilities
                immediately without reinstalling the extension.
              </p>

              <div className="space-y-2">
                {allPossiblePermissions.map((perm) => {
                  const isRequired = provider.requiredPermissions.includes(perm);
                  const isGranted = currentProvider.grantedPermissions.includes(perm);

                  return (
                    <div
                      key={perm}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                          <span className="font-mono font-semibold text-white">{perm}</span>
                          {isRequired && (
                            <span className="text-[10px] text-slate-500 font-normal">(Declared in Manifest)</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleTogglePermission(perm)}
                        className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                          isGranted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/5 text-slate-500 border border-white/5'
                        }`}
                      >
                        {isGranted ? 'Granted' : 'Revoked'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Execution Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-400">
                <span>Recent execution events:</span>
                <button
                  onClick={() => {
                    storage.clearProviderLogs(provider.providerId);
                    setLogs([]);
                  }}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Clear Logs
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-slate-950/60 p-6 text-center text-slate-500">
                  No logs recorded for this provider.
                </div>
              ) : (
                <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-3 font-mono text-[11px]">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-slate-600 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`shrink-0 uppercase text-[10px] font-bold ${
                          log.level === 'error'
                            ? 'text-rose-400'
                            : log.level === 'warn'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        [{log.level}]
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 p-4">
          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Provider</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Clear Cache
            </button>
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Run Diagnostic Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
