import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Hash,
  FileCheck2,
  RefreshCw,
  Check,
} from 'lucide-react';
import { DEMO_VERIFICATIONS } from '../mock/demoData';
import type { VerificationRecord } from '../types';

export const VerificationView: React.FC = () => {
  const [records] = useState<VerificationRecord[]>(DEMO_VERIFICATIONS);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(DEMO_VERIFICATIONS[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleRunVerify = () => {
    setIsVerifying(true);
    setVerifySuccess(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      setTimeout(() => setVerifySuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRYPTOGRAPHIC VERIFICATION LEDGER</span>
            <span className="text-slate-500">•</span>
            <span>ZERO SILENT MUTATION GUARANTEE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Verified Outcomes & Proof
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Every task outcome in REVX is read back, cryptographically checked, and asserted before completion is declared.
          </p>
        </div>

        {/* Action Button: Verify All Records */}
        <button
          onClick={handleRunVerify}
          disabled={isVerifying}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs md:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-75"
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : verifySuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>
            {isVerifying
              ? 'Computing SHA-256...'
              : verifySuccess
              ? 'All 30 Assertions Verified!'
              : 'Re-verify All Hashes'}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#090d16] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ASSERTIONS PASSED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">30 / 30</div>
          <p className="text-[11px] text-emerald-400 mt-0.5">100% Deterministic match</p>
        </div>

        <div className="rounded-2xl bg-[#090d16] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>STATE DRIFT DELTA</span>
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">0.00%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero silent corruption</p>
        </div>

        <div className="rounded-2xl bg-[#090d16] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>MUTATION INTEGRITY</span>
            <Hash className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">Idempotent</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Replay-protected tokens</p>
        </div>

        <div className="rounded-2xl bg-[#090d16] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AUDIT STATUS</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">Signed</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Audit log SHA-256 seal</p>
        </div>
      </div>

      {/* Main Content: Table + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Verification Records Table (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#090d16] border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Verified Record Targets</h3>
            <span className="text-xs font-mono text-slate-500">{records.length} Targets Verified</span>
          </div>

          <div className="divide-y divide-white/5">
            {records.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-blue-600/10 border-l-2 border-blue-500' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-white">{rec.target}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rec.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rec.recordType}</p>
                    <div className="text-[11px] font-mono text-slate-500">
                      Digest: {rec.hash}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-emerald-400">
                      {rec.assertionsPassed}/{rec.totalAssertions} Passed
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{rec.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Record Payload Inspector (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#070a12] border border-white/[0.08] overflow-hidden shadow-xl p-5 flex flex-col justify-between">
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedRecord.target}</h4>
                  <p className="text-xs text-slate-400">{selectedRecord.recordType}</p>
                </div>
                <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  VERIFIED
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Cryptographic Proof
                </label>
                <div className="mt-1.5 p-3 rounded-xl bg-[#0b0f1a] border border-white/10 font-mono text-xs text-blue-300 break-all select-all">
                  SHA-256: {selectedRecord.hash} (Deterministic Seed)
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Read-Back Payload State
                </label>
                <pre className="mt-1.5 p-3 rounded-xl bg-[#0b0f1a] border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-64">
                  {JSON.stringify(selectedRecord.samplePayload, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-blue-300">Verification Invariant:</div>
                <p>
                  REVX asserted that the target state matches the agent's pre-execution intent and contains 0 phantom rows.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Select a verification target to inspect proof
            </div>
          )}

          <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Demo Verifier v1.2</span>
            <span>Zero Backend Dependency</span>
          </div>
        </div>

      </div>
    </div>
  );
};
