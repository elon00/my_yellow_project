import React, { useState, useEffect } from 'react';
import { WalletState, SessionState, ClearnodeInfo, AuditCheck, LogEntry } from './types';
import { INITIAL_CLEARNODES, INITIAL_SESSIONS, INITIAL_AUDIT_CHECKS, DEMO_ALICE, DEMO_BOB } from './data/mockData';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { AiAgenticsChat } from './components/AiAgenticsChat';
import { Web4AgenticRouting } from './components/Web4AgenticRouting';
import { ConwayAutomaton } from './components/ConwayAutomaton';
import { PqcSecurity } from './components/PqcSecurity';
import { MicropaymentStreams } from './components/MicropaymentStreams';
import { OrderbookDEX } from './components/OrderbookDEX';
import { StateChannelGame } from './components/StateChannelGame';
import { ClearnodeMonitor } from './components/ClearnodeMonitor';
import { SecurityAuditSuite } from './components/SecurityAuditSuite';
import { DeveloperSandbox } from './components/DeveloperSandbox';
import { WalletModal } from './components/WalletModal';
import { ethers } from 'ethers';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [wallet, setWallet] = useState<WalletState>({
    address: DEMO_ALICE,
    balance: '12.50 ETH',
    chainId: 1,
    isConnected: true,
    isDemoMode: true,
    signerType: 'demo_alice',
  });

  const [nodes, setNodes] = useState<ClearnodeInfo[]>(INITIAL_CLEARNODES);
  const [selectedNode, setSelectedNode] = useState<ClearnodeInfo>(INITIAL_CLEARNODES[0]);
  const [sessions, setSessions] = useState<SessionState[]>(INITIAL_SESSIONS);
  const [activeSession, setActiveSession] = useState<SessionState>(INITIAL_SESSIONS[0]);
  const [auditChecks, setAuditChecks] = useState<AuditCheck[]>(INITIAL_AUDIT_CHECKS);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      type: 'INFO',
      message: 'Yellow Nitrolite ERC-7824 Clearing Engine Initialized.',
      timestamp: Date.now() - 30000,
    },
    {
      id: 'init-2',
      type: 'WS_RECV',
      message: 'Connected to Clearnode wss://clearnet.yellow.org/ws (14ms)',
      timestamp: Date.now() - 28000,
    },
  ]);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev.slice(0, 99)]);
  };

  const handleUpdateActiveSession = (updated: SessionState) => {
    setActiveSession(updated);
    setSessions((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
  };

  const handleConnectMetaMask = async () => {
    if ((window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWallet({
          address: address,
          balance: '5.20 ETH',
          chainId: 1,
          isConnected: true,
          isDemoMode: false,
          signerType: 'metamask',
        });
        addLog({
          id: 'log-' + Date.now(),
          type: 'INFO',
          message: `Connected Live EVM Wallet: ${address}`,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        addLog({
          id: 'err-' + Date.now(),
          type: 'ERROR',
          message: 'MetaMask Connection Error: ' + err.message,
          timestamp: Date.now(),
        });
      }
    } else {
      addLog({
        id: 'err-' + Date.now(),
        type: 'ERROR',
        message: 'No Ethereum browser extension detected. Using Demo Wallet mode.',
        timestamp: Date.now(),
      });
    }
  };

  const handleConnectDemoWallet = (actor: 'demo_alice' | 'demo_bob') => {
    const address = actor === 'demo_alice' ? DEMO_ALICE : DEMO_BOB;
    setWallet({
      address: address,
      balance: actor === 'demo_alice' ? '12.50 ETH' : '8.40 ETH',
      chainId: 1,
      isConnected: true,
      isDemoMode: true,
      signerType: actor,
    });
    addLog({
      id: 'log-' + Date.now(),
      type: 'INFO',
      message: `Switched Demo Signer to ${actor === 'demo_alice' ? 'Alice' : 'Bob'} (${address.slice(0, 8)}...)`,
      timestamp: Date.now(),
    });
  };

  const handleCreateNewSession = () => {
    const newSessionId = '0x' + ethers.keccak256(ethers.toUtf8Bytes(`session-${Date.now()}`)).slice(2);
    const newSession: SessionState = {
      sessionId: newSessionId,
      appId: 'yellow-custom-app',
      participants: [wallet.address || DEMO_ALICE, DEMO_BOB],
      balances: {
        [wallet.address || DEMO_ALICE]: 500.0,
        [DEMO_BOB]: 500.0,
      },
      seq: 1,
      status: 'ACTIVE',
      signatures: {},
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      tokenSymbol: 'USDT',
      totalDeposit: 1000.0,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    setActiveTab('payments');

    addLog({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `Created New Nitrolite State Channel Session ID: ${newSessionId.slice(0, 10)}...`,
      timestamp: Date.now(),
    });
  };

  const handleRunAudit = () => {
    setAuditChecks((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'PASS',
        timestamp: Date.now(),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-yellow-400 selection:text-zinc-950">
      {/* Top Navigation */}
      <Navbar
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clearnode={selectedNode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            sessions={sessions}
            clearnode={selectedNode}
            onNavigateTab={setActiveTab}
            onOpenNewSession={handleCreateNewSession}
          />
        )}

        {activeTab === 'ai' && (
          <AiAgenticsChat
            session={activeSession}
            wallet={wallet}
            onUpdateSession={handleUpdateActiveSession}
            onNavigateTab={setActiveTab}
            logCb={addLog}
          />
        )}

        {activeTab === 'web4' && (
          <Web4AgenticRouting
            session={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            logCb={addLog}
          />
        )}

        {activeTab === 'conway' && (
          <ConwayAutomaton
            session={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            logCb={addLog}
          />
        )}

        {activeTab === 'pqc' && (
          <PqcSecurity
            session={activeSession}
            logCb={addLog}
          />
        )}

        {activeTab === 'payments' && (
          <MicropaymentStreams
            session={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            wallet={wallet}
            logCb={addLog}
          />
        )}

        {activeTab === 'dex' && (
          <OrderbookDEX
            session={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            logCb={addLog}
          />
        )}

        {activeTab === 'game' && (
          <StateChannelGame
            session={activeSession}
            onUpdateSession={handleUpdateActiveSession}
            logCb={addLog}
          />
        )}

        {activeTab === 'clearnode' && (
          <ClearnodeMonitor
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            logs={logs}
            logCb={addLog}
          />
        )}

        {activeTab === 'audit' && (
          <SecurityAuditSuite
            session={activeSession}
            auditChecks={auditChecks}
            onRunAudit={handleRunAudit}
            logCb={addLog}
          />
        )}

        {activeTab === 'sandbox' && (
          <DeveloperSandbox session={activeSession} wallet={wallet} />
        )}
      </main>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onConnectMetaMask={handleConnectMetaMask}
        onConnectDemoWallet={handleConnectDemoWallet}
      />
    </div>
  );
}
