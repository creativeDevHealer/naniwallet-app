import { ethers } from 'ethers';

export interface ETHBalanceInfo {
  balance: number; // in ETH
  balanceWei: string;
  address: string;
  network: 'mainnet' | 'sepolia' | 'goerli';
}

export default class ETHBalanceService {
  private static instance: ETHBalanceService;
  private cache: Map<string, { info: ETHBalanceInfo; ts: number }> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds for balance data

  // Sepolia testnet RPC endpoints
  private readonly SEPOLIA_RPC_URLS = [
    'https://ethereum-sepolia-rpc.publicnode.com', // PublicNode (often most stable)
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura
    'https://sepolia.drpc.org', // DRPC
    'https://rpc.sepolia.org', // Public RPC (sometimes returns 522)
  ];

  static getInstance(): ETHBalanceService {
    if (!ETHBalanceService.instance) {
      ETHBalanceService.instance = new ETHBalanceService();
    }
    return ETHBalanceService.instance;
  }

  /**
   * Get ETH balance for a given address on Sepolia testnet
   */
  async getETHBalance(address: string, network: 'sepolia' | 'mainnet' = 'sepolia'): Promise<ETHBalanceInfo> {
    try {
      const cacheKey = `${address}:${network}`;

      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
        return cached.info;
      }

      let balanceInfo: ETHBalanceInfo;

      if (network === 'sepolia') {
        balanceInfo = await this.fetchSepoliaBalance(address);
      } else {
        balanceInfo = await this.fetchMainnetBalance(address);
      }

      // Cache the result
      this.cache.set(cacheKey, { info: balanceInfo, ts: Date.now() });
      return balanceInfo;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      // Return zero balance on error
      return {
        balance: 0,
        balanceWei: '0',
        address,
        network
      };
    }
  }

  /**
   * Fetch ETH balance from Sepolia testnet
   */
  private async fetchSepoliaBalance(address: string): Promise<ETHBalanceInfo> {
    console.log(`🔍 Fetching Sepolia balance for address: ${address}`);
    
    // Try multiple RPC endpoints for reliability
    for (let i = 0; i < this.SEPOLIA_RPC_URLS.length; i++) {
      const rpcUrl = this.SEPOLIA_RPC_URLS[i];
      try {
        console.log(`🔄 Trying Sepolia RPC ${i + 1}/${this.SEPOLIA_RPC_URLS.length}: ${rpcUrl}`);
        // Use short timeout to fail fast on dead endpoints
        const req = new ethers.FetchRequest(rpcUrl);
        // @ts-ignore - timeout is supported in ethers FetchRequest
        (req as any).timeout = 7000;
        const provider = new ethers.JsonRpcProvider(req);
        
        // Verify we're connected to Sepolia
        const network = await provider.getNetwork();
        console.log(`📡 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 11155111n) { // Sepolia chain ID
          console.log(`⚠️ RPC returned wrong network: ${network.chainId}, expected 11155111`);
          continue;
        }

        const balanceWei = await provider.getBalance(address);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));

        console.log(`✅ Sepolia balance fetched: ${balanceEth} ETH (${balanceWei} wei) for ${address}`);

        return {
          balance: balanceEth,
          balanceWei: balanceWei.toString(),
          address: address,
          network: 'sepolia'
        };
      } catch (error) {
        // Downgrade to debug-level noise to avoid alarming console while we rotate endpoints
        console.log(`❌ Failed to fetch from ${rpcUrl}:`, error);
        if (i === this.SEPOLIA_RPC_URLS.length - 1) {
          console.error(`💥 All RPC endpoints failed for address: ${address}`);
        }
        continue;
      }
    }

    throw new Error(`All Sepolia RPC endpoints failed for address: ${address}`);
  }

  /**
   * Fetch ETH balance from mainnet
   */
  private async fetchMainnetBalance(address: string): Promise<ETHBalanceInfo> {
    try {
      // Use a reliable mainnet RPC
      const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
      
      const balanceWei = await provider.getBalance(address);
      const balanceEth = parseFloat(ethers.formatEther(balanceWei));

      console.log(`✅ Mainnet balance fetched: ${balanceEth} ETH for ${address}`);

      return {
        balance: balanceEth,
        balanceWei: balanceWei.toString(),
        address: address,
        network: 'mainnet'
      };
    } catch (error) {
      console.error('Mainnet balance fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get balance for a specific token (ETH only)
   */
  async getTokenBalance(token: { symbol: string }, address: string): Promise<number> {
    if (token.symbol.toUpperCase() !== 'ETH') {
      return 0;
    }

    try {
      const balanceInfo = await this.getETHBalance(address, 'sepolia'); // Use Sepolia testnet
      return balanceInfo.balance;
    } catch (error) {
      console.error('Error getting ETH token balance:', error);
      return 0;
    }
  }

  /**
   * Get current gas price for Sepolia
   */
  async getGasPrice(network: 'sepolia' | 'mainnet' = 'sepolia'): Promise<string> {
    try {
      const rpcUrl = network === 'sepolia' 
        ? this.SEPOLIA_RPC_URLS[0] 
        : 'https://eth-mainnet.g.alchemy.com/v2/demo';
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      
      return ethers.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return '20'; // Default fallback
    }
  }

  /**
   * Get transaction count (nonce) for an address
   */
  async getTransactionCount(address: string, network: 'sepolia' | 'mainnet' = 'sepolia'): Promise<number> {
    try {
      const rpcUrl = network === 'sepolia' 
        ? this.SEPOLIA_RPC_URLS[0] 
        : 'https://eth-mainnet.g.alchemy.com/v2/demo';
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const nonce = await provider.getTransactionCount(address);
      
      return nonce;
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      return 0;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
