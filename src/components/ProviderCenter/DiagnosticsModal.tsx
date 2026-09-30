/**
 * Aetheris Media Platform - Diagnostic Test Suite
 * Automated verification engine for installed media providers across 9 distinct stages.
 */

import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { ProviderManifest, ProviderDiagnosticReport } from '../../types/media';
import { ProviderRegistry } from '../../services/providers/registry';

interface DiagnosticsModalProps {
  providers: ProviderManifest[];
  onClose: () => void;
  onFinished: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ providers, onClose, onFinished }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<ProviderDiagnosticReport[]>([]);
  const [currentTestingIndex, setCurrentTestingIndex] = useState<number>(-1);

  const handleRunAllDiagnostics = async () => {
    setIsRunning(true);
    const newReports: ProviderDiagnosticReport[] = [];

    for (let i = 0; i < providers.length; i++) {
      setCurrentTestingIndex(i);
      const rep = await ProviderRegistry.runProviderDiagnostics(providers[i]);
      newReports.push(rep);
      setReports([...newReports]);
    }

    setIsRunning(false);
    setCurrentTestingIndex(-1);
    onFinished();
  };

  const getStatusBadge = (status: 'PASS' | 'FAIL' | 'NOT_SUPPORTED' | 'TIMEOUT') => {
    switch (status) {
      case 'PASS':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-rose-400">
            <XCircle className="h-3 w-3" /> FAIL
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400">
            <Clock className="h-3 w-3" /> TIMEOUT
          </span>
        );
      case 'NOT_SUPPORTED':
        return (
          <span className="font-mono text-[10px] text-slate-500">
            NOT SUPPORTED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">Real Diagnostics Suite</h2>
              <p className="text-xs text-slate-400">
                End-to-end verification of connection, metadata, streams, subtitles, and codecs
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Action trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-950/60 p-4">
            <div>
              <h4 className="text-xs font-semibold text-white">Full Provider Audit</h4>
              <p className="text-xs text-slate-400">
                Executes 9 validation stages across {providers.length} registered extensions.
              </p>
            </div>
            <button
              onClick={handleRunAllDiagnostics}
              disabled={isRunning || providers.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-slate-950" />}
              <span>{isRunning ? 'Auditing Extensions...' : 'Start Full Audit'}</span>
            </button>
          </div>

          {/* Test Reports List */}
          {reports.length === 0 && !isRunning && (
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-8 text-center text-xs text-slate-500">
              Click 'Start Full Audit' to test provider endpoints and stream availability.
            </div>
          )}

          {reports.map((report) => (
            <div
              key={report.providerId}
              className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/70"
            >
              {/* Report Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{report.providerName}</h4>
                  <span className="text-[10px] text-slate-500">({report.providerId})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      report.overallStatus === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    OVERALL: {report.overallStatus}
                  </span>
                </div>
              </div>

              {/* 9 Stages Grid */}
              <div className="divide-y divide-white/5 p-2">
                {report.steps.map((st) => (
                  <div
                    key={st.step}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-white/5 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-32 font-medium text-slate-300">{st.step}</span>
                      <span className="text-slate-400 text-[11px]">{st.message}</span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {st.durationMs > 0 && (
                        <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                          {st.durationMs}ms
                        </span>
                      )}
                      <div>{getStatusBadge(st.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
