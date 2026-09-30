/**
 * Aetheris / NexusStream - Admin Repository Code Management Console
 * Allows creating, editing, enabling, disabling, setting expiry, and viewing usage metrics
 * for numeric/alphanumeric repository codes (e.g. 3737, 3670).
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Power,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { RepositoryCodeRecord } from '../../types/repositoryCode';
import { RepositoryResolver } from '../../services/repositoryResolver';

interface CodeManagementModalProps {
  onClose: () => void;
}

export const CodeManagementModal: React.FC<CodeManagementModalProps> = ({ onClose }) => {
  const [codes, setCodes] = useState<RepositoryCodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Code Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newManifestUrl, setNewManifestUrl] = useState('/api/manifest/3737');

  const loadCodes = async () => {
    setIsLoading(true);
    const list = await RepositoryResolver.getAllRegisteredCodes();
    setCodes(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleToggleStatus = async (record: RepositoryCodeRecord) => {
    const nextStatus = record.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const success = await RepositoryResolver.toggleCodeStatus(record.id, nextStatus);
    if (success) {
      setActionNotice(`Code ${record.code} status updated to ${nextStatus}.`);
      loadCodes();
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const res = await RepositoryResolver.registerCode({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      description: newDescription.trim() || 'Custom Registered Media Repository',
      manifestUrl: newManifestUrl.trim(),
      status: 'ACTIVE',
    });

    if (res.success) {
      setActionNotice(`Repository code '${newCode.trim().toUpperCase()}' successfully registered.`);
      setShowAddForm(false);
      setNewCode('');
      setNewName('');
      setNewDescription('');
      loadCodes();
      setTimeout(() => setActionNotice(null), 3500);
    } else {
      alert(res.error || 'Failed to register code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Repository Code Registry Console</h2>
              <p className="text-xs text-slate-400">
                Manage numeric & alphanumeric codes (3737, 3670, custom) and their target repository manifests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register New Code</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 text-xs space-y-5">
          {actionNotice && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Add Code Form Drawer */}
          {showAddForm && (
            <form
              onSubmit={handleCreateCode}
              className="rounded-2xl border border-amber-400/30 bg-slate-950 p-4 space-y-3"
            >
              <h3 className="font-bold text-white text-xs">Register New Repository Code</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Code (Numeric or Alphanumeric)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 4096 or ALPHA7"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Global Media Consortium"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Manifest URL or Endpoint</label>
                <input
                  type="text"
                  value={newManifestUrl}
                  onChange={(e) => setNewManifestUrl(e.target.value)}
                  placeholder="/api/manifest/3737 or https://..."
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white font-mono text-[11px] focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of media content and providers..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-300"
                >
                  Save Code
                </button>
              </div>
            </form>
          )}

          {/* Registered Codes List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading code registry...</div>
            ) : codes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No repository codes registered.</div>
            ) : (
              codes.map((item) => {
                const isActive = item.status === 'ACTIVE';

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                      isActive
                        ? 'border-white/10 bg-slate-950/70 hover:border-amber-400/30'
                        : 'border-white/5 bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 font-mono text-sm font-bold text-amber-400">
                          {item.code}
                        </span>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <span
                          className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                            isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-1 text-slate-400">{item.description}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-500 text-[11px] font-mono">
                        <span>Manifest: {item.manifestUrl}</span>
                        <span>·</span>
                        <span>Usage: {item.usageCount || 0} hits</span>
                        <span>·</span>
                        <span>Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-colors ${
                          isActive
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>{isActive ? 'Disable Code' : 'Enable Code'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
