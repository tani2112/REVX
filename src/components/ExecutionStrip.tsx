import React from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Circle,
  ChevronRight,
  ListFilter,
  AlertCircle,
} from 'lucide-react';
import type { WorkflowStep } from '../types';

interface ExecutionStripProps {
  steps: WorkflowStep[];
  onOpenDetails: (stepId?: string) => void;
  selectedStepId?: string;
}

export const ExecutionStrip: React.FC<ExecutionStripProps> = ({
  steps,
  onOpenDetails,
  selectedStepId,
}) => {
  return (
    <div className="w-full max-w-[1580px] mx-auto px-4 pb-4 select-none">
      <div className="relative rounded-2xl bg-[#090d16]/90 border border-white/[0.08] backdrop-blur-xl p-3 md:p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Step Items container */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 flex-1">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            const isSelected = selectedStepId === step.id;

            return (
              <div key={step.id} className="relative flex items-center">
                {/* Clickable Step Card */}
                <div
                  id={`execution-step-${step.number}`}
                  onClick={() => onOpenDetails(step.id)}
                  className={`w-full group cursor-pointer rounded-xl p-2.5 transition-all duration-200 border ${
                    isSelected
                      ? 'bg-white/[0.06] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'hover:bg-white/[0.04] border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Status Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {step.status === 'completed' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}

                      {step.status === 'recovering' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        </div>
                      )}

                      {step.status === 'running' && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        </div>
                      )}

                      {step.status === 'pending' && (
                        <div className="w-6 h-6 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500">
                          <Circle className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {step.status === 'failed' && (
                        <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          {step.number}
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">
                          {step.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar underneath */}
                  <div className="mt-2.5 w-full h-[3px] rounded-full bg-slate-800/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        step.status === 'completed'
                          ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                          : step.status === 'recovering'
                          ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse'
                          : step.status === 'running'
                          ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${step.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Right chevron separator between steps (hidden on mobile and last item) */}
                {!isLast && (
                  <div className="hidden md:flex items-center justify-center pl-2 text-slate-600">
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Action: "View details >" */}
        <div className="flex items-center pl-2 md:border-l md:border-white/10 flex-shrink-0">
          <button
            id="view-details-dock-button"
            onClick={() => onOpenDetails()}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all group"
          >
            <ListFilter className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span>View details</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
