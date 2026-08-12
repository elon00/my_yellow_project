import React, { useState, useEffect, useRef } from 'react';
import { SessionState, WalletState, LogEntry, PaymentTx } from '../types';
import { Zap, Play, Pause, RefreshCw, Send, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { auditStateInvariant, generateDemoSignature, calculateStateHash, simulateOnChainSettlement } from '../lib/nitroliteClient';

interface MicropaymentStreamsProps {
  session: SessionState;
  onUpdateSession: (updated: SessionState) => void;
  wallet: WalletState;
  logCb: (log: LogEntry) => void;
}

export const MicropaymentStreams: React.FC<MicropaymentStreamsProps> = ({
  session,
  onUpdateSession,
  wallet,
  logCb,
}) => {
  const [amount, setAmount] = useState<number>(5.0);
  const [recipient, setRecipient] = useState<string>(session.participants[1] || '0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9');
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(200); // ms per payment frame
  const [history, setHistory] = useState<PaymentTx[]>([]);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sender = wallet.address || session.participants[0];

  const handleExecutePayment = () => {
    if (amount <= 0) return;

    const currentSenderBalance = session.balances[sender] || 0;
    if (currentSenderBalance < amount) {
      logCb({
        id: 'err-' + Date.now(),
        type: 'ERROR',
        message: `Insufficient sender balance in channel! Balance: ${currentSenderBalance}, requested: ${amount}`,
        timestamp: Date.now(),
      });
      setIsAutoStreaming(false);
      return;
    }

    const newSeq = session.seq + 1;
    const newBalances = { ...session.balances };
    newBalances[sender] = Number((newBalances[sender] - amount).toFixed(4));
    newBalances[recipient] = Number(((newBalances[recipient] || 0) + amount).toFixed(4));

    // Audit invariants
    const auditResult = auditStateInvariant(session, newSeq, newBalances);
    if (!auditResult.valid) {
      logCb({
        id: 'err-' + Date.now(),
        type: 'ERROR',
        message: `State Invariant Audit Failed: ${auditResult.reason}`,
        timestamp: Date.now(),
      });
      setIsAutoStreaming(false);
      return;
    }

    const sig = generateDemoSignature(sender, session.sessionId, newSeq);
    const updatedSession: SessionState = {
      ...session,
      seq: newSeq,
      balances: newBalances,
      lastUpdated: Date.now(),
      signatures: {
        ...session.signatures,
        [sender]: sig,
      },
    };

    onUpdateSession(updatedSession);

    const newTx: PaymentTx = {
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      sessionId: session.sessionId,
      from: sender,
      to: recipient,
      amount: amount,
      tokenSymbol: session.tokenSymbol,
      seq: newSeq,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      signature: sig,
      latencyMs: Math.floor(Math.random() * 2) + 1, // 1-2ms off-chain latency
      gasSavedUsd: 2.50,
    };

    setHistory((prev) => [newTx, ...prev.slice(0, 49)]);

    logCb({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `Off-Chain State Proposed (seq #${newSeq}) | Sent ${amount} ${session.tokenSymbol} -> ${recipient.slice(0, 6)}...`,
      data: { seq: newSeq, stateHash: calculateStateHash(session.sessionId, newSeq, newBalances) },
      timestamp: Date.now(),
    });
  };

  // Handle continuous stream
  useEffect(() => {
    if (isAutoStreaming) {
      streamTimerRef.current = setInterval(() => {
        handleExecutePayment();
      }, streamSpeed);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isAutoStreaming, streamSpeed, session, sender, recipient, amount]);

  const handleSettlement = async () => {
    setIsAutoStreaming(false);
    setIsSettling(true);
    try {
      await simulateOnChainSettlement(session, logCb);
      const settledSession: SessionState = {
        ...session,
        status: 'CLOSED',
        lastUpdated: Date.now(),
      };
      onUpdateSession(settledSession);
    } catch (e: any) {
      logCb({
        id: 'err-' + Date.now(),
        type: 'ERROR',
        message: 'Settlement error: ' + e.message,
        timestamp: Date.now(),
      });
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div id="micropayment-streams-container" className="space-y-6">
      {/* Title & Channel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">ERC-7824 High-Speed Off-Chain Micropayments</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Execute zero-gas, sub-millisecond off-chain value transfers signed via EIP-712 state channel proposals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="cooperative-settle-btn"
            onClick={handleSettlement}
            disabled={isSettling || session.status === 'CLOSED'}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/10 transition-all"
          >
            {isSettling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Settling On-Chain...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cooperative Settlement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Channel Balance Velocity Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sender Balance */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>SENDER CHANNEL BALANCE</span>
            <span className="text-yellow-400 font-bold">ALICE</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(session.balances[sender] || 0).toFixed(2)} <span className="text-xs text-yellow-400">{session.tokenSymbol}</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, ((session.balances[sender] || 0) / session.totalDeposit) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Channel Sequence Invariant */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>STATE CHANNEL SEQUENCE</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-yellow-400 font-mono">
            #{session.seq}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Monotonic Invariant Valid</span>
          </div>
        </div>

        {/* Recipient Balance */}
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>RECIPIENT CHANNEL BALANCE</span>
            <span className="text-emerald-400 font-bold">BOB</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(session.balances[recipient] || 0).toFixed(2)} <span className="text-xs text-emerald-400">{session.tokenSymbol}</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, ((session.balances[recipient] || 0) / session.totalDeposit) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Control Panel: One-off Payment or High-Speed Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Send className="w-4 h-4 text-yellow-400" />
            <span>Off-Chain Proposal Execution</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-mono">Recipient Address in Channel</label>
              <input
                id="recipient-address-input"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-mono">Amount per State Proposal ({session.tokenSymbol})</label>
              <div className="flex space-x-2">
                {[1, 5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      amount === val
                        ? 'bg-yellow-400 text-zinc-950 font-bold border-yellow-300'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                id="single-pay-btn"
                onClick={handleExecutePayment}
                disabled={session.status === 'CLOSED'}
                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-yellow-500/10"
              >
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>Send Single Off-Chain Pay</span>
              </button>

              <button
                id="auto-stream-toggle-btn"
                onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                disabled={session.status === 'CLOSED'}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border ${
                  isAutoStreaming
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {isAutoStreaming ? (
                  <>
                    <Pause className="w-4 h-4 fill-amber-400" />
                    <span>Pause Stream (Active)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-zinc-200" />
                    <span>Start Micro-Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Signature Frame Inspector */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-sans flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Latest EIP-712 Signed State Frame</span>
            </h2>
            <span className="text-[10px] text-zinc-500">ERC-7824 Frame</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-[11px] overflow-x-auto text-zinc-300">
            <div><span className="text-zinc-500">sessionId:</span> {session.sessionId}</div>
            <div><span className="text-zinc-500">appId:</span> "{session.appId}"</div>
            <div><span className="text-zinc-500">seq:</span> <span className="text-yellow-400">{session.seq}</span></div>
            <div>
              <span className="text-zinc-500">stateHash:</span>{' '}
              <span className="text-emerald-400">{calculateStateHash(session.sessionId, session.seq, session.balances)}</span>
            </div>
            <div><span className="text-zinc-500">signer:</span> {sender}</div>
            <div>
              <span className="text-zinc-500">signature:</span>{' '}
              <span className="text-amber-400">{session.signatures[sender] || generateDemoSignature(sender, session.sessionId, session.seq)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Off-Chain Transaction History Log */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Live Off-Chain Transaction Ticker</h2>
          <span className="text-xs font-mono text-zinc-400">{history.length} Transactions Executed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                <th className="pb-3 font-normal">SEQ</th>
                <th className="pb-3 font-normal">FROM</th>
                <th className="pb-3 font-normal">TO</th>
                <th className="pb-3 font-normal">AMOUNT</th>
                <th className="pb-3 font-normal">LATENCY</th>
                <th className="pb-3 font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 italic">
                    No off-chain transactions yet. Click "Send Single Off-Chain Pay" or "Start Micro-Stream".
                  </td>
                </tr>
              ) : (
                history.map((tx) => (
                  <tr key={tx.id} className="text-zinc-300 hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 text-yellow-400 font-bold">#{tx.seq}</td>
                    <td className="py-2.5 text-zinc-400">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</td>
                    <td className="py-2.5 text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        <span>{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-white font-bold">{tx.amount} {tx.tokenSymbol}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{tx.latencyMs}ms</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-bold">
                        OFF-CHAIN CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
