import React from 'react';
import { WalletState, ClearnodeInfo } from '../types';
import { Zap, ShieldCheck, Cpu, Wallet, Activity, RefreshCw, Layers, Bot, Lock, Network } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  onOpenWalletModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clearnode: ClearnodeInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onOpenWalletModal,
  activeTab,
  setActiveTab,
  clearnode,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'ai', label: '🤖 AI Agentics', icon: Bot },
    { id: 'web4', label: '🌐 Web 4.0 Routing', icon: Network },
    { id: 'conway', label: '🦠 Conway AI', icon: Cpu },
    { id: 'pqc', label: '🛡️ PQC Engine', icon: Lock },
    { id: 'payments', label: 'Off-Chain Pay', icon: Zap },
    { id: 'dex', label: 'Zero-Gas DEX', icon: Activity },
    { id: 'game', label: 'State Games', icon: RefreshCw },
    { id: 'audit', label: 'Protocol Audit', icon: ShieldCheck },
    { id: 'sandbox', label: 'Dev Sandbox', icon: Wallet },
  ];

  return (
    <header id="navbar-header" className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] shadow-lg shadow-yellow-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <span className="text-yellow-400 font-extrabold text-xl tracking-tighter">🟡</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  YELLOW<span className="text-yellow-400">NITROLITE</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                  ERC-7824
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">State Channel Clearing Protocol</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Wallet & Node Status */}
          <div className="flex items-center space-x-3">
            {/* Clearnode Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-300 font-mono text-[11px]">{clearnode.latencyMs}ms</span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400 text-[11px]">Clearnet</span>
            </div>

            {/* Wallet Connect Button */}
            <button
              id="wallet-connect-btn"
              onClick={onOpenWalletModal}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shadow-lg ${
                wallet.isConnected
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-yellow-400/50'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 hover:from-yellow-300 hover:to-amber-400 border-yellow-300 font-bold shadow-yellow-500/10'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {wallet.isConnected && wallet.address
                  ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                  : 'Connect Wallet'}
              </span>
              {wallet.isDemoMode && (
                <span className="px-1.5 py-0.5 text-[9px] bg-yellow-400 text-zinc-950 font-extrabold rounded">
                  DEMO
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-2 border-t border-zinc-800/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-yellow-400 text-zinc-950 font-semibold' : 'text-zinc-400 bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
