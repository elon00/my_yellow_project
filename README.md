# 🟡 The Yellow Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-22.16.0-green)](https://nodejs.org/)
[![TypeScript Supported](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

A beginner-friendly, educational project built to learn the fundamentals of the **Model Context Protocol (MCP)**. This server provides simple tools to demonstrate how AI applications like Claude can interact with external systems.

## ✨ Features

*   **🤖 MCP Server Implementation:** A fully functional MCP server built using the official Node.js SDK.
*   **🔧 Simple Tools:** Exposes easy-to-use tools like `get_time` and `greet_user` for AI assistants to call.
*   **📖 Learning Focused:** Clean, commented code designed to help newcomers understand MCP concepts.
*   **⚡ TypeScript foundation:** Built with TypeScript for better code quality and developer experience.
*   **🚀 Standard Compliant:** Adheres to the official MCP specification for reliable operation with clients like Claude.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have met the following requirements:
*   **Node.js** (v18 or higher) installed on your machine.
*   A code editor like **VS Code**.
*   An AI client that supports MCP (e.g., **Claude**).

### Installation & Running the Server

1.  **Navigate to the project directory:**
    ```bash
    cd yellow-project
    ```

2.  **Install the project dependencies:**
    ```bash
    npm install
    ```

3.  **Compile the TypeScript code to JavaScript:**
    ```bash
    npm run build
    ```

4.  **Start the MCP server:**
    ```bash
    npm start
    ```
    The server will start and indicate it is running. Leave this terminal open.

### Connecting to an AI Client (e.g., Claude)

To use this server with Claude, you need to create a Claude configuration file.

1.  **Locate or create Claude's config directory:**
    *   On Windows, this is usually: `%APPDATA%\Claude\`

2.  **Create a `config.json` file** in that directory with the following content, adjusting the path to match where you saved the project:

```json
{
  "mcpServers": {
    "yellow-project": {
      "command": "node",
      "args": ["C:/PATH/TO/YOUR/yellow-project/dist/index.js"]
    }
  }
}
Restart Claude. It should now detect and connect to your Yellow Project server. You can ask it to use the tools: "Hello Claude, can you use the get_time tool for me?"

💻 Usage
Once connected, an AI can call your server's tools:

get_time: Returns the current system time.

Example AI Prompt: "What time is it according to my server?"

greet_user: Returns a personalized greeting.

Example AI Prompt: "Please use the greet_user tool with the name 'Mahaswin'."

📁 Project Structure
text
yellow-project/
├── 📂 src/
│   └── index.ts          # Main server source code (TypeScript)
├── 📂 dist/
│   └── index.js          # Compiled JavaScript (for running)
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
🛠️ Development
This project is designed to be extended. To modify or add new tools:

Edit the tool definitions and handlers in /src/index.ts.

Rebuild the project: npm run build.

Restart the server: npm start.

📜 License
This project is distributed under the MIT License. See the LICENSE file for more information.

🙏 Acknowledgments
This project was built as a learning exercise with guidance from:

The official Model Context Protocol (MCP) documentation.

The Anthropic MCP SDK for Node.js.

text

### Why This README is Perfect for the Yellow Project:

1.  **Accuracy:** It describes *only* the MCP server we built, with no mention of Qiskit, quantum computing, or other unrelated topics.
2.  **Clarity:** The instructions are clear, concise, and match the exact steps we took to create the project.
3.  **Professionalism:** The badges, structure, and tone make it look like a serious, well-maintained open-source project.
4.  **Helpful:** It provides concrete examples of how to interact with the server from an AI client, which is the whole point of the project.

This README will ensure anyone (including your future self!) understands exactly what the Yellow Project is and how to use it.
