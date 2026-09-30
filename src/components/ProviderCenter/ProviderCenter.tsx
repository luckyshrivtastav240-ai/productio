/**
 * Aetheris / NexusStream - Dedicated Provider Center
 * Sections: Installed Providers, Repositories, Repository Codes Registry, Diagnostics
 */

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Lock,
  Globe,
  CheckCircle2,
  FileCode,
  Key,
  ExternalLink,
} from 'lucide-react';
import { ProviderManifest, RepositoryManifest } from '../../types/media';
import { storage } from '../../services/storage';
import { AddRepositoryModal } from './AddRepositoryModal';
import { ProviderDetailsModal } from './ProviderDetailsModal';
import { DiagnosticsModal } from './DiagnosticsModal';
import { CodeManagementModal } from './CodeManagementModal';

interface ProviderCenterProps {
  providers: ProviderManifest[];
  repositories: RepositoryManifest[];
  onRefresh: () => void;
}

type ProviderCenterTab = 'installed' | 'repositories' | 'diagnostics';

export const ProviderCenter: React.FC<ProviderCenterProps> = ({
  providers,
  repositories,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<ProviderCenterTab>('installed');
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showCodeMgmtModal, setShowCodeMgmtModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderManifest | null>(null);

  const handleToggleEnable = (providerId: string, enabled: boolean) => {
    storage.toggleProvider(providerId, enabled);
    onRefresh();
  };

  const handleRemoveRepo = (repoId: string) => {
    if (confirm('Remove this repository and unregister its extensions?')) {
      storage.removeRepository(repoId);
      onRefresh();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Boxes className="h-3.5 w-3.5" />
            <span>Modular Architecture & Security Sandbox</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Provider Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage extensions, verify cryptographic signatures, configure granular permissions, and audit stream integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCodeMgmtModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>Code Registry (3737/3670)</span>
          </button>

          <button
            onClick={() => setShowDiagnosticsModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>Run Diagnostics</span>
          </button>

          <button
            onClick={() => setShowAddRepoModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 shadow-md shadow-amber-400/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Repository</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('installed')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'installed'
              ? 'bg-amber-400 text-slate-950 font-semibold'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <span>Installed Extensions</span>
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 font-mono text-[10px]">
            {providers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('repositories')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'repositories'
              ? 'bg-amber-400 text-slate-950 font-semibold'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <span>Registered Repositories</span>
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 font-mono text-[10px]">
            {repositories.length}
          </span>
        </button>
      </div>

      {/* Installed Providers Tab */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {providers.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-12 text-center text-xs text-slate-400 space-y-3">
              <Boxes className="mx-auto h-8 w-8 text-slate-600" />
              <p>No providers currently installed.</p>
              <button
                onClick={() => setShowAddRepoModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Enter Code 3737 or 3670</span>
              </button>
            </div>
          ) : (
            providers.map((p) => {
              const testPassed = p.lastTestStatus === 'PASS';

              return (
                <div
                  key={p.providerId}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
                    p.enabled
                      ? 'border-white/10 bg-slate-900/70 hover:border-amber-400/30'
                      : 'border-white/5 bg-slate-950/40 opacity-70'
                  }`}
                >
                  {/* Provider Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 font-bold font-mono text-base shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{p.name}</h3>
                        <span className="font-mono text-xs text-amber-400">v{p.version}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">by {p.author}</span>
                        {testPassed && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> PASS
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">{p.description}</p>

                      {/* Capabilities Tag Line */}
                      <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px]">
                        <span className="text-slate-500 mr-1">Capabilities:</span>
                        {p.capabilities.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Permissions Breakdown */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <Lock className="h-3 w-3 text-amber-400" />
                        <span className="text-slate-500">Sandbox Permissions:</span>
                        {p.grantedPermissions.map((perm) => (
                          <span
                            key={perm}
                            className="rounded bg-amber-400/10 px-1.5 py-0.2 font-mono text-[10px] text-amber-300"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setSelectedProvider(p)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      Manage & Logs
                    </button>

                    <button
                      onClick={() => handleToggleEnable(p.providerId, !p.enabled)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        p.enabled
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {p.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Repositories Tab */}
      {activeTab === 'repositories' && (
        <div className="space-y-4">
          {repositories.map((repo) => (
            <div
              key={repo.repositoryId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{repo.name}</h3>
                  <span className="font-mono text-xs text-amber-400">v{repo.version}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{repo.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Author: {repo.author}</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-400">{repo.providers.length} extensions active</span>
                  <span>·</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Synced: {new Date(repo.lastSyncedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-500 break-all select-all">
                  SHA-256: {repo.sha256Signature}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleRemoveRepo(repo.repositoryId)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Repository Modal */}
      {showAddRepoModal && (
        <AddRepositoryModal
          onClose={() => setShowAddRepoModal(false)}
          onSuccess={() => {
            onRefresh();
          }}
          onOpenProviders={() => {
            setActiveTab('installed');
            onRefresh();
          }}
          onRunDiagnostics={() => {
            setShowDiagnosticsModal(true);
            onRefresh();
          }}
        />
      )}

      {/* Code Management Console Modal */}
      {showCodeMgmtModal && (
        <CodeManagementModal
          onClose={() => {
            setShowCodeMgmtModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Diagnostics Modal */}
      {showDiagnosticsModal && (
        <DiagnosticsModal
          providers={providers}
          onClose={() => setShowDiagnosticsModal(false)}
          onFinished={onRefresh}
        />
      )}

      {/* Provider Details & Sandbox Inspector Modal */}
      {selectedProvider && (
        <ProviderDetailsModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
};
