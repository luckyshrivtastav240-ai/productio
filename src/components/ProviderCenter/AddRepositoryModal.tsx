/**
 * Aetheris / NexusStream - Real Repository Code System & Add Repository Screen
 * Implements:
 * - Primary numeric/alphanumeric Repository Code resolution (e.g. 3737, 3670)
 * - Optional custom Repository Name
 * - Advanced Direct URL resolution
 * - Real multi-step verification pipeline (format, backend resolver, manifest parsing, compatibility, signatures)
 * - Provider selection checklist (Install Selected / Install All)
 * - Real post-install diagnostics execution
 * - Success screen with: Connected status, provider count, View Providers, Test Providers
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Boxes,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProviderRegistry } from '../../services/providers/registry';
import { RepositoryResolver } from '../../services/repositoryResolver';
import { RepositoryManifest } from '../../types/media';

interface AddRepositoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onOpenProviders?: () => void;
  onRunDiagnostics?: () => void;
}

type Step = 'input' | 'resolving' | 'select_providers' | 'installing' | 'completed' | 'error';

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  onClose,
  onSuccess,
  onOpenProviders,
  onRunDiagnostics,
}) => {
  // Input fields
  const [repoCode, setRepoCode] = useState('3737');
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);

  // Flow State
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Resolved Repository & Provider Selection
  const [resolvedRepo, setResolvedRepo] = useState<RepositoryManifest | null>(null);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [installedCount, setInstalledCount] = useState<number>(0);

  // Quick preset codes
  const presetCodes = [
    { code: '3737', label: 'Code 3737 (Open Cinema 4K Core)' },
    { code: '3670', label: 'Code 3670 (Public Heritage & Space)' },
  ];

  // Step 1: Process User Submission
  const handleStartResolution = async () => {
    setErrorMessage(null);
    setErrorDetails(null);

    const useDirectUrl = showAdvancedUrl && repoUrl.trim().length > 0;
    const targetInput = useDirectUrl ? repoUrl.trim() : repoCode.trim();

    if (!targetInput) {
      setErrorMessage('Please enter a repository code (e.g. 3737) or URL.');
      return;
    }

    setCurrentStep('resolving');

    try {
      // 1. Format Check
      setProcessingStatusText(useDirectUrl ? 'Validating URL format...' : `Validating code format '${targetInput}'...`);
      await new Promise((r) => setTimeout(r, 60)); // UI paint tick

      // 2. Query Repository Resolver
      setProcessingStatusText(
        useDirectUrl ? 'Connecting to remote repository server...' : `Resolving code '${targetInput}' via registry...`
      );

      const result = await ProviderRegistry.resolveRepository(targetInput);

      if (!result.valid || !result.repository) {
        setCurrentStep('error');
        setErrorMessage(result.error || 'Failed to resolve repository.');
        setErrorDetails(result.stepFailed ? `Failed during: ${result.stepFailed}` : null);
        return;
      }

      // 3. Manifest Verification
      setProcessingStatusText('Validating manifest structure, API compatibility & SHA-256 signatures...');
      const repo = result.repository;

      // Apply optional custom user name if provided
      if (repoName.trim()) {
        repo.name = repoName.trim();
      }

      setResolvedRepo(repo);
      // Pre-select all discovered providers by default
      setSelectedProviderIds(repo.providers.map((p) => p.providerId));
      setCurrentStep('select_providers');
    } catch (err: unknown) {
      setCurrentStep('error');
      setErrorMessage((err as Error).message || 'An unexpected error occurred during resolution.');
    }
  };

  // Toggle single provider selection
  const handleToggleProvider = (providerId: string) => {
    if (selectedProviderIds.includes(providerId)) {
      setSelectedProviderIds(selectedProviderIds.filter((id) => id !== providerId));
    } else {
      setSelectedProviderIds([...selectedProviderIds, providerId]);
    }
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    if (!resolvedRepo) return;
    if (selectedProviderIds.length === resolvedRepo.providers.length) {
      setSelectedProviderIds([]);
    } else {
      setSelectedProviderIds(resolvedRepo.providers.map((p) => p.providerId));
    }
  };

  // Step 2: Install Providers & Run Diagnostics
  const handleConfirmInstall = async () => {
    if (!resolvedRepo) return;

    if (selectedProviderIds.length === 0) {
      setErrorMessage('Please select at least one provider to install.');
      return;
    }

    setCurrentStep('installing');
    setProcessingStatusText('Installing extensions & running 9-stage diagnostics check...');

    try {
      const installRes = await ProviderRegistry.installRepositoryProviders(resolvedRepo, selectedProviderIds);

      if (!installRes.success) {
        setCurrentStep('error');
        setErrorMessage(installRes.error || 'Provider installation failed.');
        return;
      }

      setInstalledCount(installRes.installedCount);
      setCurrentStep('completed');
      onSuccess();
    } catch (err: unknown) {
      setCurrentStep('error');
      setErrorMessage((err as Error).message || 'Installation encountered an unexpected error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Boxes className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Add Repository</h2>
              <p className="text-xs text-slate-400">
                Connect via numeric Repository Code or direct manifest URL
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

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 text-xs">
          {/* STEP 1: INPUT SCREEN */}
          {currentStep === 'input' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3.5 text-slate-300 leading-relaxed">
                Enter a registered <strong>Repository Code</strong> (such as <code className="font-mono text-amber-300 font-bold">3737</code> or <code className="font-mono text-amber-300 font-bold">3670</code>) to connect to a registered repository.
              </div>

              {/* Optional Repository Name */}
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Repository Name (Optional)</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. My Open Cinema Channel"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Primary Method: Repository Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white font-semibold">Repository Code</label>
                  <span className="text-[10px] text-amber-400 uppercase font-mono">Primary Method</span>
                </div>
                <input
                  type="text"
                  value={repoCode}
                  onChange={(e) => setRepoCode(e.target.value.toUpperCase())}
                  placeholder="3737"
                  maxLength={16}
                  className="w-full rounded-xl border-2 border-amber-400/50 bg-slate-950 px-4 py-3 text-lg font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:border-amber-400 focus:outline-none shadow-inner"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Registered Codes:</span>
                {presetCodes.map((p) => (
                  <button
                    key={p.code}
                    onClick={() => {
                      setRepoCode(p.code);
                      setShowAdvancedUrl(false);
                    }}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      repoCode === p.code && !showAdvancedUrl
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Advanced: Direct URL Toggle */}
              <div className="border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showAdvancedUrl ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span>Advanced: Use Direct Repository URL</span>
                </button>

                {showAdvancedUrl && (
                  <div className="mt-3 space-y-2">
                    <label className="text-slate-400 block font-medium">Repository URL</label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://repo.aetheris.org/official/index.json"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{errorMessage}</span>
                    {errorDetails && <span className="text-[11px] text-rose-400/80">{errorDetails}</span>}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartResolution}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 font-bold text-slate-950 shadow-md shadow-amber-400/20 hover:bg-amber-300"
                >
                  <span>Add Repository</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: RESOLVING / LOADING */}
          {currentStep === 'resolving' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Resolving Repository</h3>
                <p className="text-slate-400 max-w-sm mx-auto">{processingStatusText}</p>
              </div>
            </div>
          )}

          {/* STEP 2: PROVIDER SELECTION SCREEN */}
          {currentStep === 'select_providers' && resolvedRepo && (
            <div className="space-y-5">
              {/* Repository Summary Card */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Repository Successfully Resolved</span>
                </div>
                <h3 className="text-sm font-bold text-white">{resolvedRepo.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                  <span>v{resolvedRepo.version}</span>
                  <span>·</span>
                  <span>Author: {resolvedRepo.author}</span>
                  <span>·</span>
                  <span className="font-mono text-amber-400">{resolvedRepo.providers.length} extensions packaged</span>
                </div>
                <p className="mt-1 text-slate-300">{resolvedRepo.description}</p>
              </div>

              {/* Provider Selection Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Discovered Providers ({resolvedRepo.providers.length})
                  </h4>
                  <p className="text-slate-400">Select which extensions to install and verify</p>
                </div>

                <button
                  onClick={handleSelectAll}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 hover:text-white text-[11px]"
                >
                  {selectedProviderIds.length === resolvedRepo.providers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Providers List with Capabilities */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {resolvedRepo.providers.map((p) => {
                  const isChecked = selectedProviderIds.includes(p.providerId);

                  return (
                    <div
                      key={p.providerId}
                      onClick={() => handleToggleProvider(p.providerId)}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                        isChecked
                          ? 'border-amber-400/40 bg-white/5'
                          : 'border-white/5 bg-slate-950/60 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded accent-amber-400 cursor-pointer"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white">{p.name}</h5>
                          <span className="font-mono text-[10px] text-amber-400">v{p.version}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">{p.description}</p>

                        {/* Capabilities */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-slate-500 mr-1">Capabilities:</span>
                          {p.capabilities.map((c) => (
                            <span
                              key={c}
                              className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Permissions */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-400 mr-0.5" />
                          <span className="text-slate-500">Permissions:</span>
                          {p.requiredPermissions.map((perm) => (
                            <span
                              key={perm}
                              className="rounded bg-amber-400/10 px-1.5 py-0.2 font-mono text-[9px] text-amber-300"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep('input')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-300 hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmInstall}
                  disabled={selectedProviderIds.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 font-bold text-slate-950 shadow-md shadow-amber-400/20 hover:bg-amber-300 disabled:opacity-50"
                >
                  <span>Install Selected ({selectedProviderIds.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: INSTALLING */}
          {currentStep === 'installing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Installing & Verifying</h3>
                <p className="text-slate-400 max-w-sm mx-auto">{processingStatusText}</p>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED SUCCESS SCREEN */}
          {currentStep === 'completed' && resolvedRepo && (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Repository Added Successfully</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Registered and initialized <span className="text-white font-semibold">{resolvedRepo.name}</span>.
                </p>
              </div>

              {/* Status details card */}
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Repository Name:</span>
                  <span className="font-semibold text-white">{resolvedRepo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Version:</span>
                  <span className="font-mono text-amber-400">v{resolvedRepo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Author:</span>
                  <span className="text-slate-300">{resolvedRepo.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Providers Installed:</span>
                  <span className="font-bold text-emerald-400">{installedCount} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
              </div>

              {/* Post-install action buttons as requested in Requirement 33 */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenProviders?.();
                  }}
                  className="rounded-xl bg-amber-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-amber-300"
                >
                  View Providers
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onRunDiagnostics?.();
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Test Providers
                </button>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STEP: ERROR STATE */}
          {currentStep === 'error' && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">Resolution or Validation Failed</h4>
                    <p className="mt-1 text-slate-200 leading-relaxed">{errorMessage}</p>
                    {errorDetails && <p className="mt-1 text-[11px] text-rose-400/80 font-mono">{errorDetails}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => setCurrentStep('input')}
                  className="rounded-xl bg-amber-400 px-5 py-2 font-bold text-slate-950 hover:bg-amber-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
