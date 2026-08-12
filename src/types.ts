export interface WalletState {
  address: string | null;
  balance: string;
  chainId: number;
  isConnected: boolean;
  isDemoMode: boolean;
  signerType: 'metamask' | 'demo_alice' | 'demo_bob' | 'custom_key' | null;
}

export interface SessionState {
  sessionId: string;
  appId: string;
  participants: string[];
  balances: Record<string, number>; // token units (e.g. 100 USDT)
  seq: number;
  status: 'PROPOSED' | 'ACTIVE' | 'DISPUTED' | 'SETTLING' | 'CLOSED';
  signatures: Record<string, string>;
  createdAt: number;
  lastUpdated: number;
  tokenSymbol: string;
  totalDeposit: number;
}

export interface PaymentTx {
  id: string;
  sessionId: string;
  from: string;
  to: string;
  amount: number;
  tokenSymbol: string;
  seq: number;
  timestamp: number;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED';
  signature: string;
  latencyMs: number;
  gasSavedUsd: number;
}

export interface OrderbookItem {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  filled: number;
  trader: string;
  seq: number;
  status: 'OPEN' | 'MATCHED' | 'SETTLED';
  timestamp: number;
}

export interface ClearnodeInfo {
  nodeId: string;
  name: string;
  wsUrl: string;
  location: string;
  latencyMs: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  peersCount: number;
  activeChannels: number;
  throughputTps: number;
  uptimePct: number;
}

export interface AuditCheck {
  id: string;
  title: string;
  category: 'STATE_INTEGRITY' | 'CRYPTOGRAPHY' | 'DISPUTE_LOGIC' | 'ONCHAIN_SETTLEMENT';
  status: 'PASS' | 'FAIL' | 'WARN' | 'PENDING';
  message: string;
  details: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  type: 'INFO' | 'WS_SEND' | 'WS_RECV' | 'SIGN' | 'SETTLE' | 'ERROR';
  message: string;
  data?: any;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
  agenticAction?: {
    type: string;
    [key: string]: any;
  };
}

export interface Web4Agent {
  id: string;
  name: string;
  role: 'ARBITRAGE_BOT' | 'LIQUIDITY_ROUTER' | 'CLEARNODE_OPERATOR' | 'CREDIT_GUARDIAN';
  trustScore: number;
  reputation: number;
  activeNegotiations: number;
  autoSignThreshold: number;
  pqcSupported: boolean;
  status: 'NEGOTIATING' | 'IDLE' | 'EXECUTING_SETTLEMENT';
}

export interface PqcCertificate {
  algorithm: 'CRYSTALS-Dilithium5' | 'CRYSTALS-Kyber1024' | 'Falcon-1024' | 'Sphincs+';
  securityLevel: 'NIST Level 5 (256-bit Quantum Safe)';
  classicHash: string;
  pqcSignatureHex: string;
  verificationStatus: 'VALIDATED' | 'COMPROMISED' | 'PENDING';
  quantumResilienceRating: string;
  timestamp: number;
}

