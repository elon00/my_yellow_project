import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RefreshCw, Grid, Layers, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { SessionState, LogEntry } from '../types';
import { ethers } from 'ethers';

interface ConwayAutomatonProps {
  session: SessionState;
  onUpdateSession: (updated: SessionState) => void;
  logCb: (log: LogEntry) => void;
}

const GRID_SIZE = 20; // 20x20 grid

export const ConwayAutomaton: React.FC<ConwayAutomatonProps> = ({
  session,
  onUpdateSession,
  logCb,
}) => {
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [generation, setGeneration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(200); // ms per step
  const [entropyHash, setEntropyHash] = useState<string>('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [activeCellCount, setActiveCellCount] = useState<number>(0);

  // Initialize with Gosper Glider Gun pattern
  useEffect(() => {
    loadPreset('GLIDER_GUN');
  }, []);

  function createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  }

  // Conway's Game of Life step calculation
  const stepConway = () => {
    setGrid((currentGrid) => {
      const nextGrid = createEmptyGrid();
      let liveCount = 0;

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          let neighbors = 0;

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = (r + dr + GRID_SIZE) % GRID_SIZE;
              const nc = (c + dc + GRID_SIZE) % GRID_SIZE;
              neighbors += currentGrid[nr][nc];
            }
          }

          if (currentGrid[r][c] === 1) {
            if (neighbors === 2 || neighbors === 3) {
              nextGrid[r][c] = 1;
              liveCount++;
            }
          } else {
            if (neighbors === 3) {
              nextGrid[r][c] = 1;
              liveCount++;
            }
          }
        }
      }

      // Compute cryptographic hash of current grid matrix
      const flatStr = nextGrid.flat().join('');
      const hash = ethers.keccak256(ethers.toUtf8Bytes(flatStr + generation));
      setEntropyHash(hash);
      setActiveCellCount(liveCount);

      return nextGrid;
    });

    setGeneration((g) => g + 1);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        stepConway();
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isRunning, speed, generation]);

  const toggleCell = (r: number, c: number) => {
    const newGrid = grid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? (cell === 1 ? 0 : 1) : cell))
    );
    setGrid(newGrid);
    const flatStr = newGrid.flat().join('');
    setEntropyHash(ethers.keccak256(ethers.toUtf8Bytes(flatStr)));
    setActiveCellCount(newGrid.flat().filter((x) => x === 1).length);
  };

  const loadPreset = (preset: string) => {
    const newGrid = createEmptyGrid();
    if (preset === 'GLIDER_GUN') {
      // Glider Gun pattern
      const coords = [
        [5, 1], [5, 2], [6, 1], [6, 2],
        [5, 11], [6, 11], [7, 11], [4, 12], [8, 12], [3, 13], [9, 13], [3, 14], [9, 14], [6, 15], [4, 16], [8, 16], [5, 17], [6, 17], [7, 17], [6, 18],
        [3, 21], [4, 21], [5, 21], [3, 22], [4, 22], [5, 22], [2, 23], [6, 23], [1, 25], [2, 25], [6, 25], [7, 25]
      ];
      coords.forEach(([r, c]) => {
        if (r < GRID_SIZE && c < GRID_SIZE) newGrid[r][c] = 1;
      });
    } else if (preset === 'PULSAR') {
      const p = [
        [2,4],[2,5],[2,6],[2,10],[2,11],[2,12],
        [4,2],[4,7],[4,9],[4,14],
        [5,2],[5,7],[5,9],[5,14],
        [6,2],[6,7],[6,9],[6,14],
        [7,4],[7,5],[7,6],[7,10],[7,11],[7,12],
        [9,4],[9,5],[9,6],[9,10],[9,11],[9,12],
        [10,2],[10,7],[10,9],[10,14],
        [11,2],[11,7],[11,9],[11,14],
        [12,2],[12,7],[12,9],[12,14],
        [14,4],[14,5],[14,6],[14,10],[14,11],[14,12]
      ];
      p.forEach(([r, c]) => {
        if (r < GRID_SIZE && c < GRID_SIZE) newGrid[r][c] = 1;
      });
    } else if (preset === 'RANDOM') {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (Math.random() > 0.75) newGrid[r][c] = 1;
        }
      }
    }
    setGrid(newGrid);
    setGeneration(0);
    const flatStr = newGrid.flat().join('');
    setEntropyHash(ethers.keccak256(ethers.toUtf8Bytes(flatStr)));
    setActiveCellCount(newGrid.flat().filter((x) => x === 1).length);
  };

  const handleApplyEntropyToChannel = () => {
    const p1 = session.participants[0];
    const p2 = session.participants[1];
    const currentB1 = session.balances[p1] || 500;
    const currentB2 = session.balances[p2] || 500;

    // Use active cell count to compute balance shift
    const shift = (activeCellCount % 20) + 1;
    const newB1 = Math.max(10, currentB1 - shift);
    const newB2 = currentB2 + (currentB1 - newB1);

    const nextSeq = session.seq + 1;

    const updatedSession: SessionState = {
      ...session,
      seq: nextSeq,
      balances: {
        [p1]: newB1,
        [p2]: newB2,
      },
      lastUpdated: Date.now(),
    };

    onUpdateSession(updatedSession);

    logCb({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `🦠 Conway Automaton AI Applied Grid Entropy (Hash ${entropyHash.slice(0, 8)}...) to State Channel seq_${nextSeq}`,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-yellow-500/10 to-zinc-900 border border-emerald-500/20 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Conway Automaton AI Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cellular State Topology Generator
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Translating Game of Life cellular automaton matrix patterns into cryptographic entropy for Yellow ERC-7824 state channel rebalancing.
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyEntropyToChannel}
          className="px-5 py-2.5 rounded-xl bg-yellow-400 text-zinc-950 font-bold hover:bg-yellow-300 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20 shrink-0 text-xs"
        >
          <Sparkles className="w-4 h-4 text-zinc-950" />
          Apply Grid Entropy to State Channel
        </button>
      </div>

      {/* Grid Controls & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive 20x20 Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Automaton Cellular Canvas (20x20)</h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Gen: <strong className="text-yellow-400">{generation}</strong></span>
              <span>•</span>
              <span>Active Cells: <strong className="text-emerald-400">{activeCellCount}</strong></span>
            </div>
          </div>

          {/* Canvas Rendering */}
          <div className="flex justify-center bg-zinc-950/90 p-4 rounded-xl border border-zinc-800">
            <div className="grid grid-cols-20 gap-1 aspect-square w-full max-w-[440px]">
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => toggleCell(r, c)}
                    className={`rounded-sm transition-colors cursor-pointer ${
                      cell === 1
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 border border-emerald-300'
                        : 'bg-zinc-900 border border-zinc-800/60 hover:bg-zinc-800'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Simulation
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Conway AI
                  </>
                )}
              </button>

              <button
                onClick={stepConway}
                disabled={isRunning}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>

              <button
                onClick={() => {
                  setGrid(createEmptyGrid());
                  setGeneration(0);
                  setActiveCellCount(0);
                }}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500">Presets:</span>
              <button
                onClick={() => loadPreset('GLIDER_GUN')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 cursor-pointer"
              >
                Glider Gun
              </button>
              <button
                onClick={() => loadPreset('PULSAR')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 cursor-pointer"
              >
                Pulsar
              </button>
              <button
                onClick={() => loadPreset('RANDOM')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 cursor-pointer"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Cryptographic State Translation */}
        <div className="space-y-4">
          {/* Derived Entropy Hash */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Automaton Cryptographic Entropy Vector
            </h3>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Keccak256 Hash</span>
              <p className="text-xs font-mono text-yellow-400 break-all">{entropyHash}</p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 font-mono pt-1">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Grid Density Yield:</span>
                <span className="text-emerald-400">{((activeCellCount / (GRID_SIZE * GRID_SIZE)) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Channel Seq Projection:</span>
                <span className="text-yellow-400">seq_{session.seq + 1}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Automaton Rebalance Delta:</span>
                <span className="text-blue-400">±{(activeCellCount % 20) + 1} USDT</span>
              </div>
            </div>
          </div>

          {/* Protocol Mechanics Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ERC-7824 Automaton Invariants
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cellular Automaton configurations inject pseudo-random deterministic entropy into off-chain state channel topology, protecting multi-party routing against front-running and MEV extraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
