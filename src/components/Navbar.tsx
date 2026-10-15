import React, { useState } from 'react';
import {
  LayoutGrid,
  Clock,
  ShieldCheck,
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import type { NavTab } from '../types';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  isBackendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  pendingApprovalsCount,
  isBackendOnline = true,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="relative w-full z-40 border-b border-white/[0.08] bg-[#05070c]/80 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between">
        {/* Left Section: Wordmark + Navigation */}
        <div className="flex items-center space-x-2 md:space-x-5">
          {/* REVX Wordmark */}
          <div
            onClick={() => onTabChange('workspace')}
            className="flex items-center space-x-1.5 cursor-pointer group pr-2 select-none"
          >
            <span className="font-extrabold text-[19px] tracking-[0.22em] text-white group-hover:text-slate-100 transition-colors">
              REV<span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">X</span>
            </span>
          </div>

          {/* Thin Vertical Separator */}
          <div className="hidden sm:block h-4 w-[1px] bg-white/15" />

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
            {/* 1. Workspace */}
            <button
              id="nav-workspace-tab"
              onClick={() => onTabChange('workspace')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                currentTab === 'workspace'
                  ? 'bg-white/[0.08] text-white border border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-90" />
              <span>Workspace</span>
            </button>

            {/* 2. Runs */}
            <button
              id="nav-runs-tab"
              onClick={() => onTabChange('runs')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                currentTab === 'runs'
                  ? 'bg-white/[0.08] text-white border border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-90" />
              <span>Runs</span>
            </button>

            {/* 3. Verification */}
            <button
              id="nav-verification-tab"
              onClick={() => onTabChange('verification')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                currentTab === 'verification'
                  ? 'bg-white/[0.08] text-white border border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-90" />
              <span>Verification</span>
            </button>

            {/* 4. Approvals */}
            <button
              id="nav-approvals-tab"
              onClick={() => onTabChange('approvals')}
              className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                currentTab === 'approvals'
                  ? 'bg-white/[0.08] text-white border border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-90" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/40 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Section: Status Indicator & User Avatar */}
        <div className="flex items-center space-x-3 select-none">
          {/* Demo Mode Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>DEMO MODE</span>
          </div>

          {/* Backend Online status pill */}
          <div className="relative">
            <button
              id="backend-status-pill"
              onClick={() => setShowStatusModal(!showStatusModal)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isBackendOnline
                  ? 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-400'
              }`}
            >
              {/* Glowing dot */}
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="hidden sm:inline">{isBackendOnline ? 'Backend Online' : 'Local Fallback'}</span>
              <ChevronDown className={`w-3 h-3 ${isBackendOnline ? 'text-emerald-400/70' : 'text-amber-400/70'}`} />
            </button>

            {/* Dropdown status details */}
            {showStatusModal && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0c101b] border border-white/10 shadow-2xl p-3.5 text-xs text-slate-300 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">REVX Gateway</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Demo State</span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                  <p>
                    • <strong>Local Sandbox:</strong> Pure frontend demo environment with zero backend mutations.
                  </p>
                  <p>
                    • <strong>Recovery Engine:</strong> Simulated exponential backoff & idempotency guard.
                  </p>
                  <p>
                    • <strong>Verification:</strong> Cryptographic read-back mock assertions.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Latency: 12ms</span>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar "R" */}
          <div className="relative">
            <button
              id="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-white font-medium text-xs transition-colors shadow-inner"
            >
              <span>R</span>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0c101b] border border-white/10 shadow-2xl p-2 text-xs text-slate-300 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                  <div className="font-medium text-white">REVX Operator</div>
                  <div className="text-[10px] text-slate-400">demo@revx.ai</div>
                </div>
                <button
                  onClick={() => {
                    onTabChange('workspace');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 text-xs"
                >
                  Workspace Console
                </button>
                <button
                  onClick={() => {
                    onTabChange('runs');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 text-xs"
                >
                  Run Audits
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
