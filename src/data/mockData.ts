import { ClearnodeInfo, SessionState, AuditCheck } from '../types';

export const INITIAL_CLEARNODES: ClearnodeInfo[] = [
  {
    nodeId: 'clearnode-yellow-01',
    name: 'Yellow Clearnet US-East',
    wsUrl: 'wss://clearnet.yellow.org/ws',
    location: 'Virginia, USA',
    latencyMs: 14,
    status: 'ONLINE',
    peersCount: 128,
    activeChannels: 1420,
    throughputTps: 4850,
    uptimePct: 99.98,
  },
  {
    nodeId: 'clearnode-yellow-02',
    name: 'Yellow Clearnet EU-Central',
    wsUrl: 'wss://clearnode.yellow.org/ws',
    location: 'Frankfurt, DE',
    latencyMs: 28,
    status: 'ONLINE',
    peersCount: 94,
    activeChannels: 980,
    throughputTps: 3200,
    uptimePct: 100.0,
  },
  {
    nodeId: 'clearnode-yellow-03',
    name: 'Yellow Clearnet AP-East',
    wsUrl: 'wss://ap.clearnet.yellow.org/ws',
    location: 'Tokyo, JP',
    latencyMs: 42,
    status: 'ONLINE',
    peersCount: 76,
    activeChannels: 640,
    throughputTps: 2100,
    uptimePct: 99.92,
  },
  {
    nodeId: 'clearnode-local-dev',
    name: 'Local Dev Clearnode (Anvil / Sandbox)',
    wsUrl: 'ws://localhost:8545',
    location: 'Localhost',
    latencyMs: 2,
    status: 'ONLINE',
    peersCount: 12,
    activeChannels: 4,
    throughputTps: 10000,
    uptimePct: 100.0,
  },
];

export const DEMO_ALICE = '0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9';
export const DEMO_BOB = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
export const DEMO_CHARLIE = '0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

export const INITIAL_SESSIONS: SessionState[] = [
  {
    sessionId: '0x8f2a991c045b8e99a123f00011a9b2c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
    appId: 'yellow-pay-stream',
    participants: [DEMO_ALICE, DEMO_BOB],
    balances: {
      [DEMO_ALICE]: 850.00,
      [DEMO_BOB]: 150.00,
    },
    seq: 42,
    status: 'ACTIVE',
    signatures: {
      [DEMO_ALICE]: '0x7824...alice_sig_42',
      [DEMO_BOB]: '0x7824...bob_sig_42',
    },
    createdAt: Date.now() - 3600000,
    lastUpdated: Date.now() - 5000,
    tokenSymbol: 'USDT',
    totalDeposit: 1000.00,
  },
  {
    sessionId: '0x1d4e7f9a2b5c8d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e',
    appId: 'yellow-hft-dex',
    participants: [DEMO_ALICE, DEMO_CHARLIE],
    balances: {
      [DEMO_ALICE]: 2400.50,
      [DEMO_CHARLIE]: 1599.50,
    },
    seq: 128,
    status: 'ACTIVE',
    signatures: {
      [DEMO_ALICE]: '0x7824...alice_sig_128',
      [DEMO_CHARLIE]: '0x7824...charlie_sig_128',
    },
    createdAt: Date.now() - 7200000,
    lastUpdated: Date.now() - 12000,
    tokenSymbol: 'USDC',
    totalDeposit: 4000.00,
  },
];

export const INITIAL_AUDIT_CHECKS: AuditCheck[] = [
  {
    id: 'check-01',
    title: 'Monotonic Sequence Number Invariant (seq_n > seq_n-1)',
    category: 'STATE_INTEGRITY',
    status: 'PASS',
    message: 'All off-chain state proposals strictly increase sequence numbers.',
    details: 'Verified sequence history: seq 0 -> seq 1 -> ... -> seq 128 without rollbacks or duplicates.',
    timestamp: Date.now() - 10000,
  },
  {
    id: 'check-02',
    title: 'Conservation of Collateral (Sum(B_i) == C)',
    category: 'STATE_INTEGRITY',
    status: 'PASS',
    message: 'Off-chain balance shifts conserve total deposited collateral.',
    details: 'Session 0x8f2a... total deposit preserved at exactly 1000.00 USDT.',
    timestamp: Date.now() - 8000,
  },
  {
    id: 'check-03',
    title: 'EIP-712 Dual-Party Signature Integrity',
    category: 'CRYPTOGRAPHY',
    status: 'PASS',
    message: 'Valid signatures present for all registered session participants.',
    details: 'ecRecover verified for both Alice and Bob against state keccak256 hash.',
    timestamp: Date.now() - 6000,
  },
  {
    id: 'check-04',
    title: 'Challenge Timelock Window Validation',
    category: 'DISPUTE_LOGIC',
    status: 'PASS',
    message: 'Dispute deadline set to 86400 seconds (24h) from challenge timestamp.',
    details: 'Contract revert rule triggered correctly if dispute period is bypassed.',
    timestamp: Date.now() - 4000,
  },
  {
    id: 'check-05',
    title: 'Smart Contract Bytecode Settlement Match',
    category: 'ONCHAIN_SETTLEMENT',
    status: 'PASS',
    message: 'Verified ERC-7824 settlement contract ABI matches off-chain payload struct.',
    details: 'Contract target 0x78247824... responds with Settled event topic on simulated execution.',
    timestamp: Date.now() - 2000,
  },
];
