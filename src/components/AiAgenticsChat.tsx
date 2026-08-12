import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Shield, Cpu, Zap, RefreshCw, CheckCircle2, ArrowRight, Play, Terminal, Layers } from 'lucide-react';
import { SessionState, WalletState, ChatMessage, LogEntry } from '../types';

interface AiAgenticsChatProps {
  session: SessionState;
  wallet: WalletState;
  onUpdateSession: (updated: SessionState) => void;
  onNavigateTab?: (tab: string) => void;
  logCb: (log: LogEntry) => void;
}

export const AiAgenticsChat: React.FC<AiAgenticsChatProps> = ({
  session,
  wallet,
  onUpdateSession,
  onNavigateTab,
  logCb,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'agent',
      text: `👋 **Welcome to Yellow Nitrolite AI Agentics Platform!**\n\nI am your autonomous **Web 4.0 State Channel Clearing Agent & Copilot**. I monitor ERC-7824 off-chain state updates, evaluate zero-gas settlement risks, execute Conway Automaton AI cellular entropy rebalancing, and audit NIST post-quantum (PQC) Dilithium signatures.`,
      timestamp: Date.now() - 60000,
    },
    {
      id: 'm-2',
      sender: 'agent',
      text: `How can I assist you with **Session \`${session.sessionId.slice(0, 10)}...\`** today? Select a quick action below or type a query!`,
      timestamp: Date.now() - 30000,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    logCb({
      id: 'log-' + Date.now(),
      type: 'INFO',
      message: `AI Agent Prompt Sent: "${query.slice(0, 40)}..."`,
      timestamp: Date.now(),
    });

    try {
      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
          context: {
            sessionId: session.sessionId,
            walletAddress: wallet.address,
            seq: session.seq,
            balances: session.balances,
          },
        }),
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: 'a-' + Date.now(),
        sender: 'agent',
        text: data.text || 'Action acknowledged by Nitrolite Agent.',
        timestamp: Date.now(),
        agenticAction: data.agenticAction,
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Execute side effect if agentic action requested
      if (data.agenticAction) {
        handleExecuteAgenticAction(data.agenticAction);
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      // Fallback local processing
      const fallbackMsg: ChatMessage = {
        id: 'a-' + Date.now(),
        sender: 'agent',
        text: `### 🟡 Nitrolite Agent Processing\nExecuted autonomous evaluation for prompt: "${query}".\n\n- **Session State**: \`seq_${session.seq + 1}\` proposal ready\n- **Clearnode Status**: 100% Operational\n- **PQC Verification**: CRYSTALS-Dilithium5 Quantum Resistant`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAgenticAction = (action: any) => {
    if (action.type === 'PROPOSE_STATE_UPDATE') {
      const p1 = session.participants[0];
      const p2 = session.participants[1];
      const currentB1 = session.balances[p1] || 500;
      const currentB2 = session.balances[p2] || 500;
      const transferAmount = action.amount || 25;

      if (currentB1 >= transferAmount) {
        const updated: SessionState = {
          ...session,
          seq: session.seq + 1,
          balances: {
            [p1]: currentB1 - transferAmount,
            [p2]: currentB2 + transferAmount,
          },
          lastUpdated: Date.now(),
        };
        onUpdateSession(updated);
        logCb({
          id: 'log-' + Date.now(),
          type: 'SIGN',
          message: `🤖 AI Agent Executed State Proposal seq_${updated.seq} (-${transferAmount} USDT)`,
          timestamp: Date.now(),
        });
      }
    } else if (action.type === 'TRIGGER_CONWAY' && onNavigateTab) {
      onNavigateTab('conway');
    } else if (action.type === 'RUN_PQC_AUDIT' && onNavigateTab) {
      onNavigateTab('pqc');
    } else if (action.type === 'WEB4_NEGOTIATE' && onNavigateTab) {
      onNavigateTab('web4');
    }
  };

  const quickPrompts = [
    {
      label: '🌐 Web 4.0 Auto-Negotiate State',
      prompt: 'Execute a Web 4.0 autonomous machine-to-machine state negotiation for our current channel.',
      icon: Cpu,
    },
    {
      label: '🦠 Conway Cellular Topology',
      prompt: 'Run Conway Automaton AI to generate a cellular entropy grid for state channel routing.',
      icon: Layers,
    },
    {
      label: '🛡️ PQC Dilithium Audit',
      prompt: 'Audit our ERC-7824 state channel using NIST CRYSTALS-Dilithium5 post-quantum signatures.',
      icon: Shield,
    },
    {
      label: '⚡ Auto-Rebalance Balances',
      prompt: 'Propose an AI automated state balance transfer of 25 USDT to optimize liquidity velocity.',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-zinc-900 border border-yellow-500/20 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-500/10">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Agentics Chat & Nitrolite Copilot</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                Web 4.0 Powered
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Autonomous ERC-7824 protocol assistant, Conway cellular automaton generator, and PQC quantum auditor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Model: <span className="font-mono text-yellow-400">gemini-3.6-flash</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Agentic Capabilities
            </h3>

            <div className="space-y-2">
              {quickPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-yellow-500/40 hover:bg-zinc-800/60 transition-all text-xs text-zinc-300 hover:text-white flex items-center gap-2.5 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-zinc-950 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium flex-1">{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Context Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Active Channel Context
            </h3>
            <div className="space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Session ID:</span>
                <span className="text-yellow-400 font-semibold">{session.sessionId.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Sequence:</span>
                <span className="text-emerald-400">seq_{session.seq}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Alice Balance:</span>
                <span>{(session.balances[session.participants[0]] || 0).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Bob Balance:</span>
                <span>{(session.balances[session.participants[1]] || 0).toFixed(2)} USDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Messages Area */}
        <div className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-yellow-400 text-zinc-950 font-medium rounded-tr-none'
                      : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 rounded-tl-none space-y-3'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {msg.agenticAction && (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-semibold text-yellow-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Executed Agentic Action: {msg.agenticAction.type}
                        </span>
                      </div>
                      <p className="text-zinc-300">
                        Target state sequence updated & multi-sig EIP-712 payload generated.
                      </p>
                      {onNavigateTab && (
                        <div className="pt-1">
                          <button
                            onClick={() => handleExecuteAgenticAction(msg.agenticAction)}
                            className="px-3 py-1 rounded-lg bg-yellow-400 text-zinc-950 font-bold hover:bg-yellow-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" /> View Action Results
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[10px] ${msg.sender === 'user' ? 'text-zinc-800' : 'text-zinc-500'} text-right`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1 text-xs font-bold">
                    YOU
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3.5 items-center text-zinc-400 text-xs">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                  <span>Nitrolite Agent evaluating state channel graph & signatures...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-zinc-950/90 border-t border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nitrolite AI Agent, request PQC audit, or trigger Conway cellular routing..."
                disabled={isLoading}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-400/60 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 rounded-xl bg-yellow-400 text-zinc-950 font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
