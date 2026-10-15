import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Database,
  ShieldCheck,
  Undo2,
  Check,
  X,
} from 'lucide-react';
import type { ApprovalItem } from '../types';
import { DEMO_APPROVALS } from '../mock/demoData';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onReset: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onApprove,
  onReject,
  onReset,
}) => {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem>(approvals[0] || DEMO_APPROVALS[0]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApproveClick = (id: string) => {
    onApprove(id);
    setActionNotice('Item approved successfully in local demo state. No external mutation performed.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRejectConfirm = () => {
    if (rejectingId) {
      onReject(rejectingId, rejectionReason || 'Rejected by human operator review.');
      setRejectingId(null);
      setRejectionReason('');
      setActionNotice('Item rejected in local demo state.');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const currentItem = approvals.find((a) => a.id === selectedItem?.id) || selectedItem;

  return (
    <div className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400">
            <FileCheck className="w-3.5 h-3.5" />
            <span>HUMAN-IN-THE-LOOP CONTROL GATE</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">DEMO SANDBOX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Approval Requests
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous execution pauses at critical human gates (outbound emails, destructive DB writes, financial triggers).
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Reset Demo Approvals</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-xl bg-blue-950/30 border border-blue-500/20 p-3.5 flex items-center justify-between text-xs text-blue-200">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>
            <strong>Demo Safety Assurance:</strong> Actions taken here only update the frontend interface. No emails are sent, no APIs called.
          </span>
        </div>
        {actionNotice && (
          <span className="text-emerald-400 font-mono text-[11px] font-semibold animate-pulse">
            {actionNotice}
          </span>
        )}
      </div>

      {/* Two Column Layout: Items List (Left) & Detailed Approval Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Pending Queue ({approvals.filter((a) => a.status === 'pending').length})
          </h3>

          {approvals.map((item) => {
            const isSelected = currentItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                    : 'bg-[#090d16] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    {item.type === 'email' ? (
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Mail className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Database className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.details.initiator}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Inspection & Action Panel (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#090d16] border border-white/[0.08] p-6 shadow-2xl flex flex-col justify-between">
          {currentItem ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-blue-400 font-semibold uppercase">
                      TYPE: {currentItem.type}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-mono text-slate-400">ID: {currentItem.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {currentItem.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">Risk Level:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                    {currentItem.riskLevel}
                  </span>
                </div>
              </div>

              {/* Guardrails verified badge list */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Pre-Approval Guardrails Evaluated (100% Passed)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentItem.details.guardrailsPassed.map((guard, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center space-x-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{guard}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email or Action Payload Preview */}
              {currentItem.type === 'email' ? (
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Drafted Outbound Email Content
                  </label>
                  <div className="rounded-xl bg-[#060910] border border-white/10 p-4 space-y-3 font-sans text-xs">
                    <div className="pb-2 border-b border-white/10 text-slate-400 space-y-1">
                      <div>
                        <strong className="text-slate-300">To:</strong> {currentItem.recipient}
                      </div>
                      <div>
                        <strong className="text-slate-300">Subject:</strong> {currentItem.subject}
                      </div>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                      {currentItem.bodyPreview}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    SQL Migration Mutation Plan
                  </label>
                  <div className="rounded-xl bg-[#060910] border border-white/10 p-4 font-mono text-xs text-cyan-300 leading-relaxed">
                    <code>
                      {String(currentItem.details.actionPayload.sql || 'MUTATION_STAGED')}
                    </code>
                  </div>
                </div>
              )}

              {/* Action Buttons: Approve & Reject */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs text-slate-400">
                  Status:{' '}
                  <strong className="uppercase text-white">{currentItem.status}</strong>
                </div>

                <div className="flex items-center space-x-3">
                  {currentItem.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => setRejectingId(currentItem.id)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApproveClick(currentItem.id)}
                        className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Dispatch (Demo)</span>
                      </button>
                    </>
                  ) : currentItem.status === 'approved' ? (
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved by Human Operator</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-400 text-xs font-mono">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected by Human Operator</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Select an approval item from the left queue
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0c101b] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-red-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Rejection (Demo Mode)</span>
            </div>
            <p className="text-xs text-slate-300">
              Provide optional feedback for the autonomous agent workflow:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Tone is too formal, refine portfolio link..."
              className="w-full rounded-xl bg-[#070a12] border border-white/10 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
