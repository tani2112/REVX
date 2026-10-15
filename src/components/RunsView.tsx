import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import type { WorkflowStep, LogEntry } from '../types';

interface RunsViewProps {
  steps: WorkflowStep[];
  logs: LogEntry[];
  onOpenStepDetails: (stepId: string) => void;
}

export const RunsView: React.FC<RunsViewProps> = ({
  steps,
  logs,
  onOpenStepDetails,
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'recover' | 'success'>('all');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header with Title & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
            <Clock className="w-3.5 h-3.5" />
            <span>EXECUTION RUN #WF-9942</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">LIVE OBSERVABLE STATE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Execution & Recovery Trace
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-agent execution pipeline with autonomous fault detection, backoff recovery, and verified read-back.
          </p>
        </div>

        {/* Demo notification banner */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs font-mono text-blue-300">
            Runtime: 4.8s • 3 Steps • 1 Recovery
          </div>
        </div>
      </div>

      {/* Main Grid: Left Steps & Recovery Scenario | Right Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (7 cols): Execution Steps & Failure/Recovery Spotlight */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Timeline Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Workflow Steps Breakdown
            </h3>

            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => onOpenStepDetails(step.id)}
                className="group cursor-pointer rounded-2xl bg-[#090d16] border border-white/[0.08] hover:border-blue-500/40 p-5 transition-all shadow-lg hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-0.5">
                      {step.status === 'completed' && (
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {step.status === 'recovering' && (
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                        </div>
                      )}
                      {step.status === 'pending' && (
                        <div className="w-7 h-7 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-slate-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {step.number}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {step.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                            step.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : step.status === 'recovering'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-400">
                      {step.duration || 'Queued'}
                    </span>
                    <div className="text-[11px] text-blue-400 group-hover:underline mt-1 flex items-center justify-end space-x-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        : step.status === 'recovering'
                        ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${step.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Illustrative Failure & Recovery Scenario Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0c1426] to-[#090d16] border border-blue-500/30 p-6 shadow-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Autonomous Fault Recovery Scenario
                </h4>
                <p className="text-xs text-slate-400">
                  Illustrating REVX deterministic self-healing vs traditional fragile agents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans mt-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                <div className="text-red-400 font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Intercepted Exception</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">
                  STORAGE_MUTATION_LOCK
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  SQLite journal locked by concurrent background vacuum. Normal agents crash or corrupt files.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 space-y-1.5">
                <div className="text-blue-400 font-semibold flex items-center space-x-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>REVX Recovery Strategy</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">
                  EXPONENTIAL BACKOFF + JITTER
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Idempotency key checked, transaction rolled back safely, lock re-acquired on attempt 2 with zero duplicate writes.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Idempotency Guard: Verified</span>
              <span className="text-emerald-400 font-medium">State Integrity: 100% Preserved</span>
            </div>
          </div>
        </div>

        {/* Right column (5 cols): Live Simulated Terminal / Logs Console */}
        <div className="lg:col-span-5 flex flex-col h-full rounded-2xl bg-[#070a12] border border-white/[0.08] shadow-2xl overflow-hidden min-h-[500px]">
          
          {/* Console Header & Filters */}
          <div className="p-3.5 bg-[#0b0f19] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold text-white">Execution Console</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLogs}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-400 hover:text-white transition-colors"
                title="Copy console output"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-[#090d16] border-b border-white/5 flex items-center space-x-1 overflow-x-auto text-[11px] font-mono">
            {(['all', 'info', 'warn', 'recover', 'success'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2.5 py-1 rounded-md transition-colors uppercase ${
                  logFilter === filter
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Console Output Scrollable List */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 select-text max-h-[560px]">
            {filteredLogs.map((log) => {
              let badgeColor = 'text-blue-400';
              if (log.level === 'warn') badgeColor = 'text-amber-400';
              if (log.level === 'recover') badgeColor = 'text-cyan-400 font-semibold';
              if (log.level === 'success') badgeColor = 'text-emerald-400';
              if (log.level === 'error') badgeColor = 'text-red-400';

              return (
                <div key={log.id} className="flex items-start space-x-2 group hover:bg-white/[0.02] p-1 rounded">
                  <span className="text-slate-600 select-none flex-shrink-0">{log.timestamp}</span>
                  <span className={`select-none ${badgeColor}`}>[{log.level.toUpperCase()}]</span>
                  <span className="text-slate-300 group-hover:text-white transition-colors break-words">
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Console Footer */}
          <div className="p-2.5 bg-[#0b0f19] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Filter: {logFilter.toUpperCase()}</span>
            <span>Total Entries: {filteredLogs.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
