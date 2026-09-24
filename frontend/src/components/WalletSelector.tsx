import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'metamask' | 'ledger' | 'walletconnect' | 'freighter';
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    description: 'Connect using the Freighter wallet extension.',
    icon: '🦫',
    type: 'freighter',
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension.',
    icon: '🦊',
    type: 'metamask',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Connect using your Ledger hardware wallet.',
    icon: '🔑',
    type: 'ledger',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan QR code to connect mobile wallet.',
    icon: '📱',
    type: 'walletconnect',
  },
];

export const WalletSelector: React.FC = () => {
  const { connect, error, clearError } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      setSelectedWallet(null);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="wallet-selector-container">
      <h2>Connect Wallet</h2>
      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={clearError} className="close-error">×</button>
        </div>
      )}
      
      <div className="wallet-options-grid">
        {WALLET_OPTIONS.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            className="wallet-option-btn"
            aria-label={`Connect with ${wallet.name}`}
          >
            <span className="wallet-icon" aria-hidden="true">
              {wallet.icon}
            </span>
            <div className="wallet-info">
              <span className="wallet-name">{wallet.name}</span>
              <span className="wallet-description">{wallet.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletSelector;