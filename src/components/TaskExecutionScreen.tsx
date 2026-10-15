import React from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  RotateCcw,
} from 'lucide-react';
import type { BackendRunDetail } from '../services/api';

interface TaskExecutionScreenProps {
  taskPrompt: string;
  runDetail: BackendRunDetail | null;
  onBackToWorkspace: () => void;
  onViewResults: () => void;
  error?: string | null;
}

export const TaskExecutionScreen: React.FC<TaskExecutionScreenProps> = ({
  taskPrompt,
  runDetail,
  onBackToWorkspace,
  onViewResults,
  error,
}) => {
  const isTerminal = runDetail && (runDetail.status === 'completed' || runDetail.status === 'failed');
  const isFailed = runDetail?.status === 'failed' || Boolean(error);

  const steps = runDetail?.steps || [];
  const logs = runDetail?.logs || [];

  // Calculate overall progress from steps
  let overallPercent = 15;
  if (steps.length > 0) {
    const total = steps.reduce((acc, s) => acc + s.progress_percent, 0);
    overallPercent = Math.min(100, Math.round(total / steps.length));
  }
  if (isTerminal && !isFailed) overallPercent = 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      
      {/* Upper Ambient Lighting */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Execution Card */}
      <div className="relative w-full rounded-3xl bg-[#080c16]/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>AUTONOMOUS EXECUTION CONSOLE</span>
              {runDetail?.id && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">RUN #{runDetail.id.slice(0, 8)}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Executing Autonomous Workflow
            </h2>
          </div>

          <button
            onClick={onBackToWorkspace}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>
        </div>

        {/* Task Prompt Box */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Task Description
          </div>
          <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
            "{taskPrompt}"
          </p>
        </div>

        {/* Big Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {isTerminal
                ? isFailed ? 'WORKFLOW FAILED' : 'WORKFLOW COMPLETED'
                : 'COORDINATING SUB-AGENTS & RECOVERY GATES...'}
            </span>
            <span className="font-bold text-blue-400">{overallPercent}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-900/80 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFailed
                  ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                  : overallPercent === 100
                  ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 shadow-[0_0_15px_#38bdf8] animate-pulse'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 flex items-center space-x-3 text-red-300 text-xs font-mono">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Workflow Timeline Steps (01, 02, 03) */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Workflow Step Progression
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Step 01 */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {steps[0]?.status === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : steps[0]?.status === 'running' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">01</span>
                    <span className="text-sm font-semibold text-white">Research & Plan</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-slate-800/80 text-slate-400 border border-white/5">
                      {steps[0]?.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {steps[0]?.result_summary || steps[0]?.description || 'Scanning sample opportunity dataset with deterministic candidate evaluation rules.'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {steps[0]?.duration_str || '0.8s'}
              </span>
            </div>

            {/* Step 02 */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {steps[1]?.status === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : steps[1]?.status === 'recovering' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">02</span>
                    <span className="text-sm font-semibold text-white">Execute & Persist</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-slate-800/80 text-slate-400 border border-white/5">
                      {steps[1]?.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {steps[1]?.status === 'recovering'
                      ? 'Autonomous recovery active: handling SQLite lock contention with exponential backoff & idempotency guard.'
                      : steps[1]?.result_summary || steps[1]?.description || 'Persisting candidate records with replay-protected idempotency tokens.'}
                  </p>
                  {steps[1]?.recovery_attempt_count ? (
                    <div className="mt-1 text-[11px] font-mono text-cyan-400">
                      Recovery policy applied: Backoff attempt {steps[1].recovery_attempt_count}/2 resolved.
                    </div>
                  ) : null}
                </div>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {steps[1]?.duration_str || '1.8s'}
              </span>
            </div>

            {/* Step 03 */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">
                  {steps[2]?.status === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : steps[2]?.status === 'running' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-400">03</span>
                    <span className="text-sm font-semibold text-white">Verify Results</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-slate-800/80 text-slate-400 border border-white/5">
                      {steps[2]?.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {steps[2]?.result_summary || steps[2]?.description || 'Independent database read-back, duplicate check, and cryptographic SHA-256 state seal.'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {steps[2]?.duration_str || '0.5s'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Terminal Log Stream (Last 3 logs) */}
        {logs.length > 0 && (
          <div className="rounded-xl bg-[#060810] border border-white/10 p-3.5 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-[10px] uppercase text-slate-500 flex items-center space-x-1.5 pb-1 border-b border-white/5 mb-1.5">
              <Terminal className="w-3 h-3 text-blue-400" />
              <span>Live Telemetry Output</span>
            </div>
            {logs.slice(0, 3).map((l) => (
              <div key={l.id} className="truncate">
                <span className="text-slate-600 mr-2">{l.timestamp}</span>
                <span className={l.level === 'recover' ? 'text-cyan-400' : l.level === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {isTerminal ? 'Execution finished' : 'Real-time observable telemetry active'}
          </div>

          {isTerminal ? (
            <button
              onClick={onViewResults}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all animate-bounce"
            >
              <span>View Verified Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing in SQLite...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
