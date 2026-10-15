import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkspaceView } from './components/WorkspaceView';
import { RunsView } from './components/RunsView';
import { VerificationView } from './components/VerificationView';
import { ApprovalsView } from './components/ApprovalsView';
import { StepDetailsModal } from './components/StepDetailsModal';
import type { NavTab, WorkflowStep, LogEntry, ApprovalItem, VerificationRecord, DemoTaskPreset } from './types';
import { INITIAL_STEPS, INITIAL_LOGS, DEMO_APPROVALS, DEMO_VERIFICATIONS } from './mock/demoData';
import {
  api,
  mapBackendStep,
  mapBackendLog,
  mapBackendVerification,
  mapBackendApproval,
} from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('workspace');
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(DEMO_APPROVALS);
  const [verifications, setVerifications] = useState<VerificationRecord[]>(DEMO_VERIFICATIONS);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);
  const [phaseNotification, setPhaseNotification] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const health = await api.getHealth();
        if (!isMounted) return;
        setIsBackendOnline(health.status === 'healthy');

        const latestRun = await api.getLatestRun();
        if (!isMounted) return;
        if (latestRun) {
          setActiveRunId(latestRun.id);
          if (latestRun.steps && latestRun.steps.length > 0) {
            setSteps(latestRun.steps.map(mapBackendStep));
          }
          if (latestRun.logs && latestRun.logs.length > 0) {
            setLogs(latestRun.logs.map(mapBackendLog));
          }
        }

        const backendVerifications = await api.getVerifications();
        if (!isMounted) return;
        if (backendVerifications && backendVerifications.length > 0) {
          setVerifications(backendVerifications.map(mapBackendVerification));
        }

        const backendApprovals = await api.getApprovals();
        if (!isMounted) return;
        if (backendApprovals && backendApprovals.length > 0) {
          setApprovals(backendApprovals.map(mapBackendApproval));
        }
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  // Run Task with Real Backend Execution
  const handleSimulateRun = async (prompt: string, preset?: DemoTaskPreset) => {
    setIsSimulating(true);

    // Initial visual feedback while backend computes
    setSteps((curr) => [
      {
        ...curr[0],
        status: 'running',
        subtitle: 'Analyzing intent and dispatching subagents...',
        progressPercent: 35,
      },
      {
        ...curr[1],
        status: 'pending',
        subtitle: 'Queued',
        progressPercent: 0,
      },
      {
        ...curr[2],
        status: 'pending',
        subtitle: 'Awaiting upstream completion',
        progressPercent: 0,
      },
    ]);

    const initialDispatchLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `[DISPATCH] Started execution for prompt: "${prompt.slice(0, 60)}..."`,
    };
    setLogs((prev) => [initialDispatchLog, ...prev]);

    try {
      // Connect to real backend API with failure injection enabled for demo
      await api.createTask(prompt, true, preset?.title);

      // Brief animation pacing so the user experiences the observability transitions
      setTimeout(async () => {
        try {
          const updatedRun = await api.getLatestRun();
          if (updatedRun) {
            setActiveRunId(updatedRun.id);
            setSteps(updatedRun.steps.map(mapBackendStep));
            setLogs(updatedRun.logs.map(mapBackendLog));
          }

          const updatedVerifications = await api.getVerifications();
          if (updatedVerifications.length > 0) {
            setVerifications(updatedVerifications.map(mapBackendVerification));
          }

          const updatedApprovals = await api.getApprovals();
          if (updatedApprovals.length > 0) {
            setApprovals(updatedApprovals.map(mapBackendApproval));
          }
        } finally {
          setIsSimulating(false);
        }
      }, 900);

    } catch (err) {
      console.warn('Backend execution error, utilizing local mock fallback:', err);
      // Fallback to local simulated progression if backend was temporarily unreachable
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
        setIsSimulating(false);
      }, 1200);
    }
  };

  // Approvals Actions connected to real backend
  const handleApprove = async (id: string) => {
    try {
      await api.submitApprovalDecision(id, 'approved', 'Approved by human operator');
      const updated = await api.getApprovals();
      setApprovals(updated.map(mapBackendApproval));
    } catch {
      // Fallback local update
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item))
      );
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.submitApprovalDecision(id, 'rejected', reason);
      const updated = await api.getApprovals();
      setApprovals(updated.map(mapBackendApproval));
    } catch {
      setApprovals((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'rejected' as const, details: { ...item.details, reason } }
            : item
        )
      );
    }
  };

  const handleResetApprovals = async () => {
    try {
      const resetList = await api.resetApprovals();
      setApprovals(resetList.map(mapBackendApproval));
    } catch {
      setApprovals(DEMO_APPROVALS);
    }
  };

  const handleDispatchProtectedAction = async (id: string) => {
    return api.dispatchProtectedAction(id);
  };

  // Re-verify action
  const handleReverify = async () => {
    if (activeRunId) {
      await api.reverifyRun(activeRunId);
    }
    const updatedVerifications = await api.getVerifications();
    if (updatedVerifications.length > 0) {
      setVerifications(updatedVerifications.map(mapBackendVerification));
    }
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
        isBackendOnline={isBackendOnline}
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

        {currentTab === 'verification' && (
          <VerificationView
            records={verifications}
            onReverify={handleReverify}
          />
        )}

        {currentTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            onReset={handleResetApprovals}
            onDispatchProtectedAction={handleDispatchProtectedAction}
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
