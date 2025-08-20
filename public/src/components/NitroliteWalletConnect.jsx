import React, { useState } from 'react';
import { ethers } from 'ethers';
import { createSignerAdapter, initNitroliteClient, createSession, proposeState, cooperativeClose } from '../lib/nitroliteClient';

const NitroliteWalletConnect = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [client, setClient] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
    console.log(message);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const address = await newSigner.getAddress();

        setProvider(newProvider);
        setSigner(newSigner);
        setAccount(address);
        addLog(`Wallet connected: ${address}`);
      } catch (error) {
        addLog('Error connecting wallet: ' + error.message);
      }
    } else {
      addLog('Please install MetaMask!');
    }
  };

  const connectNitrolite = async () => {
    if (!signer) {
      addLog('Please connect your wallet first.');
      return;
    }
    try {
      const signerAdapter = createSignerAdapter(signer);
      const nitroClient = await initNitroliteClient(signerAdapter);
      setClient(nitroClient);
      addLog('Connected to Nitrolite Network!');
    } catch (error) {
      addLog('Nitrolite connection failed: ' + error.message);
    }
  };

  const createNewSession = async () => {
    if (!client) {
      addLog('Please connect to Nitrolite first.');
      return;
    }
    const friendAddress = '0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9';
    try {
      const session = await createSession(client, 'my-cool-app', [account, friendAddress]);
      setSessionInfo(session);
      addLog(`Session Created! ID: ${session.sessionId}`);
    } catch (error) {
      addLog('Error creating session: ' + error.message);
    }
  };

  const sendPayment = async () => {
    if (!client || !sessionInfo) {
      addLog('No active session. Create one first.');
      return;
    }
    const newState = {
      seq: 1,
      balances: {
        [account]: 90,
        ['0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9']: 10,
      },
    };
    try {
      await proposeState(client, sessionInfo.sessionId, newState);
      addLog('Payment state updated! Seq: ' + newState.seq);
    } catch (error) {
      addLog('Error sending payment: ' + error.message);
    }
  };

  const closeChannel = async () => {
    if (!client || !sessionInfo) {
      addLog('No active session to close.');
      return;
    }
    const finalState = {
      seq: 2,
      balances: {
        [account]: 90,
        ['0x0B2Ef6d2E2eD96F6dA5C0dE8376C5C83873f62F9']: 10,
      },
    };
    try {
      await cooperativeClose(client, sessionInfo.sessionId, finalState);
      addLog('Channel closed successfully! Funds can now be settled on-chain.');
    } catch (error) {
      addLog('Error closing channel: ' + error.message);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
      <h2>ERC-7824 Nitrolite Demo</h2>

      <div>
        <button onClick={connectWallet} style={{ margin: '5px', padding: '10px' }}>
          1. Connect Wallet
        </button>
        <button onClick={connectNitrolite} style={{ margin: '5px', padding: '10px' }}>
          2. Connect to Nitrolite
        </button>
        <button onClick={createNewSession} style={{ margin: '5px', padding: '10px' }}>
          3. Create Session
        </button>
        <button onClick={sendPayment} style={{ margin: '5px', padding: '10px' }}>
          4. Send Payment
        </button>
        <button onClick={closeChannel} style={{ margin: '5px', padding: '10px' }}>
          5. Close Channel
        </button>
      </div>

      <div>
        <p>Account: {account || 'Not connected'}</p>
        <p>Nitrolite: {client ? 'Connected' : 'Not connected'}</p>
        <p>Session: {sessionInfo ? sessionInfo.sessionId : 'None'}</p>
      </div>

      <div>
        <h3>Activity Log:</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NitroliteWalletConnect;
