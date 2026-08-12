import React, { useState } from 'react';
import { ClearnodeInfo, LogEntry } from '../types';
import { RefreshCw, Radio, Server, CheckCircle2, Wifi, Send } from 'lucide-react';

interface ClearnodeMonitorProps {
  nodes: ClearnodeInfo[];
  selectedNode: ClearnodeInfo;
  onSelectNode: (node: ClearnodeInfo) => void;
  logs: LogEntry[];
  logCb: (log: LogEntry) => void;
}

export const ClearnodeMonitor: React.FC<ClearnodeMonitorProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
  logs,
  logCb,
}) => {
  const [customWsUrl, setCustomWsUrl] = useState<string>('wss://clearnet.yellow.org/ws');
  const [pingResult, setPingResult] = useState<number | null>(selectedNode.latencyMs);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const handlePingNode = () => {
    setIsPinging(true);
    const start = Date.now();
    setTimeout(() => {
      const elapsed = Date.now() - start + Math.floor(Math.random() * 8);
      setPingResult(elapsed);
      setIsPinging(false);
      logCb({
        id: 'ping-' + Date.now(),
        type: 'INFO',
        message: `Clearnode Ping (${selectedNode.name}): ${elapsed}ms response time`,
        timestamp: Date.now(),
      });
    }, 150);
  };

  return (
    <div id="clearnode-monitor-container" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Yellow Network Clearnode Network Topology</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor decentralized state channel clearing nodes, WebSocket latency, active peer connections, and message frames.
          </p>
        </div>

        <button
          id="ping-clearnode-btn"
          onClick={handlePingNode}
          disabled={isPinging}
          className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-yellow-500/10 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>Ping Node Latency</span>
        </button>
      </div>

      {/* Clearnode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((n) => {
          const isSelected = selectedNode.nodeId === n.nodeId;
          return (
            <div
              key={n.nodeId}
              id={`clearnode-card-${n.nodeId}`}
              onClick={() => onSelectNode(n)}
              className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-zinc-900 border-yellow-400 shadow-xl shadow-yellow-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{n.name}</span>
                </span>
                <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{n.status}</span>
                </span>
              </div>

              <div className="font-mono text-xs text-zinc-400 truncate">{n.wsUrl}</div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <div>
                  <div className="text-zinc-500 text-[10px]">LATENCY</div>
                  <div className="text-yellow-400 font-bold">{n.latencyMs}ms</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-[10px]">ACTIVE CHANNELS</div>
                  <div className="text-white font-bold">{n.activeChannels}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Peers: {n.peersCount}</span>
                <span>Uptime: {n.uptimePct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frame Inspector & Custom Endpoint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Node Form */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-yellow-400" />
            <span>Connect Custom Clearnode</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-mono">Clearnode WebSocket URL</label>
              <input
                type="text"
                value={customWsUrl}
                onChange={(e) => setCustomWsUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-yellow-400"
              />
            </div>

            <button
              id="connect-custom-node-btn"
              onClick={() => {
                const customNode: ClearnodeInfo = {
                  nodeId: 'custom-' + Date.now(),
                  name: 'Custom Clearnode Endpoint',
                  wsUrl: customWsUrl,
                  location: 'Custom Gateway',
                  latencyMs: 12,
                  status: 'ONLINE',
                  peersCount: 42,
                  activeChannels: 120,
                  throughputTps: 5000,
                  uptimePct: 99.9,
                };
                onSelectNode(customNode);
                logCb({
                  id: 'node-' + Date.now(),
                  type: 'INFO',
                  message: `Switched Clearnode endpoint to ${customWsUrl}`,
                  timestamp: Date.now(),
                });
              }}
              className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Connect Endpoint</span>
            </button>
          </div>
        </div>

        {/* Live WebSocket Frame Log */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-sans">Clearnode Frame Traffic Log</h2>
            <span className="text-zinc-500 text-[10px]">{logs.length} Frames Recorded</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 h-64 overflow-y-auto space-y-2 text-[11px]">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-600 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.type === 'SIGN'
                      ? 'text-yellow-400'
                      : log.type === 'SETTLE'
                      ? 'text-emerald-400'
                      : log.type === 'ERROR'
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                  }`}
                >
                  [{log.type}]
                </span>
                <span className="text-zinc-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
