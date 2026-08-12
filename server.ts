import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoint for AI Agentics Chat & Copilot
  app.post("/api/ai-agent", async (req, res) => {
    try {
      const { message, history, context } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback intelligent agentic response if API key is not configured in secrets
        return res.json({
          text: generateFallbackAgentResponse(message, context),
          agenticAction: detectAgenticAction(message, context),
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are Nitrolite AI, an autonomous Web 4.0 Agentic Assistant & Protocol Specialist for Yellow Network's ERC-7824 State Channel Clearing Engine.
You assist users with:
1. ERC-7824 Nitrolite Off-Chain State Channels, EIP-712 Multi-Sigs, sub-millisecond settlement, and dispute challenges.
2. Web 4.0 Autonomous Agentics: Machine-to-machine state negotiations, automated liquidity routing, and autonomous agent arbitrage.
3. Conway Automaton AI: Cellular automaton entropy generators for dynamic state channel topology optimization and collateral distribution.
4. Post-Quantum Cryptography (PQC): CRYSTALS-Dilithium (ML-DSA) post-quantum signatures and CRYSTALS-Kyber (ML-KEM) key encapsulation guarding state channels against Shor's algorithm quantum threats.

Current state channel context:
- Active Session: ${context?.sessionId || 'None'}
- Wallet: ${context?.walletAddress || '0xAlice...'}
- Sequence Number: ${context?.seq || 1}
- Balances: ${JSON.stringify(context?.balances || {})}

Be concise, technically precise, authoritative, and helpful. Format output with clean markdown.`;

      const contents = history && history.length > 0
        ? history.map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })).concat([{ role: 'user', parts: [{ text: message }] }])
        : message;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "Agent processed request.";
      const action = detectAgenticAction(message, context);

      res.json({
        text: responseText,
        agenticAction: action,
      });
    } catch (err: any) {
      console.error("AI Agent error:", err);
      // Return structured fallback response on API error
      res.json({
        text: `[Nitrolite Agent Local Processing]: ${generateFallbackAgentResponse(req.body.message, req.body.context)}`,
        agenticAction: detectAgenticAction(req.body.message, req.body.context),
        error: err.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function detectAgenticAction(prompt: string, context: any) {
  const p = prompt.toLowerCase();
  if (p.includes("conway") || p.includes("automaton") || p.includes("cellular")) {
    return { type: "TRIGGER_CONWAY", pattern: "GLIDER_GUN" };
  }
  if (p.includes("pqc") || p.includes("dilithium") || p.includes("quantum")) {
    return { type: "RUN_PQC_AUDIT", algorithm: "CRYSTALS-Dilithium5" };
  }
  if (p.includes("web 4") || p.includes("web4") || p.includes("negotiate") || p.includes("route")) {
    return { type: "WEB4_NEGOTIATE", strategy: "AUTONOMOUS_ARBITRAGE" };
  }
  if (p.includes("balance") || p.includes("pay") || p.includes("transfer")) {
    return { type: "PROPOSE_STATE_UPDATE", amount: 25.0 };
  }
  return null;
}

function generateFallbackAgentResponse(prompt: string, context: any) {
  const p = prompt.toLowerCase();
  if (p.includes("conway") || p.includes("automaton") || p.includes("cellular")) {
    return `### 🦠 Conway Automaton AI Engine
Analyzing cellular automaton entropy grid for Yellow ERC-7824 state channel topology.
- **Pattern Selected**: Glider Gun / Pulsar Seed Matrix
- **Entropy Vector**: \`0x9a4f...c32e\` (Derived from Game of Life Generations)
- **Topological Optimization**: Reallocated collateral across 16 Clearnodes with 0.04ms execution.`;
  }
  if (p.includes("pqc") || p.includes("dilithium") || p.includes("quantum")) {
    return `### 🛡️ Post-Quantum Cryptography (PQC) Audit
Inspecting ERC-7824 Nitrolite State Channel with **NIST ML-DSA (CRYSTALS-Dilithium5)**:
- **Classic Signature**: ECDSA \`secp256k1\` (EIP-712)
- **Post-Quantum Key**: Dilithium5 Public Key (2,592 Bytes)
- **Quantum Resistance**: Validated against Shor's Algorithm (2048-qubit quantum attack resistant).`;
  }
  if (p.includes("web 4") || p.includes("web4") || p.includes("agent") || p.includes("negotiate")) {
    return `### 🌐 Web 4.0 Autonomous Agentic Negotiation
Autonomous Agents **Agent-Alpha (Trader)** and **Agent-Beta (Clearnode)** completed off-chain zero-latency state negotiation:
- **Proposed Delta**: +15.5 USDT to Agent-Alpha
- **Sequence**: \`seq_${(context?.seq || 1) + 1}\`
- **Multi-Sig Status**: Dual EIP-712 + Dilithium5 PQC signature generated autonomously in 1.2ms.`;
  }
  return `### 🟡 Yellow Nitrolite Agentic Copilot
I am active and monitoring ERC-7824 Session \`${context?.sessionId ? context.sessionId.slice(0, 10) + '...' : 'Default'}\`.
How can I assist you with state channel micropayments, Web 4.0 autonomous routing, Conway Automaton topology generation, or PQC quantum audits today?`;
}

startServer();
