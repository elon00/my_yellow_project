# 🟡 Yellow Nitrolite Hub | ERC-7824 State Channel Clearing Platform

[![Yellow Network](https://img.shields.io/badge/Yellow_Network-Nitrolite_ERC--7824-yellow.svg)](https://yellow.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)

> **Next-Generation Off-Chain State Channel & Decentralized Clearing Infrastructure Built on Yellow Network's ERC-7824 Nitrolite Standard.**

---

## 🌟 Overview

**Yellow Nitrolite Hub** is a production-ready, high-performance web platform designed to showcase the full power of Yellow Network's **ERC-7824 state channel protocol**. It delivers sub-millisecond off-chain state updates, zero-gas transactions, dual-party EIP-712 signature verification, and secure on-chain EVM settlement.

---

## ✨ Core Features & Modules

### 1. ⚡ Off-Chain High-Speed Micropayments
* **Zero-Gas Streaming:** Execute instant off-chain payments (<2ms finality) without paying EVM gas fees per transaction.
* **Continuous Auto-Stream:** High-frequency payment stream simulator for pay-per-second API streaming or micro-tips.
* **Cooperative Settlement:** Single-click on-chain settlement submitting the final multi-sig state to EVM contracts.

### 2. 📊 Zero-Gas High-Frequency Orderbook (DEX)
* **Off-Chain Limit Orders:** Place buy and sell orders that match instantly in state channel proposals.
* **Depth & Spread Visualizer:** Real-time orderbook ladder, spread tracking, and sub-millisecond trade match execution.

### 3. 🎮 Peer-to-Peer State Channel Gaming & Dispute Engine
* **Turn-Based Off-Chain State Machine:** Play off-chain games (e.g. Tic-Tac-Toe / Peer Wagers) where every move signs a new `seq` proposal off-chain.
* **Dispute Resolution Challenge Window:** Simulate counterparty disputes where stale states (`seq_n-k`) are rejected in favor of higher sequence numbers (`seq_n`).

### 4. 🌐 Yellow Clearnode Monitor & Topology
* **Clearnet Telemetry:** Live ping latency gauge, peer connection counts, and active channel tracking across global Clearnode gateways (US-East, EU-Central, AP-East).
* **Frame Traffic Logger:** Real-time WebSocket payload inspector tracking EIP-712 state signatures and JSON-RPC message frames.

### 5. 🤖 AI Agentics Chat Bot & Nitrolite Copilot
* **Server-Side Gemini AI Agent:** Powered by `@google/genai` (`gemini-3.6-flash`), providing autonomous state channel operation, automated balance proposals, PQC signature auditing, and protocol explanations.
* **Agentic Action Execution:** Directly triggers state updates, Conway automaton rebalancing, and quantum audit checks from conversation prompts.

### 6. 🌐 Web 4.0 Autonomous State Channel Routing
* **Machine-to-Machine State Negotiation:** Autonomous AI agents (`Agent-Alpha`, `Agent-Beta`, `Agent-Gamma`, `Agent-Delta`) auto-proposing and signing off-chain state updates with sub-millisecond latency.
* **Trust & Reputation Metrics:** Dynamic trust scores, auto-signing risk limits, and real-time TPS throughput visualization.

### 7. 🦠 Conway Automaton AI Cellular Topology Engine
* **20x20 Cellular Automaton Canvas:** Conway's Game of Life grid generating cryptographic entropy vectors (`Keccak256`) for dynamic Clearnode liquidity allocation.
* **Interactive Controls:** Run/pause, step next generation, preset patterns (Gosper Glider Gun, Pulsar, Random), and apply grid entropy to ERC-7824 state channel sequence proposals.

### 8. 🛡️ Post-Quantum Cryptography (PQC) Security Engine
* **NIST FIPS 204 Compliant:** CRYSTALS-Dilithium5 (ML-DSA) and CRYSTALS-Kyber1024 (ML-KEM) lattice-based signature inspection.
* **Quantum Shor's Algorithm Threat Simulator:** Test classical ECDSA vs. Hybrid PQC against a 2,048-qubit quantum supercomputer attack with downloadable PQC Audit Certificates.

### 9. 🛡️ Formal Security & Invariant Audit Suite
* **Automated Safety Invariant Checks:**
  1. *Monotonic Sequence Invariant* ($\text{seq}_n > \text{seq}_{n-1}$)
  2. *Conservation of Collateral* ($\sum B_i = C$)
  3. *EIP-712 Signature Integrity*
  4. *Challenge Timelock Validation*
  5. *Smart Contract Bytecode Match*
* **Judge Certificate Exporter:** One-click download of formal audit reports for hackathon evaluation.

### 6. 🛠️ Interactive Developer Sandbox & Smart Contracts
* **Code Snippets:** Complete TypeScript (`@erc7824/nitrolite`) & Solidity (`ERC7824Settlement.sol`) integration guides.
* **Live Cryptographic Calculator:** Derive Keccak256 state hashes and EIP-712 domain signatures in real time.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### Production Build

```bash
npm run build
```

---

## 🏗️ Architecture & Technologies

* **Protocol Standard:** ERC-7824 (Yellow Nitrolite)
* **SDKs & Libraries:** `@erc7824/nitrolite`, `ethers` v6, `recharts`, `lucide-react`, `motion`
* **Frontend:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4
* **Smart Contract Reference:** Solidity `0.8.20` (`ERC7824Settlement.sol`)

---

## 📜 License

MIT License. Designed for Yellow Network Hackathons & Decentralized Clearing Innovation.
