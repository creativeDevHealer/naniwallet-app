// Simple wallet configuration without Web3Auth dependencies

// Simple Wallet Configuration
export const WALLET_CONFIG = {
  // Network configuration
  network: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://rpc.ankr.com/eth',
    blockExplorerUrl: 'https://etherscan.io',
    currency: 'ETH',
    decimals: 18,
  },
  
  // App configuration
  app: {
    name: 'Nani Wallet',
    version: '1.0.0',
  },
  
  // Security settings
  security: {
    sessionTimeout: 86400, // 24 hours in seconds
    maxLoginAttempts: 5,
  },
};

// Simple Wallet Types
export interface WalletUser {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  provider?: string;
}

// Wallet interface
export interface WalletInfo {
  address: string;
  privateKey: string;
  publicKey: string;
  balance?: string;
  network: string;
}

// Export default configuration
export default WALLET_CONFIG;
