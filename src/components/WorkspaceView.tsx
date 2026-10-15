import React, { useState } from 'react';
import {
  FileText,
  Paperclip,
  Database,
  Play,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { GalaxyCanvas } from './GalaxyCanvas';
import { ExecutionStrip } from './ExecutionStrip';
import type { WorkflowStep, DemoTaskPreset } from '../types';
import { DEMO_PRESETS } from '../mock/demoData';

interface WorkspaceViewProps {
  steps: WorkflowStep[];
  onOpenDetails: (stepId?: string) => void;
  onSimulateRun: (prompt: string, preset?: DemoTaskPreset) => void;
  isSimulating: boolean;
  selectedStepId?: string;
  onSelectPhase: (phase: 'PLAN' | 'EXECUTE' | 'VERIFY') => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  steps,
  onOpenDetails,
  onSimulateRun,
  isSimulating,
  selectedStepId,
  onSelectPhase,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [activePreset, setActivePreset] = useState<DemoTaskPreset | null>(null);

  const handleSelectPreset = (preset: DemoTaskPreset) => {
    setActivePreset(preset);
    setTaskInput(preset.prompt);
    setShowPresetsMenu(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() && !activePreset) {
      // Pick default preset if empty
      const defaultPreset = DEMO_PRESETS[0];
      setTaskInput(defaultPreset.prompt);
      onSimulateRun(defaultPreset.prompt, defaultPreset);
      return;
    }
    onSimulateRun(taskInput, activePreset || undefined);
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-x-hidden min-h-[calc(100vh-65px)]">
      {/* Upper Main Section: Left Hero Content + Right Galaxy Visualization */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Section: Hero + Task Input Box */}
        <div className="lg:col-span-5 xl:col-span-5 z-20 flex flex-col justify-center space-y-6">
          
          {/* Header kicker */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[11px] md:text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase">
                REVX — RECOVER. EXECUTE. VERIFY.
              </span>
            </div>

            {/* Massive Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-[56px] font-extrabold tracking-tight text-white leading-[1.08]">
              <div>Recover.</div>
              <div className="text-blue-500 drop-shadow-[0_0_25px_rgba(37,99,235,0.45)]">
                Execute.
              </div>
              <div>Verify.</div>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-lg">
              Autonomous workflows. Observable execution. Verified outcomes.
            </p>
          </div>

          {/* Task Input Area matching Reference Screenshot */}
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl bg-[#090d16]/95 border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-4 transition-all focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30"
          >
            {/* Upper row: Document Icon + Textarea */}
            <div className="flex items-start space-x-3">
              <FileText className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <textarea
                id="task-input-field"
                rows={3}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Describe a task for REVX..."
                className="w-full bg-transparent text-sm md:text-[15px] text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Bottom Row inside Input Container */}
            <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
              {/* Left actions: Attachment + Sample data preset selector */}
              <div className="flex items-center space-x-2">
                {/* Paperclip Button */}
                <button
                  type="button"
                  id="attachment-button"
                  title="Attach file (Demo state)"
                  onClick={() => alert('Demo Mode: Attachment staging is simulated.')}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* "Use sample data v" Dropdown Pill */}
                <div className="relative">
                  <button
                    type="button"
                    id="sample-data-dropdown-button"
                    onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
                  >
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Use sample data</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Options */}
                  {showPresetsMenu && (
                    <div
                      className="absolute left-0 bottom-full mb-2 w-80 rounded-xl bg-[#0c101b] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono border-b border-white/10 mb-1">
                        Select Demo Task Scenario
                      </div>
                      {DEMO_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors flex items-start space-x-2.5 group"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-xs font-medium text-slate-200 group-hover:text-blue-300">
                              {preset.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {preset.prompt}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right action: "Run task >" Button */}
              <button
                type="submit"
                id="run-task-button"
                disabled={isSimulating}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_28px_rgba(59,130,246,0.7)] transition-all duration-200 disabled:opacity-70 group"
              >
                {isSimulating ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{isSimulating ? 'Executing demo...' : 'Run task'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>

          {/* Quick Notice pill */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Frontend Demo • Autonomous Recovery & Verification Active</span>
          </div>
        </div>

        {/* Right Section: Galaxy Visualization */}
        <div className="lg:col-span-7 xl:col-span-7 relative w-full h-full min-h-[460px] lg:min-h-[580px] flex items-center justify-center">
          <GalaxyCanvas
            activePhase="EXECUTE"
            onSelectPhase={(phase) => {
              onSelectPhase(phase);
            }}
          />
        </div>
      </div>

      {/* Bottom Horizontal Execution Status Strip */}
      <ExecutionStrip
        steps={steps}
        onOpenDetails={onOpenDetails}
        selectedStepId={selectedStepId}
      />
    </div>
  );
};
