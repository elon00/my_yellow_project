import React, { useState } from 'react';
import { SessionState, LogEntry } from '../types';
import { Activity, ShieldAlert, Award, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateDemoSignature, calculateStateHash, auditStateInvariant } from '../lib/nitroliteClient';

interface StateChannelGameProps {
  session: SessionState;
  onUpdateSession: (updated: SessionState) => void;
  logCb: (log: LogEntry) => void;
}

export const StateChannelGame: React.FC<StateChannelGameProps> = ({
  session,
  onUpdateSession,
  logCb,
}) => {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [wagerAmount, setWagerAmount] = useState<number>(50.0);
  const [disputeSimulated, setDisputeSimulated] = useState<boolean>(false);

  const playerX = session.participants[0] || '0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9';
  const playerO = session.participants[1] || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const checkWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || session.status === 'CLOSED') return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const newSeq = session.seq + 1;
    const gameWinner = checkWinner(newBoard);

    let newBalances = { ...session.balances };
    if (gameWinner) {
      setWinner(gameWinner);
      const winningAddress = gameWinner === 'X' ? playerX : playerO;
      const losingAddress = gameWinner === 'X' ? playerO : playerX;

      newBalances[winningAddress] = Number(((newBalances[winningAddress] || 0) + wagerAmount).toFixed(2));
      newBalances[losingAddress] = Number(((newBalances[losingAddress] || 0) - wagerAmount).toFixed(2));

      logCb({
        id: 'log-' + Date.now(),
        type: 'SIGN',
        message: `State Channel Game Over! Winner ${gameWinner} (${winningAddress.slice(0, 6)}...) won ${wagerAmount} ${session.tokenSymbol}`,
        timestamp: Date.now(),
      });
    }

    const currentTurnSigner = turn === 'X' ? playerX : playerO;
    const sig = generateDemoSignature(currentTurnSigner, session.sessionId, newSeq);

    const updatedSession: SessionState = {
      ...session,
      seq: newSeq,
      balances: newBalances,
      lastUpdated: Date.now(),
      signatures: {
        ...session.signatures,
        [currentTurnSigner]: sig,
      },
    };

    onUpdateSession(updatedSession);
    setTurn(turn === 'X' ? 'O' : 'X');

    logCb({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `Off-Chain Game Move Signed (seq #${newSeq}) | Square ${index} -> ${turn}`,
      data: { seq: newSeq, boardState: newBoard, stateHash: calculateStateHash(session.sessionId, newSeq, newBalances) },
      timestamp: Date.now(),
    });
  };

  const handleResetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setTurn('X');
    setDisputeSimulated(false);
  };

  const handleSimulateStaleStateDispute = () => {
    setDisputeSimulated(true);
    logCb({
      id: 'dispute-' + Date.now(),
      type: 'ERROR',
      message: `DISPUTE SIMULATION: Opponent submitted stale state (seq #${session.seq - 2}). Your latest signed state is seq #${session.seq}. Initiating ERC-7824 Challenge Window...`,
      data: { staleSeq: session.seq - 2, validSeq: session.seq },
      timestamp: Date.now(),
    });
  };

  return (
    <div id="state-channel-game-container" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Off-Chain State Channel Gaming & Dispute Engine</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Turn-based game state machine. Every move generates an EIP-712 off-chain signature instantly with zero gas!
          </p>
        </div>

        <button
          id="reset-game-btn"
          onClick={handleResetGame}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Game Match</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-sm">
            <div className="text-xs font-mono text-zinc-400">
              Turn: <span className="text-yellow-400 font-bold">{turn === 'X' ? 'Player X (Alice)' : 'Player O (Bob)'}</span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Seq: <span className="text-white font-bold">#{session.seq}</span>
            </div>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square bg-zinc-950 p-3 rounded-2xl border border-zinc-800 shadow-2xl">
            {board.map((cell, idx) => (
              <button
                key={idx}
                id={`game-cell-${idx}`}
                onClick={() => handleSquareClick(idx)}
                disabled={Boolean(cell || winner)}
                className={`w-full h-full rounded-xl flex items-center justify-center text-3xl font-extrabold transition-all border ${
                  cell === 'X'
                    ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40'
                    : cell === 'O'
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/40'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-yellow-400/40 hover:bg-zinc-800/80'
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          {winner && (
            <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-bold flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span>Player {winner} Won the State Channel Match! ({wagerAmount} {session.tokenSymbol} Transferred Off-Chain)</span>
            </div>
          )}
        </div>

        {/* Dispute Resolution Simulator */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Dispute & Challenge Simulator</span>
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Test what happens when a malicious counterparty attempts to settle an old state on-chain. Yellow Nitrolite's challenge window automatically overrides stale submissions using the higher sequence number (`seq_n`).
          </p>

          <button
            id="simulate-dispute-btn"
            onClick={handleSimulateStaleStateDispute}
            className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/10"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simulate Stale State Submission</span>
          </button>

          {disputeSimulated && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2 text-xs font-mono">
              <div className="text-amber-400 font-bold flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4" />
                <span>ERC-7824 Challenge Window Open</span>
              </div>
              <div className="text-zinc-400 text-[11px]">
                Stale sequence <span className="text-rose-400">#{session.seq - 2}</span> rejected by contract. Superior sequence <span className="text-emerald-400">#{session.seq}</span> submitted with valid EIP-712 dual signatures.
              </div>
              <div className="text-emerald-400 text-[11px] font-bold flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Honest Collateral Protected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
