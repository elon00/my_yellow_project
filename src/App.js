import React from 'react'
import NitroliteWalletConnect from './components/NitroliteWalletConnect'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>My Yellow ERC-7824 App</h1>
      <p>Welcome! Connect your wallet to start.</p>
      <NitroliteWalletConnect />
    </div>
  )
}

export default App
