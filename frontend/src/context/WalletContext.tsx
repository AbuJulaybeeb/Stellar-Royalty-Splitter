import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletAdapter, WalletType, WalletState, getWalletAdapter } from '../lib/wallet-adapter';

interface WalletContextType {
  wallet: WalletState | null;
  adapter: WalletAdapter | null;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [adapter, setAdapter] = useState<WalletAdapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect on mount if preference exists
  useEffect(() => {
    const autoConnect = async () => {
      const savedType = localStorage.getItem('selectedWalletType') as WalletType | null;
      if (savedType) {
        try {
          const newAdapter = getWalletAdapter(savedType);
          const state = await newAdapter.connect();
          setWallet(state);
          setAdapter(newAdapter);
        } catch (err: any) {
          // Ignore auto-connect failures (e.g., wallet not installed)
          console.warn('Auto-connect failed:', err.message);
          setError('Auto-connect failed. Please select a wallet manually.');
        }
      }
    };
    autoConnect();
  }, []);

  const connect = async (type: WalletType) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAdapter = getWalletAdapter(type);
      const state = await newAdapter.connect();
      setWallet(state);
      setAdapter(newAdapter);
      localStorage.setItem('selectedWalletType', type);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    if (!adapter) return;
    try {
      await adapter.disconnect();
      setWallet(null);
      setAdapter(null);
      localStorage.removeItem('selectedWalletType');
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  const signTransaction = async (transaction: string): Promise<string> => {
    if (!adapter) {
      throw new Error('No wallet connected');
    }
    try {
      return await adapter.sign(transaction);
    } catch (err: any) {
      setError(err.message || 'Failed to sign transaction');
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        adapter,
        connect,
        disconnect,
        signTransaction,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};