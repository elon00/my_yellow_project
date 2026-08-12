import React from 'react';
import { SessionState, ClearnodeInfo } from '../types';
import { Zap, ShieldCheck, ArrowUpRight, Lock, CheckCircle2, RefreshCw, Flame, DollarSign, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardOverviewProps {
  sessions: SessionState[];
  clearnode: ClearnodeInfo;
  onNavigateTab: (tab: string) => void;
  onOpenNewSession: () => void;
}

const PERFORMANCE_DATA = [
  { time: '10:00', offchainTps: 4200, gasSavedUsd: 10500 },
  { time: '10:05', offchainTps: 5800, gasSavedUsd: 14500 },
  { time: '10:10', offchainTps: 7400, gasSavedUsd: 18500 },
  { time: '10:15', offchainTps: 9200, gasSavedUsd: 23000 },
  { time: '10:20', offchainTps: 8600, gasSavedUsd: 21500 },
  { time: '10:25', offchainTps: 10500, gasSavedUsd: 26250 },
  { time: '10:30', offchainTps: 12400, gasSavedUsd: 31000 },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sessions,
  clearnode,
  onNavigateTab,
  onOpenNewSession,
}) => {
  const totalOffChainTx = sessions.reduce((acc, s) => acc + s.seq * 150, 48290);
  const totalVolumeUsd = sessions.reduce((acc, s) => acc + s.totalDeposit, 125000);
  const totalGasSaved = Math.round(totalOffChainTx * 2.5); // $2.50 avg gas saved per off-chain state

  return (
    <div id="dashboard-overview-container" className="space-y-8">
      {/* Hero Banner with Yellow Network Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 p-6 md:p-8 border border-yellow-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>ERC-7824 State Channel Clearing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              High-Frequency Off-Chain Clearing for <span className="text-yellow-400">Web3 & Decentralized Finance</span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Yellow Nitrolite enables instant, zero-gas, multi-party state channel sessions with sub-millisecond off-chain execution, EIP-712 cryptographic proposals, and secure EVM settlement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              id="hero-create-session-btn"
              onClick={onOpenNewSession}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-yellow-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>Open Nitrolite Channel</span>
            </button>
            <button
              id="hero-view-audit-btn"
              onClick={() => onNavigateTab('audit')}
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>Protocol Security Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>OFF-CHAIN THROUGHPUT</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            12,400 <span className="text-xs text-yellow-400">TPS</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Sub-2ms Finality</span>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>ESTIMATED GAS SAVED</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${totalGasSaved.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-400 mt-1">Zero Gas for Off-Chain State Transitions</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>ACTIVE CHANNELS</span>
            <Lock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(sessions.length + 1420).toLocaleString()}
          </div>
          <p className="text-xs text-zinc-400 mt-1">EIP-712 Multi-Sig Collateral</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-2">
            <span>CLEARNODE STATUS</span>
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center space-x-2">
            <span className="text-emerald-400">ONLINE</span>
            <span className="text-xs text-zinc-400">({clearnode.latencyMs}ms)</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{clearnode.name}</p>
        </div>
      </div>

      {/* Web 4.0, AI Agentics, Conway Automaton & PQC Quick Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('ai')}
          className="p-5 rounded-xl bg-gradient-to-b from-yellow-500/10 to-zinc-900/90 border border-yellow-500/30 text-left hover:border-yellow-400 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 text-yellow-300">
              FEATURE
            </span>
            <ArrowUpRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">🤖 AI Agentics Chat Bot</h3>
          <p className="text-xs text-zinc-400">
            Copilot for ERC-7824 state channel execution & automated audits.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('web4')}
          className="p-5 rounded-xl bg-gradient-to-b from-blue-500/10 to-zinc-900/90 border border-blue-500/30 text-left hover:border-blue-400 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-400/20 text-blue-300">
              WEB 4.0
            </span>
            <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">🌐 Autonomous Routing</h3>
          <p className="text-xs text-zinc-400">
            Machine-to-machine AI agent state negotiation & arbitrage.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('conway')}
          className="p-5 rounded-xl bg-gradient-to-b from-emerald-500/10 to-zinc-900/90 border border-emerald-500/30 text-left hover:border-emerald-400 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300">
              AUTOMATON
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">🦠 Conway Automaton AI</h3>
          <p className="text-xs text-zinc-400">
            Cellular automaton entropy engine for channel rebalancing.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('pqc')}
          className="p-5 rounded-xl bg-gradient-to-b from-purple-500/10 to-zinc-900/90 border border-purple-500/30 text-left hover:border-purple-400 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-400/20 text-purple-300">
              PQC
            </span>
            <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">🛡️ Post-Quantum Engine</h3>
          <p className="text-xs text-zinc-400">
            CRYSTALS-Dilithium5 quantum-proof signatures & Shor tests.
          </p>
        </button>
      </div>

      {/* Chart Section & Lifecycle Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live State Channel Throughput</h2>
              <p className="text-xs text-zinc-400">Off-chain state updates & cumulative gas savings</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
              Clearnet Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="offchainTps" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#yellowGradient)" name="TPS" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ERC-7824 Protocol Flow Diagram */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>ERC-7824 State Lifecycle</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">How off-chain state channel clearing operates</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-zinc-950 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <div className="text-white font-semibold">Deposit & Channel Open</div>
                <div className="text-zinc-500 text-[11px]">Lock collateral on EVM settlement contract</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-zinc-950 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <div className="text-white font-semibold">Off-Chain State Exchange</div>
                <div className="text-zinc-500 text-[11px]">Sub-2ms EIP-712 state proposals (`seq_n`)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-zinc-950 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <div className="text-white font-semibold">Clearnode Match & Routing</div>
                <div className="text-zinc-500 text-[11px]">Clearnet signature collection & verification</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div>
                <div className="text-white font-semibold">Cooperative EVM Settlement</div>
                <div className="text-zinc-500 text-[11px]">Single final state submitted on-chain</div>
              </div>
            </div>
          </div>

          <button
            id="view-protocol-spec-btn"
            onClick={() => onNavigateTab('sandbox')}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
          >
            <span>View Interactive Protocol Spec</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Nitrolite State Channel Sessions</h2>
            <p className="text-xs text-zinc-400">Live multi-party state channels with EIP-712 dual signatures</p>
          </div>
          <button
            id="open-new-session-dashboard-btn"
            onClick={onOpenNewSession}
            className="px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-xs font-semibold flex items-center space-x-1 transition-all"
          >
            <span>+ New Channel</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => (
            <div key={s.sessionId} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                  {s.appId}
                </span>
                <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.status}</span>
                </span>
              </div>

              <div className="font-mono text-xs text-zinc-300 truncate">
                Session ID: <span className="text-zinc-500">{s.sessionId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 font-mono">
                <div>
                  <div className="text-zinc-500 text-[10px]">CURRENT SEQ</div>
                  <div className="text-yellow-400 font-bold">#{s.seq}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px]">TOTAL COLLATERAL</div>
                  <div className="text-white font-bold">{s.totalDeposit} {s.tokenSymbol}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">Participants: {s.participants.length}</span>
                <button
                  id={`open-session-pay-btn-${s.sessionId.slice(0, 6)}`}
                  onClick={() => onNavigateTab('payments')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium text-xs flex items-center space-x-1"
                >
                  <span>Execute Off-Chain Pay</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
