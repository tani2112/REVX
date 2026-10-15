import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { WorkspaceView } from './components/WorkspaceView';
import { RunsView } from './components/RunsView';
import { VerificationView } from './components/VerificationView';
import { ApprovalsView } from './components/ApprovalsView';
import { StepDetailsModal } from './components/StepDetailsModal';
import { TaskExecutionScreen } from './components/TaskExecutionScreen';
import { TaskResultsView } from './components/TaskResultsView';
import type { NavTab, WorkflowStep, LogEntry, ApprovalItem, VerificationRecord, DemoTaskPreset } from './types';
import { INITIAL_STEPS, INITIAL_LOGS, DEMO_APPROVALS, DEMO_VERIFICATIONS } from './mock/demoData';
import {
  api,
  mapBackendStep,
  mapBackendLog,
  mapBackendVerification,
  mapBackendApproval,
  type BackendRun,
  type BackendRunDetail,
} from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('workspace');
  const [runs, setRuns] = useState<BackendRun[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(DEMO_APPROVALS);
  const [verifications, setVerifications] = useState<VerificationRecord[]>(DEMO_VERIFICATIONS);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeRunDetail, setActiveRunDetail] = useState<BackendRunDetail | null>(null);
  const [activeTaskPrompt, setActiveTaskPrompt] = useState<string>('Find Fall 2026 AI/ML Software Engineering Internships with remote work and sponsor verification');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [isSimulating, setIsSimulating] = useState(false);
  const [phaseNotification, setPhaseNotification] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Centralized data refresh from real SQLite backend
  const refreshAllData = useCallback(async (targetRunId?: string) => {
    try {
      const health = await api.getHealth();
      setIsBackendOnline(health.status === 'healthy');

      const allRuns = await api.getRuns();
      setRuns(allRuns);

      const runIdToFetch = targetRunId || activeRunId || (allRuns.length > 0 ? allRuns[0].id : null);
      if (runIdToFetch) {
        try {
          const runDetail = await api.getRunDetails(runIdToFetch);
          setActiveRunId(runDetail.id);
          setActiveRunDetail(runDetail);
          if (runDetail.steps && runDetail.steps.length > 0) {
            setSteps(runDetail.steps.map(mapBackendStep));
          }
          if (runDetail.logs && runDetail.logs.length > 0) {
            setLogs(runDetail.logs.map(mapBackendLog));
          }
          if (runDetail.task?.description) {
            setActiveTaskPrompt(runDetail.task.description);
          }
        } catch {
          const latestRun = await api.getLatestRun();
          if (latestRun) {
            setActiveRunId(latestRun.id);
            setActiveRunDetail(latestRun);
            if (latestRun.steps && latestRun.steps.length > 0) setSteps(latestRun.steps.map(mapBackendStep));
            if (latestRun.logs && latestRun.logs.length > 0) setLogs(latestRun.logs.map(mapBackendLog));
          }
        }
      }

      const backendVerifications = await api.getVerifications();
      if (backendVerifications && backendVerifications.length > 0) {
        setVerifications(backendVerifications.map(mapBackendVerification));
      }

      const backendApprovals = await api.getApprovals();
      if (backendApprovals && backendApprovals.length > 0) {
        setApprovals(backendApprovals.map(mapBackendApproval));
      }
    } catch {
      setIsBackendOnline(false);
    }
  }, [activeRunId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) await refreshAllData();
    };
    init();

    const interval = setInterval(() => {
      if (isMounted && !isSimulating) {
        refreshAllData();
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshAllData, isSimulating]);

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
    setActiveTaskPrompt(prompt);
    setSubmissionError(null);
    setCurrentTab('execution');

    // Initial visual feedback while backend computes
    setSteps((curr) => [
      {
        ...curr[0],
        status: 'running',
        subtitle: 'Analyzing intent and planning deterministic execution...',
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
      const taskRes = await api.createTask(prompt, true, preset?.title);
      const targetRunId = taskRes.run_id;

      // Synchronize all views with the freshly generated run
      await refreshAllData(targetRunId);

      // Observation window (2.0s) on execution console to let user inspect
      // real telemetry and step recovery, then automatically transition to results
      setTimeout(() => {
        setIsSimulating(false);
        setCurrentTab((curr) => (curr === 'execution' ? 'results' : curr));
      }, 2000);

    } catch (err: unknown) {
      console.error('Backend execution error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Workflow dispatch failed.';
      setSubmissionError(errorMessage);
      setIsSimulating(false);
    }
  };

  // Select a specific run from the Runs page or verification
  const handleSelectRun = async (runId: string) => {
    try {
      const detail = await api.getRunDetails(runId);
      setActiveRunId(detail.id);
      setActiveRunDetail(detail);
      if (detail.task?.description) {
        setActiveTaskPrompt(detail.task.description);
      }
      if (detail.steps && detail.steps.length > 0) {
        setSteps(detail.steps.map(mapBackendStep));
      }
      if (detail.logs && detail.logs.length > 0) {
        setLogs(detail.logs.map(mapBackendLog));
      }
    } catch (err) {
      console.error('Failed to select run:', err);
    }
  };

  // Approvals Actions connected to real backend
  const handleApprove = async (id: string) => {
    try {
      await api.submitApprovalDecision(id, 'approved', 'Approved by human operator');
      await refreshAllData();
    } catch {
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item))
      );
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.submitApprovalDecision(id, 'rejected', reason);
      await refreshAllData();
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
      await refreshAllData();
    } catch {
      setApprovals(DEMO_APPROVALS);
    }
  };

  const handleDispatchProtectedAction = async (id: string) => {
    const res = await api.dispatchProtectedAction(id);
    await refreshAllData();
    return res;
  };

  // Re-verify action
  const handleReverify = async (targetRunId?: string) => {
    const runToReverify = targetRunId || activeRunId;
    if (runToReverify) {
      await api.reverifyRun(runToReverify);
    }
    await refreshAllData(runToReverify || undefined);
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
            submissionError={submissionError}
          />
        )}

        {currentTab === 'execution' && (
          <TaskExecutionScreen
            taskPrompt={activeTaskPrompt}
            runDetail={activeRunDetail}
            onBackToWorkspace={() => setCurrentTab('workspace')}
            onViewResults={() => setCurrentTab('results')}
            error={submissionError}
          />
        )}

        {currentTab === 'results' && activeRunDetail && (
          <TaskResultsView
            runDetail={activeRunDetail}
            taskPrompt={activeTaskPrompt}
            onBackToWorkspace={() => setCurrentTab('workspace')}
            onOpenRunsView={() => setCurrentTab('runs')}
            onOpenApprovalsView={() => setCurrentTab('approvals')}
            onReverify={() => handleReverify(activeRunDetail.id)}
          />
        )}

        {currentTab === 'results' && !activeRunDetail && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400">
              <RotateCcw className="w-5 h-5 animate-spin" />
            </div>
            <div className="text-slate-300 font-medium">Loading Run Results from Backend...</div>
            <button
              onClick={() => setCurrentTab('workspace')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 hover:text-white font-mono"
            >
              Back to Workspace
            </button>
          </div>
        )}

        {currentTab === 'runs' && (
          <RunsView
            runs={runs}
            steps={steps}
            logs={logs}
            onOpenStepDetails={handleOpenDetails}
            activeRunId={activeRunId}
            activeRunDetail={activeRunDetail}
            onSelectRun={handleSelectRun}
            onRefreshRuns={() => refreshAllData(activeRunId || undefined)}
            onViewResults={() => setCurrentTab('results')}
          />
        )}

        {currentTab === 'verification' && (
          <VerificationView
            records={verifications}
            onReverify={handleReverify}
            onOpenRunResults={(runId) => {
              if (runId) {
                handleSelectRun(runId).then(() => setCurrentTab('results'));
              } else {
                setCurrentTab('results');
              }
            }}
            onOpenRunsView={(runId) => {
              if (runId) {
                handleSelectRun(runId).then(() => setCurrentTab('runs'));
              } else {
                setCurrentTab('runs');
              }
            }}
          />
        )}

        {currentTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            onReset={handleResetApprovals}
            onDispatchProtectedAction={handleDispatchProtectedAction}
            onOpenRunDetails={(runId) => {
              handleSelectRun(runId).then(() => setCurrentTab('runs'));
            }}
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
