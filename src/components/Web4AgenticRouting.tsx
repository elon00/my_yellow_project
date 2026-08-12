import React, { useState, useEffect } from 'react';
import { Cpu, Zap, ShieldCheck, ArrowRight, Play, CheckCircle2, Activity, Network, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { SessionState, Web4Agent, LogEntry } from '../types';

interface Web4AgenticRoutingProps {
  session: SessionState;
  onUpdateSession: (updated: SessionState) => void;
  logCb: (log: LogEntry) => void;
}

const INITIAL_AGENTS: Web4Agent[] = [
  {
    id: 'ag-1',
    name: 'Agent-Alpha (HFT Trader)',
    role: 'ARBITRAGE_BOT',
    trustScore: 99.4,
    reputation: 985,
    activeNegotiations: 12,
    autoSignThreshold: 500,
    pqcSupported: true,
    status: 'NEGOTIATING',
  },
  {
    id: 'ag-2',
    name: 'Agent-Beta (Market Maker)',
    role: 'LIQUIDITY_ROUTER',
    trustScore: 99.8,
    reputation: 1040,
    activeNegotiations: 28,
    autoSignThreshold: 1000,
    pqcSupported: true,
    status: 'IDLE',
  },
  {
    id: 'ag-3',
    name: 'Agent-Gamma (Clearnode Gateway)',
    role: 'CLEARNODE_OPERATOR',
    trustScore: 100.0,
    reputation: 1500,
    activeNegotiations: 142,
    autoSignThreshold: 5000,
    pqcSupported: true,
    status: 'EXECUTING_SETTLEMENT',
  },
  {
    id: 'ag-4',
    name: 'Agent-Delta (PQC Guardian)',
    role: 'CREDIT_GUARDIAN',
    trustScore: 99.9,
    reputation: 1120,
    activeNegotiations: 5,
    autoSignThreshold: 2000,
    pqcSupported: true,
    status: 'IDLE',
  },
];

export const Web4AgenticRouting: React.FC<Web4AgenticRoutingProps> = ({
  session,
  onUpdateSession,
  logCb,
}) => {
  const [agents, setAgents] = useState<Web4Agent[]>(INITIAL_AGENTS);
  const [strategy, setStrategy] = useState<'ARBITRAGE' | 'LIQUIDITY' | 'CREDIT'>('ARBITRAGE');
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [autoTps, setAutoTps] = useState<number>(450);
  const [negotiationLogs, setNegotiationLogs] = useState<any[]>([
    {
      id: 'neg-1',
      sender: 'Agent-Alpha',
      receiver: 'Agent-Beta',
      delta: '+12.50 USDT',
      seq: session.seq,
      pqcHash: '0x8f2a...c4e1',
      timestamp: Date.now() - 12000,
      status: 'AUTONOMOUS_SIGNED',
    },
    {
      id: 'neg-2',
      sender: 'Agent-Gamma',
      receiver: 'Agent-Alpha',
      delta: '-5.00 USDT',
      seq: session.seq - 1,
      pqcHash: '0x3b9e...7a12',
      timestamp: Date.now() - 24000,
      status: 'AUTONOMOUS_SIGNED',
    },
  ]);

  const [tpsHistory, setTpsHistory] = useState([
    { time: '10:00', tps: 320, latency: 1.4 },
    { time: '10:05', tps: 410, latency: 1.2 },
    { time: '10:10', tps: 580, latency: 0.9 },
    { time: '10:15', tps: 720, latency: 0.8 },
    { time: '10:20', tps: 890, latency: 0.7 },
  ]);

  // Auto-negotiation loop simulation
  useEffect(() => {
    let interval: any;
    if (isAutomating) {
      interval = setInterval(() => {
        triggerAutonomousNegotiation();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutomating, session]);

  const triggerAutonomousNegotiation = () => {
    const p1 = session.participants[0];
    const p2 = session.participants[1];
    const currentB1 = session.balances[p1] || 500;
    const currentB2 = session.balances[p2] || 500;

    const delta = parseFloat((Math.random() * 15 + 2).toFixed(2));
    const direction = Math.random() > 0.5 ? 1 : -1;

    let newB1 = currentB1;
    let newB2 = currentB2;

    if (direction === 1 && currentB1 >= delta) {
      newB1 -= delta;
      newB2 += delta;
    } else if (direction === -1 && currentB2 >= delta) {
      newB1 += delta;
      newB2 -= delta;
    }

    const nextSeq = session.seq + 1;

    const updatedSession: SessionState = {
      ...session,
      seq: nextSeq,
      balances: {
        [p1]: newB1,
        [p2]: newB2,
      },
      lastUpdated: Date.now(),
    };

    onUpdateSession(updatedSession);

    const newLog = {
      id: 'neg-' + Date.now(),
      sender: direction === 1 ? 'Agent-Alpha' : 'Agent-Beta',
      receiver: direction === 1 ? 'Agent-Beta' : 'Agent-Alpha',
      delta: `${direction === 1 ? '-' : '+'}${delta.toFixed(2)} USDT`,
      seq: nextSeq,
      pqcHash: '0x' + Math.random().toString(16).slice(2, 10) + '...pqc',
      timestamp: Date.now(),
      status: 'AUTONOMOUS_SIGNED',
    };

    setNegotiationLogs((prev) => [newLog, ...prev.slice(0, 19)]);

    logCb({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `🤖 Web 4.0 Agentic Proposal seq_${nextSeq} (${newLog.delta}) Dual-Signed (EIP-712 + Dilithium5)`,
      timestamp: Date.now(),
    });

    setAutoTps((prev) => Math.floor(prev + Math.random() * 50 - 20));

    setTpsHistory((prev) => [
      ...prev.slice(1),
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tps: Math.floor(600 + Math.random() * 400),
        latency: parseFloat((0.6 + Math.random() * 0.5).toFixed(2)),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-yellow-500/10 to-zinc-900 border border-blue-500/20 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Web 4.0 Autonomous Agentic Routing</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Machine-to-Machine Economy
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Zero-friction off-chain AI state negotiation, agent trust scoring, and sub-millisecond automated arbitrage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutomating(!isAutomating)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              isAutomating
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 shadow-lg shadow-yellow-500/20'
            }`}
          >
            {isAutomating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Pause Auto-Agent
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start Web 4.0 Autonomous Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Autonomous Agents Active</span>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            4 <span className="text-xs text-emerald-400 font-normal">100% Online</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Agent Negotiation TPS</span>
          <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2 font-mono">
            {autoTps} <span className="text-xs text-zinc-400 font-normal">tx/sec</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Avg State Negotiation Latency</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            0.74 ms
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-500 font-medium">Post-Quantum Signature Security</span>
          <div className="text-2xl font-bold text-blue-400 flex items-center gap-1.5 text-xs font-mono">
            <Lock className="w-4 h-4 text-blue-400" /> CRYSTALS-Dilithium5
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Directory */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                Active Web 4.0 AI Agents
              </span>
              <span className="text-xs text-zinc-500">Auto-Signing</span>
            </h3>

            <div className="space-y-3">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-blue-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{ag.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ag.status === 'NEGOTIATING'
                          ? 'bg-yellow-400/20 text-yellow-300'
                          : ag.status === 'EXECUTING_SETTLEMENT'
                          ? 'bg-blue-400/20 text-blue-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                    <div>
                      Trust Score: <span className="text-emerald-400 font-bold">{ag.trustScore}%</span>
                    </div>
                    <div>
                      Reputation: <span className="text-yellow-400 font-bold">{ag.reputation}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80">
                    <span>Auto-Limit: ${ag.autoSignThreshold}</span>
                    <span className="text-blue-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> PQC Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Negotiation Stream & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* TPS Velocity Chart */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                Real-Time Machine Negotiation Throughput (TPS)
              </h3>
              <span className="text-xs text-zinc-500 font-mono">0.00 Gas / Off-Chain</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tpsHistory}>
                  <defs>
                    <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="tps" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#tpsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Agent Negotiation Stream */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Live Agent-to-Agent State Channel Proposals
              </h3>
              <button
                onClick={triggerAutonomousNegotiation}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-yellow-400" /> Step Single Negotiation
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {negotiationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">{log.sender}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-yellow-400 font-bold">{log.receiver}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold">{log.delta}</span>
                    <span className="text-zinc-500">seq_{log.seq}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
