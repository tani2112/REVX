import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { WorkspaceView } from './components/WorkspaceView';
import { RunsView } from './components/RunsView';
import { VerificationView } from './components/VerificationView';
import { ApprovalsView } from './components/ApprovalsView';
import { StepDetailsModal } from './components/StepDetailsModal';
import type { NavTab, WorkflowStep, LogEntry, ApprovalItem, DemoTaskPreset } from './types';
import { INITIAL_STEPS, INITIAL_LOGS, DEMO_APPROVALS } from './mock/demoData';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('workspace');
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(DEMO_APPROVALS);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);
  const [phaseNotification, setPhaseNotification] = useState<string | null>(null);

  // Open details modal
  const handleOpenDetails = (stepId?: string) => {
    setSelectedStepId(stepId || steps[1]?.id || steps[0]?.id);
    setIsDetailsOpen(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  // Interactive Galaxy Node clicked
  const handleSelectPhase = (phase: 'PLAN' | 'EXECUTE' | 'VERIFY') => {
    if (phase === 'PLAN') {
      setPhaseNotification('PLAN Phase: Agent decomposes workflow, selects tools, and establishes verification gates.');
    } else if (phase === 'EXECUTE') {
      setPhaseNotification('EXECUTE Phase: Dispatches sub-tasks, observes I/O, intercepts faults, and triggers recovery.');
    } else if (phase === 'VERIFY') {
      setPhaseNotification('VERIFY Phase: Performs cryptographic read-back, ensures 0 silent state corruption.');
    }
    setTimeout(() => setPhaseNotification(null), 4500);
  };

  // Run Task Simulation (Frontend-only demo)
  const handleSimulateRun = (prompt: string, preset?: DemoTaskPreset) => {
    setIsSimulating(true);

    const targetSteps = preset ? preset.steps : INITIAL_STEPS;
    const targetLogs = preset ? preset.logs : logs;

    // Reset steps to initial simulated run state
    setSteps([
      {
        ...targetSteps[0],
        status: 'running',
        subtitle: 'Analyzing intent and dispatching subagents...',
        progressPercent: 35,
      },
      {
        ...targetSteps[1],
        status: 'pending',
        subtitle: 'Queued',
        progressPercent: 0,
      },
      {
        ...targetSteps[2],
        status: 'pending',
        subtitle: 'Awaiting upstream completion',
        progressPercent: 0,
      },
    ]);

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().substring(11, 23),
      level: 'info',
      message: `[DISPATCH] Started execution for prompt: "${prompt.slice(0, 60)}..."`,
    };
    setLogs([newLog, ...targetLogs]);

    // Simulate timeline progression
    setTimeout(() => {
      setSteps((curr) => [
        {
          ...curr[0],
          status: 'completed',
          subtitle: 'Found 3 matching opportunities',
          progressPercent: 100,
        },
        {
          ...curr[1],
          status: 'recovering',
          subtitle: 'Recovering from storage error...',
          progressPercent: 68,
        },
        curr[2],
      ]);

      const recoverLog: LogEntry = {
        id: `log-${Date.now() + 1}`,
        timestamp: new Date().toISOString().substring(11, 23),
        level: 'recover',
        message: '[AUTONOMOUS_RECOVERY] Lock contention resolved with exponential backoff attempt 2/3.',
      };
      setLogs((prev) => [recoverLog, ...prev]);
      setIsSimulating(false);
    }, 1400);
  };

  // Approvals Actions
  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved' as const } : item
      )
    );
  };

  const handleReject = (id: string, reason: string) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected' as const,
              details: { ...item.details, reason: reason || item.details.reason },
            }
          : item
      )
    );
  };

  const handleResetApprovals = () => {
    setApprovals(DEMO_APPROVALS);
  };

  const selectedStep = steps.find((s) => s.id === selectedStepId);
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#05070c] text-white flex flex-col font-sans relative selection:bg-blue-600/40 selection:text-blue-100 overflow-x-hidden">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Galaxy Phase Notification Toast */}
      {phaseNotification && (
        <div className="fixed top-16 right-6 z-50 max-w-md rounded-2xl bg-[#0c1220]/95 border border-blue-500/40 p-3.5 shadow-2xl backdrop-blur-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center space-x-2 text-xs text-blue-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>{phaseNotification}</span>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'workspace' && (
          <WorkspaceView
            steps={steps}
            onOpenDetails={handleOpenDetails}
            onSimulateRun={handleSimulateRun}
            isSimulating={isSimulating}
            selectedStepId={selectedStepId}
            onSelectPhase={handleSelectPhase}
          />
        )}

        {currentTab === 'runs' && (
          <RunsView
            steps={steps}
            logs={logs}
            onOpenStepDetails={handleOpenDetails}
          />
        )}

        {currentTab === 'verification' && <VerificationView />}

        {currentTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            onReset={handleResetApprovals}
          />
        )}
      </main>

      {/* Step Details Slide-over / Modal */}
      <StepDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        step={selectedStep}
        allSteps={steps}
        logs={logs}
        onSelectStep={(id) => setSelectedStepId(id)}
      />
    </div>
  );
};

export default App;
