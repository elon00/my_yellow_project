import { NitroliteClient } from '@erc7824/nitrolite';
import { ethers } from 'ethers';

const CLEARNODE_WS = import.meta.env.REACT_APP_CLEARNODE_WS || 'wss://clearnet.yellow.org/ws';

export function createSignerAdapter(ethersSigner) {
  return {
    async signMessage(message) {
      try {
        if (typeof message === 'string') {
          return await ethersSigner.signMessage(message);
        } else {
          const messageString = new TextDecoder().decode(message);
          return await ethersSigner.signMessage(messageString);
        }
      } catch (error) {
        console.error("Error signing message:", error);
        throw error;
      }
    },
    async getAddress() {
      return await ethersSigner.getAddress();
    },
  };
}

export async function initNitroliteClient(signerAdapter, wsUrl = CLEARNODE_WS) {
  try {
    const client = new NitroliteClient({ 
      wsUrl, 
      signer: signerAdapter 
    });
    await client.connect();
    console.log("Nitrolite client connected successfully!");
    return client;
  } catch (error) {
    console.error("Failed to initialize Nitrolite client:", error);
    throw error;
  }
}

export async function createSession(client, appId, participants) {
  try {
    const session = await client.createSession({
      appId: appId,
      participants: participants,
    });
    console.log("Session created:", session);
    return session;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function proposeState(client, sessionId, stateObj) {
  try {
    const stateUpdate = await client.proposeState(sessionId, stateObj);
    console.log("State proposed:", stateUpdate);
    return stateUpdate;
  } catch (error) {
    console.error("Error proposing state:", error);
    throw error;
  }
}

export async function cooperativeClose(client, sessionId, finalState) {
  try {
    const result = await client.closeSession(sessionId, finalState);
    console.log("Session closed cooperatively:", result);
    return result;
  } catch (error) {
    console.error("Error in cooperative close:", error);
    throw error;
  }
}
