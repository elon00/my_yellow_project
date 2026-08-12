import React from 'react';
import { WalletState } from '../types';
import { Wallet, X, Check, Zap, UserCheck, Shield } from 'lucide-react';
import { DEMO_ALICE, DEMO_BOB } from '../data/mockData';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnectMetaMask: () => void;
  onConnectDemoWallet: (actor: 'demo_alice' | 'demo_bob') => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onConnectMetaMask,
  onConnectDemoWallet,
}) => {
  if (!isOpen) return null;

  return (
    <div id="wallet-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 relative">
        <button
          id="close-wallet-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Connect EVM / Nitrolite Signer</h2>
          </div>
          <p className="text-xs text-zinc-400">Select a wallet or one-click demo actor to sign off-chain state proposals.</p>
        </div>

        <div className="space-y-3">
          {/* MetaMask Option */}
          <button
            id="connect-metamask-option"
            onClick={() => {
              onConnectMetaMask();
              onClose();
            }}
            className="w-full p-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-yellow-400/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-lg">
                🦊
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                  MetaMask / Web3 Extension
                </div>
                <div className="text-xs text-zinc-400">Connect live EVM wallet</div>
              </div>
            </div>
            {wallet.signerType === 'metamask' && <Check className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Demo Alice */}
          <button
            id="connect-demo-alice-option"
            onClick={() => {
              onConnectDemoWallet('demo_alice');
              onClose();
            }}
            className="w-full p-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-yellow-400/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-xs font-mono">
                ALICE
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">
                  Demo Actor: Alice
                </div>
                <div className="text-[11px] text-zinc-500">{DEMO_ALICE.slice(0, 10)}...</div>
              </div>
            </div>
            {wallet.signerType === 'demo_alice' && <Check className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Demo Bob */}
          <button
            id="connect-demo-bob-option"
            onClick={() => {
              onConnectDemoWallet('demo_bob');
              onClose();
            }}
            className="w-full p-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-yellow-400/50 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                BOB
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Demo Actor: Bob
                </div>
                <div className="text-[11px] text-zinc-500">{DEMO_BOB.slice(0, 10)}...</div>
              </div>
            </div>
            {wallet.signerType === 'demo_bob' && <Check className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 text-center font-mono">
          ⚡ One-click Demo Actors allow instant testing of off-chain payments & trades without installing extensions!
        </div>
      </div>
    </div>
  );
};
