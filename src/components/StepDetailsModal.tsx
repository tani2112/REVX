import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type { WorkflowStep, LogEntry } from '../types';

interface StepDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  step?: WorkflowStep;
  allSteps: WorkflowStep[];
  logs: LogEntry[];
  onSelectStep: (stepId: string) => void;
}

export const StepDetailsModal: React.FC<StepDetailsModalProps> = ({
  isOpen,
  onClose,
  step,
  allSteps,
  logs,
  onSelectStep,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeStep = step || allSteps[0];
  const stepLogs = logs.filter(
    (l) => !activeStep || l.message.toLowerCase().includes(activeStep.title.toLowerCase()) || l.message.toLowerCase().includes(activeStep.number.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#090d16] border border-white/15 shadow-2xl flex flex-col overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0b0f1a]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg">
              STEP {activeStep.number}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {activeStep.title}
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                activeStep.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : activeStep.status === 'recovering'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {activeStep.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs inside Modal */}
        <div className="px-5 py-2.5 border-b border-white/5 bg-[#080b14] flex items-center space-x-2 overflow-x-auto">
          {allSteps.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStep(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                s.id === activeStep.id
                  ? 'bg-white/10 text-white font-medium border border-white/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{s.number}</span>
              <span className="truncate max-w-[120px]">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Progress & Duration Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>PROGRESS</span>
              <span>{activeStep.progressPercent}% ({activeStep.duration || '0.0s'})</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  activeStep.status === 'completed'
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : activeStep.status === 'recovering'
                    ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse'
                    : 'bg-slate-700'
                }`}
                style={{ width: `${activeStep.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Description & Action Taken */}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3 text-xs leading-relaxed">
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Overview:</span>
              <p className="text-slate-400">{activeStep.details?.description || activeStep.subtitle}</p>
            </div>
            {activeStep.details?.actionTaken && (
              <div className="pt-2 border-t border-white/5">
                <span className="font-semibold text-slate-300 block mb-1">Action Dispatched:</span>
                <p className="text-slate-400 font-mono text-[11px]">{activeStep.details.actionTaken}</p>
              </div>
            )}
          </div>

          {/* Autonomous Recovery Card (If step has recovery details) */}
          {activeStep.details?.recoveryDetails && (
            <div className="rounded-xl bg-blue-950/20 border border-blue-500/30 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Autonomous Recovery Engine Engaged</span>
              </div>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/20 text-red-300 text-[11px]">
                  <strong>Error Caught:</strong> {activeStep.details.recoveryDetails.error}
                </div>
                <div className="p-2.5 rounded-lg bg-blue-900/30 border border-blue-500/20 text-blue-200 text-[11px]">
                  <strong>Policy Applied:</strong> {activeStep.details.recoveryDetails.strategy}
                </div>
              </div>
            </div>
          )}

          {/* Verification Assertions */}
          {activeStep.details?.assertions && activeStep.details.assertions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Assertions</span>
              </label>
              <div className="space-y-1.5">
                {activeStep.details.assertions.map((assertion, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-2 text-xs font-mono text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{assertion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Log Stream */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Execution Log Excerpt</span>
            </label>
            <div className="rounded-xl bg-[#06080f] border border-white/10 p-3.5 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
              {(stepLogs.length > 0 ? stepLogs : logs.slice(0, 4)).map((log) => (
                <div key={log.id} className="flex items-start space-x-2">
                  <span className="text-slate-600 select-none">{log.timestamp}</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0b0f1a] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">DEMO OBSERVABILITY CONSOLE</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
