import React, { useState } from 'react';
import { SessionState, OrderbookItem, LogEntry } from '../types';
import { Cpu, ArrowDownUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { calculateStateHash } from '../lib/nitroliteClient';

interface OrderbookDEXProps {
  session: SessionState;
  onUpdateSession: (updated: SessionState) => void;
  logCb: (log: LogEntry) => void;
}

export const OrderbookDEX: React.FC<OrderbookDEXProps> = ({
  session,
  onUpdateSession,
  logCb,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState<number>(2850.0);
  const [amount, setAmount] = useState<number>(0.5);
  const [orders, setOrders] = useState<OrderbookItem[]>([
    { id: 'ord-1', type: 'SELL', price: 2855.0, amount: 1.2, filled: 0, trader: '0x0B2E...62F9', seq: 10, status: 'OPEN', timestamp: Date.now() - 10000 },
    { id: 'ord-2', type: 'SELL', price: 2852.5, amount: 2.0, filled: 0, trader: '0x71C7...976F', seq: 11, status: 'OPEN', timestamp: Date.now() - 8000 },
    { id: 'ord-3', type: 'BUY', price: 2848.0, amount: 1.5, filled: 0, trader: '0xF39F...2266', seq: 12, status: 'OPEN', timestamp: Date.now() - 5000 },
    { id: 'ord-4', type: 'BUY', price: 2845.0, amount: 3.0, filled: 0, trader: '0x0B2E...62F9', seq: 13, status: 'OPEN', timestamp: Date.now() - 3000 },
  ]);

  const handlePlaceOrder = () => {
    if (price <= 0 || amount <= 0) return;

    const newSeq = session.seq + 1;
    const orderCost = price * amount;

    // Simulate instant matching if price overlaps
    const newOrder: OrderbookItem = {
      id: 'ord-' + Date.now(),
      type: side,
      price: price,
      amount: amount,
      filled: amount,
      trader: session.participants[0],
      seq: newSeq,
      status: 'MATCHED',
      timestamp: Date.now(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update state channel balance based on trade execution
    const newBalances = { ...session.balances };
    const p1 = session.participants[0];
    const p2 = session.participants[1] || '0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9';

    if (side === 'BUY') {
      newBalances[p1] = Number(((newBalances[p1] || 0) - amount * 10).toFixed(2));
      newBalances[p2] = Number(((newBalances[p2] || 0) + amount * 10).toFixed(2));
    } else {
      newBalances[p1] = Number(((newBalances[p1] || 0) + amount * 10).toFixed(2));
      newBalances[p2] = Number(((newBalances[p2] || 0) - amount * 10).toFixed(2));
    }

    const updatedSession: SessionState = {
      ...session,
      seq: newSeq,
      balances: newBalances,
      lastUpdated: Date.now(),
    };

    onUpdateSession(updatedSession);

    logCb({
      id: 'log-' + Date.now(),
      type: 'SIGN',
      message: `Zero-Gas Order Matched Off-Chain (seq #${newSeq}) | ${side} ${amount} ETH @ $${price} | $0.00 Gas!`,
      data: { seq: newSeq, orderCost, stateHash: calculateStateHash(session.sessionId, newSeq, newBalances) },
      timestamp: Date.now(),
    });
  };

  const sellOrders = orders.filter((o) => o.type === 'SELL').sort((a, b) => b.price - a.price);
  const buyOrders = orders.filter((o) => o.type === 'BUY').sort((a, b) => b.price - a.price);

  return (
    <div id="orderbook-dex-container" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">ERC-7824 Zero-Gas High-Frequency Orderbook</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Off-chain limit order matching engine. Trades are matched off-chain in state channel proposals with zero gas overhead.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
          <span>Channel Sequence:</span>
          <span className="text-yellow-400 font-bold">#{session.seq}</span>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Entry Form */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ArrowDownUp className="w-4 h-4 text-yellow-400" />
            <span>Place Off-Chain Order</span>
          </h2>

          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => setSide('BUY')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                side === 'BUY' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              BUY ETH
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                side === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SELL ETH
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Limit Price (USDT)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Amount (ETH)</label>
              <input
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Total Order Value:</span>
                <span className="text-white font-bold">${(price * amount).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Gas Overhead:</span>
                <span className="text-emerald-400 font-bold">$0.00 (Off-Chain Channel)</span>
              </div>
            </div>

            <button
              id="submit-order-btn"
              onClick={handlePlaceOrder}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all ${
                side === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              }`}
            >
              Execute Off-Chain {side} Order
            </button>
          </div>
        </div>

        {/* Live Orderbook Ladder */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-sans">Live Order Depth</h2>
            <span className="text-[10px] text-zinc-400">ETH / USDT</span>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-3 text-zinc-500 text-[10px] pb-1 border-b border-zinc-800">
              <span>PRICE (USDT)</span>
              <span className="text-right">SIZE (ETH)</span>
              <span className="text-right">TOTAL</span>
            </div>

            {/* Asks / Sell Orders */}
            <div className="space-y-1">
              {sellOrders.map((s) => (
                <div key={s.id} className="grid grid-cols-3 text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors">
                  <span className="font-bold">${s.price.toFixed(1)}</span>
                  <span className="text-right text-zinc-300">{s.amount.toFixed(2)}</span>
                  <span className="text-right text-zinc-400">${(s.price * s.amount).toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Spread Divider */}
            <div className="py-2 my-1 border-y border-zinc-800 flex items-center justify-between text-yellow-400 font-bold">
              <span>SPREAD: $4.50</span>
              <span className="text-zinc-400 font-normal text-[10px]">MID: $2,850.25</span>
            </div>

            {/* Bids / Buy Orders */}
            <div className="space-y-1">
              {buyOrders.map((b) => (
                <div key={b.id} className="grid grid-cols-3 text-emerald-400 hover:bg-emerald-500/10 p-1 rounded transition-colors">
                  <span className="font-bold">${b.price.toFixed(1)}</span>
                  <span className="text-right text-zinc-300">{b.amount.toFixed(2)}</span>
                  <span className="text-right text-zinc-400">${(b.price * b.amount).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Off-Chain Execution Stream */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white">Matched Off-Chain Trades</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
            {orders.filter((o) => o.status === 'MATCHED').map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${m.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.type} {m.amount} ETH @ ${m.price}
                  </span>
                  <span className="text-[10px] text-yellow-400">seq #{m.seq}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Trader: {m.trader}</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>0 Gas Settled</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
