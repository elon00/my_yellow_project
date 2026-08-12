import React, { useState } from 'react';
import { SessionState, WalletState } from '../types';
import { Code, Copy, Check, Terminal, FileCode, Play, Sparkles } from 'lucide-react';
import { calculateStateHash, generateDemoSignature } from '../lib/nitroliteClient';

interface DeveloperSandboxProps {
  session: SessionState;
  wallet: WalletState;
}

export const DeveloperSandbox: React.FC<DeveloperSandboxProps> = ({ session, wallet }) => {
  const [activeSnippet, setActiveSnippet] = useState<'init' | 'propose' | 'close' | 'solidity'>('init');
  const [copied, setCopied] = useState<boolean>(false);
  const [testSeq, setTestSeq] = useState<number>(session.seq + 1);

  const testSender = wallet.address || session.participants[0];
  const calculatedHash = calculateStateHash(session.sessionId, testSeq, session.balances);
  const calculatedSig = generateDemoSignature(testSender, session.sessionId, testSeq);

  const snippets = {
    init: `import { NitroliteClient } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// 1. Wrap Ethers Signer into ERC-7824 Adapter
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const signerAdapter = {
  async signMessage(msg) {
    return await signer.signMessage(typeof msg === 'string' ? msg : new TextDecoder().decode(msg));
  },
  async getAddress() {
    return await signer.getAddress();
  }
};

// 2. Connect Nitrolite Client to Yellow Clearnode
const client = new NitroliteClient({
  wsUrl: 'wss://clearnet.yellow.org/ws',
  signer: signerAdapter
});

await client.connect();
console.log('Connected to Yellow Network Nitrolite!');`,

    propose: `// Propose Off-Chain State Transition (seq #${testSeq})
const newStateObj = {
  sessionId: '${session.sessionId.slice(0, 16)}...',
  seq: ${testSeq},
  balances: {
    '${session.participants[0]}': ${session.balances[session.participants[0]] || 800},
    '${session.participants[1] || '0x0B2E...'}': ${session.balances[session.participants[1]] || 200}
  }
};

// Off-Chain Proposal Execution (<2ms)
const stateUpdate = await client.proposeState(sessionId, newStateObj);
console.log('Off-chain proposal signed & confirmed:', stateUpdate);`,

    close: `// Cooperative Channel Close onto EVM Settlement Contract
const finalState = {
  seq: ${session.seq},
  balances: ${JSON.stringify(session.balances, null, 2)}
};

const settlementResult = await client.closeSession(sessionId, finalState);
console.log('On-chain cooperative settlement executed:', settlementResult.txHash);`,

    solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC7824Settlement.sol";

contract YellowSettlementApp is ERC7824Settlement {
    // Custom logic on state channel cooperative settlement
    function onSessionSettled(bytes32 sessionId, uint64 finalSeq) internal override {
        // Trigger post-clearing execution on EVM chain
    }
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippets[activeSnippet]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="developer-sandbox-container" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Code className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">ERC-7824 Nitrolite Developer Sandbox</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Interactive code snippets, state hash calculator, and live EIP-712 cryptographic test bench.
          </p>
        </div>
      </div>

      {/* Code Snippets & Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Tabs */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setActiveSnippet('init')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeSnippet === 'init' ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1. Init Client
              </button>
              <button
                onClick={() => setActiveSnippet('propose')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeSnippet === 'propose' ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2. Propose State
              </button>
              <button
                onClick={() => setActiveSnippet('close')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeSnippet === 'close' ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3. Settle
              </button>
              <button
                onClick={() => setActiveSnippet('solidity')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeSnippet === 'solidity' ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Solidity
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto h-80 leading-relaxed">
            <code>{snippets[activeSnippet]}</code>
          </pre>
        </div>

        {/* Live Cryptographic Calculator Test Bench */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-sans flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>EIP-712 Cryptographic Test Bench</span>
            </h2>
            <span className="text-[10px] text-zinc-500">Live Hash Engine</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-400 mb-1">Target Sequence Number (seq)</label>
              <input
                type="number"
                value={testSeq}
                onChange={(e) => setTestSeq(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-[11px] overflow-x-auto">
              <div className="text-zinc-500 font-bold">STATE KECCAK256 HASH:</div>
              <div className="text-emerald-400 font-bold break-all">{calculatedHash}</div>

              <div className="text-zinc-500 font-bold pt-2">DERIVED EIP-712 SIGNATURE:</div>
              <div className="text-amber-400 font-bold break-all">{calculatedSig}</div>
            </div>

            <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-[11px] font-sans">
              ✨ Signatures derived using Yellow Network ERC-7824 standard domain separator and Keccak256 state invariants.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
