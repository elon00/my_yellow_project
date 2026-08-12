import { ethers } from 'ethers';
import { SessionState, LogEntry } from '../types';

export const DEFAULT_CLEARNODE_WS = 'wss://clearnet.yellow.org/ws';
export const ALT_CLEARNODE_WS = 'wss://clearnode.yellow.org/ws';

// EIP-712 Domain for Yellow Network ERC-7824 State Channels
export const EIP712_NITROLITE_DOMAIN = {
  name: 'Yellow Nitrolite ERC-7824',
  version: '1.0.0',
  chainId: 1, // Ethereum Mainnet / Yellow Clearnet Anchor
  verifyingContract: '0x7824782478247824782478247824782478247824',
};

export const EIP712_STATE_TYPES = {
  StateProposal: [
    { name: 'sessionId', type: 'bytes32' },
    { name: 'appId', type: 'string' },
    { name: 'seq', type: 'uint64' },
    { name: 'balancesHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint64' },
  ],
};

/**
 * Creates an ERC-7824 compliant signer adapter wrapping an Ethers Signer or local wallet.
 */
export function createSignerAdapter(ethersSigner: ethers.Signer) {
  return {
    async signMessage(message: string | Uint8Array): Promise<string> {
      try {
        if (typeof message === 'string') {
          return await ethersSigner.signMessage(message);
        } else {
          const messageString = new TextDecoder().decode(message);
          return await ethersSigner.signMessage(messageString);
        }
      } catch (error) {
        console.error('Error signing Nitrolite message:', error);
        throw error;
      }
    },
    async signTypedData(domain: any, types: any, value: any): Promise<string> {
      return await ethersSigner.signTypedData(domain, types, value);
    },
    async getAddress(): Promise<string> {
      return await ethersSigner.getAddress();
    },
  };
}

/**
 * Derives a deterministic pseudo-EIP712 signature for simulation / demo mode
 */
export function generateDemoSignature(address: string, sessionId: string, seq: number): string {
  const payload = `${address}:${sessionId}:${seq}:${Date.now()}`;
  const hash = ethers.keccak256(ethers.toUtf8Bytes(payload));
  return '0x7824' + hash.slice(6) + '1b'; // Append standard v=27
}

/**
 * Calculates Keccak256 state hash for ERC-7824 State Channel verification
 */
export function calculateStateHash(sessionId: string, seq: number, balances: Record<string, number>): string {
  const sortedKeys = Object.keys(balances).sort();
  const balancesStr = sortedKeys.map((k) => `${k.toLowerCase()}:${balances[k]}`).join(';');
  const rawPayload = `${sessionId.toLowerCase()}:${seq}:${balancesStr}`;
  return ethers.keccak256(ethers.toUtf8Bytes(rawPayload));
}

/**
 * Verifies that a state update satisfies Nitrolite ERC-7824 safety invariants:
 * 1. Monotonic Sequence: newSeq > currentSeq
 * 2. Balance Conservation: total balance remains constant
 * 3. Non-negative balances: all participant balances >= 0
 */
export function auditStateInvariant(
  currentSession: SessionState,
  newSeq: number,
  newBalances: Record<string, number>
): { valid: boolean; reason?: string } {
  if (newSeq <= currentSession.seq) {
    return { valid: false, reason: `Sequence number must strictly increase. Got ${newSeq}, current is ${currentSession.seq}` };
  }

  let newTotal = 0;
  for (const [addr, val] of Object.entries(newBalances)) {
    if (val < 0) {
      return { valid: false, reason: `Negative balance detected for participant ${addr}: ${val}` };
    }
    newTotal += val;
  }

  // Floating point sanity tolerance
  if (Math.abs(newTotal - currentSession.totalDeposit) > 0.0001) {
    return {
      valid: false,
      reason: `Balance conservation violated! Total deposit is ${currentSession.totalDeposit}, proposed total is ${newTotal}`,
    };
  }

  return { valid: true };
}

/**
 * Simulated Smart Contract Settlement Execution
 */
export async function simulateOnChainSettlement(
  session: SessionState,
  logCb: (log: LogEntry) => void
): Promise<{ txHash: string; blockNumber: number; gasUsed: bigint }> {
  logCb({
    id: 'log-' + Date.now(),
    type: 'SETTLE',
    message: `Initiating ERC-7824 On-Chain Settlement for Session ${session.sessionId.slice(0, 10)}...`,
    data: { sessionId: session.sessionId, seq: session.seq, finalBalances: session.balances },
    timestamp: Date.now(),
  });

  // Simulate network block delay (800ms)
  await new Promise((r) => setTimeout(r, 800));

  const mockTxHash = ethers.keccak256(ethers.toUtf8Bytes(`settle:${session.sessionId}:${session.seq}:${Date.now()}`));
  const mockBlockNumber = 20894100 + Math.floor(Math.random() * 50);
  const mockGasUsed = BigInt(68500 + Math.floor(Math.random() * 2000));

  logCb({
    id: 'log-' + Date.now(),
    type: 'SETTLE',
    message: `On-Chain Settlement Confirmed in Block #${mockBlockNumber}! Tx: ${mockTxHash.slice(0, 18)}...`,
    data: { txHash: mockTxHash, blockNumber: mockBlockNumber, gasUsed: mockGasUsed.toString() },
    timestamp: Date.now(),
  });

  return {
    txHash: mockTxHash,
    blockNumber: mockBlockNumber,
    gasUsed: mockGasUsed,
  };
}
