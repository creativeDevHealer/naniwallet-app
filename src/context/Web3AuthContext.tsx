import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletInfo } from '../services/walletService';
import WalletService from '../services/walletService';

interface Web3AuthContextType {
  // State
  isInitialized: boolean;
  isLoggedIn: boolean;
  user: any | null;
  wallet: WalletInfo | null;
  wallets: WalletInfo[];
  loading: boolean;
  
  // Methods
  initialize: () => Promise<void>;
  login: (loginProvider: string) => Promise<void>;
  logout: () => Promise<void>;
  createWallet: () => Promise<void>;
  importWalletFromMnemonic: (mnemonic: string) => Promise<void>;
  importWalletFromPrivateKey: (privateKey: string) => Promise<void>;
  getWalletBalance: () => Promise<string>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  validateMnemonic: (mnemonic: string) => boolean;
  generateBackup: () => any;
  clearWallet: () => void;
  setActiveWallet: (walletId: string) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
  renameWallet: (walletId: string, name: string) => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const walletService = WalletService.getInstance();

  // Initialize wallet on app start
  useEffect(() => {
    initialize();
  }, []);

  // Initialize Simple Wallet
  const initialize = async () => {
    try {
      setLoading(true);
      console.log('🔧 Initializing Simple Wallet...');
      
      // Migration: move single wallet to multi-wallets if needed
      const storedWallet = await AsyncStorage.getItem('walletInfo');
      const storedWallets = await AsyncStorage.getItem('wallets');
      if (storedWallets) {
        const list: WalletInfo[] = JSON.parse(storedWallets);
        setWallets(list);
        const activeId = await AsyncStorage.getItem('activeWalletId');
        if (activeId) {
          const target = list.find(w => (w.id || w.address) === activeId);
          if (target) setWallet(target);
          else if (list.length > 0) setWallet(list[0]);
        } else if (list.length > 0) {
          setWallet(list[0]);
        }
        setIsLoggedIn(list.length > 0);
        console.log('✅ Loaded wallets list from storage:', list.length);
      } else if (storedWallet) {
        const w: WalletInfo = JSON.parse(storedWallet);
        const withId: WalletInfo = { ...w, id: w.id || w.address, name: w.name || 'Wallet1' };
        const list = [withId];
        setWallets(list);
        setWallet(withId);
        setIsLoggedIn(true);
        await AsyncStorage.setItem('wallets', JSON.stringify(list));
        await AsyncStorage.setItem('activeWalletId', withId.id || withId.address);
        console.log('✅ Migrated single wallet to multi-wallets');
      }
      
      setIsInitialized(true);
      console.log('✅ Simple Wallet initialized successfully');
    } catch (error) {
      console.error('❌ Simple Wallet initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login with Social Provider (Mock implementation)
  const login = async (loginProvider: string) => {
    try {
      setLoading(true);
      console.log('🔐 Logging in with provider:', loginProvider);
      
      // Mock social login - in production, you'd integrate with actual OAuth providers
      const mockUser = {
        id: `user_${Date.now()}`,
        email: `user@${loginProvider}.com`,
        name: `${loginProvider} User`,
        provider: loginProvider,
        profileImage: `https://via.placeholder.com/100?text=${loginProvider.charAt(0).toUpperCase()}`
      };
      
      setUser(mockUser);
      setIsLoggedIn(true);

      // Create a mock wallet for social login users (append to list)
      const walletInfo: WalletInfo = {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        privateKey: `0x${Math.random().toString(16).substr(2, 64)}`,
        publicKey: `0x${Math.random().toString(16).substr(2, 64)}`,
        mnemonic: '', // No mnemonic for social login
        network: 'ethereum',
      };
      const withId: WalletInfo = { ...walletInfo, id: walletInfo.address, name: `Wallet${wallets.length + 1}` };
      const next = [...wallets, withId];
      setWallets(next);
      setWallet(withId);

      await AsyncStorage.setItem('wallets', JSON.stringify(next));
      await AsyncStorage.setItem('activeWalletId', withId.id || withId.address);
      await AsyncStorage.setItem('userInfo', JSON.stringify(mockUser));
      
      console.log('✅ Social login successful:', mockUser);
    } catch (error) {
      console.error('❌ Social login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout from Wallet
  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out from wallet...');
      
      setUser(null);
      // Keep wallets persisted; only clear user info and in-memory active wallet
      setWallet(null);
      setIsLoggedIn(false);
      await AsyncStorage.removeItem('userInfo');
      
      console.log('✅ Wallet logout successful');
    } catch (error) {
      console.error('❌ Wallet logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new wallet with proper mnemonic generation
  const createWallet = async () => {
    try {
      setLoading(true);
      console.log('💼 Creating new wallet...');
      
      // Generate new wallet using the wallet service
      const walletInfo = await walletService.generateNewWallet();
      
      const withId: WalletInfo = { ...walletInfo, id: walletInfo.address, name: `Wallet${wallets.length + 1}` };
      const next = [...wallets, withId];
      setWallets(next);
      setWallet(withId);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('wallets', JSON.stringify(next));
      
      console.log('✅ New wallet created:', {
        address: walletInfo.address,
        hasMnemonic: !!walletInfo.mnemonic
      });
    } catch (error) {
      console.error('❌ Wallet creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Import wallet from mnemonic
  const importWalletFromMnemonic = async (mnemonic: string) => {
    try {
      setLoading(true);
      console.log('📥 Importing wallet from mnemonic...');
      
      const walletInfo = await walletService.importWalletFromMnemonic(mnemonic);
      
      const withId: WalletInfo = { ...walletInfo, id: walletInfo.address, name: `Wallet${wallets.length + 1}` };
      const next = [...wallets, withId];
      setWallets(next);
      setWallet(withId);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('wallets', JSON.stringify(next));
      
      console.log('✅ Wallet imported from mnemonic:', {
        address: walletInfo.address
      });
    } catch (error) {
      console.error('❌ Failed to import wallet from mnemonic:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Import wallet from private key
  const importWalletFromPrivateKey = async (privateKey: string) => {
    try {
      setLoading(true);
      console.log('🔑 Importing wallet from private key...');
      
      const walletInfo = await walletService.importWalletFromPrivateKey(privateKey);
      
      const withId: WalletInfo = { ...walletInfo, id: walletInfo.address, name: `Wallet${wallets.length + 1}` };
      const next = [...wallets, withId];
      setWallets(next);
      setWallet(withId);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('wallets', JSON.stringify(next));
      
      console.log('✅ Wallet imported from private key:', {
        address: walletInfo.address
      });
    } catch (error) {
      console.error('❌ Failed to import wallet from private key:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get wallet balance
  const getWalletBalance = async (): Promise<string> => {
    try {
      if (!wallet) {
        console.warn('No wallet connected; returning zero balance');
        return '0.0';
      }

      const balance = await walletService.getBalance(wallet.address);
      return balance;
    } catch (error) {
      console.warn('❌ Failed to get wallet balance:', error);
      return '0.0';
    }
  };

  // Send transaction
  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    try {
      if (!wallet) {
        throw new Error('No wallet found');
      }
      
      const txHash = await walletService.sendTransaction(to, amount);
      console.log('📤 Transaction sent:', { to, amount, txHash });
      return txHash;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  };

  // Validate mnemonic
  const validateMnemonic = (mnemonic: string): boolean => {
    return walletService.validateMnemonic(mnemonic);
  };

  // Generate backup
  const generateBackup = () => {
    if (!wallet) {
      throw new Error('No wallet found');
    }
    return walletService.generateBackup(wallet);
  };

  // Clear wallet
  const clearWallet = () => {
    walletService.clearWallet();
    setWallet(null);
    setIsLoggedIn(false);
    setUser(null);
  };

  const setActiveWallet = async (walletId: string) => {
    const target = wallets.find(w => (w.id || w.address) === walletId);
    if (target) {
      setWallet(target);
      await AsyncStorage.setItem('activeWalletId', walletId);
    }
  };

  const removeWallet = async (walletId: string) => {
    const next = wallets.filter(w => (w.id || w.address) !== walletId);
    setWallets(next);
    await AsyncStorage.setItem('wallets', JSON.stringify(next));
    const activeId = await AsyncStorage.getItem('activeWalletId');
    if (activeId === walletId) {
      const newActive = next[0] || null;
      setWallet(newActive || null);
      if (newActive) await AsyncStorage.setItem('activeWalletId', newActive.id || newActive.address);
      else await AsyncStorage.removeItem('activeWalletId');
      setIsLoggedIn(!!newActive);
    }
  };

  const renameWallet = async (walletId: string, name: string) => {
    const next = wallets.map(w => (w.id || w.address) === walletId ? { ...w, name } : w);
    setWallets(next);
    await AsyncStorage.setItem('wallets', JSON.stringify(next));
    if (wallet && (wallet.id || wallet.address) === walletId) {
      setWallet({ ...wallet, name });
    }
  };

  // (init handled above)

  const value: Web3AuthContextType = {
    isInitialized,
    isLoggedIn,
    user,
    wallet,
    wallets,
    loading,
    initialize,
    login,
    logout,
    createWallet,
    importWalletFromMnemonic,
    importWalletFromPrivateKey,
    getWalletBalance,
    sendTransaction,
    validateMnemonic,
    generateBackup,
    clearWallet,
    setActiveWallet,
    removeWallet,
    renameWallet,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = (): Web3AuthContextType => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};
