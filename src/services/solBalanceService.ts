import { NetworkToken } from './tokenService';

export interface SOLBalanceInfo {
  balance: number; // in SOL
  balanceLamports: string;
  address: string;
  network: 'devnet' | 'mainnet-beta';
}

export default class SOLBalanceService {
  private static instance: SOLBalanceService;
  private cache: Map<string, { info: SOLBalanceInfo; ts: number }> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds for balance data
  private readonly REQUEST_TIMEOUT = 8000; // 8 seconds

  // Solana devnet RPC endpoints (ordered by reliability and accessibility)
  private readonly DEVNET_RPC_URLS = [
    'https://api.devnet.solana.com', // Official Solana devnet (most reliable)
    'https://rpc.ankr.com/solana_devnet', // Ankr (free tier, very reliable)
    'https://devnet.genesysgo.com', // GenesysGo devnet (free tier)
  ];

  // Mainnet RPC endpoints
  private readonly MAINNET_RPC_URLS = [
    'https://api.mainnet-beta.solana.com', // Official Solana mainnet
    'https://rpc.ankr.com/solana', // Ankr mainnet
    'https://rpc.helius.xyz', // Helius (requires API key)
  ];

  static getInstance(): SOLBalanceService {
    if (!SOLBalanceService.instance) {
      SOLBalanceService.instance = new SOLBalanceService();
    }
    return SOLBalanceService.instance;
  }

  async getBalance(address: string, network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<SOLBalanceInfo> {
    const cacheKey = `${address}-${network}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if it's still valid
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
      console.info(`📋 Using cached SOL balance for ${address}: ${cached.info.balance} SOL`);
      return cached.info;
    }

    let balanceInfo: SOLBalanceInfo | undefined;
    let lastError: any;

    const rpcUrls = network === 'devnet' ? this.DEVNET_RPC_URLS : this.MAINNET_RPC_URLS;

    for (let i = 0; i < rpcUrls.length; i++) {
      const rpcUrl = rpcUrls[i];
      
      try {
        console.info(`🔄 Trying Solana ${network} RPC ${i + 1}/${rpcUrls.length}: ${rpcUrl}`);
        
        // Create RPC request
        const requestBody = {
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'NaniWallet/1.0',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (response.status === 401) {
          console.warn(`⚠️ ${rpcUrl} unauthorized (401). Skipping to next provider.`);
          lastError = new Error(`HTTP 401: Unauthorized - API key required`);
          continue;
        }

        if (response.status === 429) {
          console.warn(`⚠️ ${rpcUrl} rate limited (429). Waiting 2s before next attempt.`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          lastError = new Error(`HTTP 429: Rate limited`);
          continue;
        }

        if (!response.ok) {
          console.warn(`⚠️ ${rpcUrl} failed with status ${response.status}. Trying next provider.`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(`RPC Error: ${data.error.message}`);
        }

        if (data.result && typeof data.result.value === 'number') {
          const balanceLamports = data.result.value;
          const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL (1 SOL = 1e9 lamports)

          console.info(`✅ Solana ${network} balance fetched: ${balanceSol} SOL (${balanceLamports} lamports) for ${address}`);
          
          balanceInfo = {
            balance: balanceSol,
            balanceLamports: balanceLamports.toString(),
            address: address,
            network: network
          };
          break;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error: any) {
        const errorMsg = error.message || error;
        console.warn(`❌ Failed to fetch from ${rpcUrl}:`, errorMsg);
        lastError = error;
        
        // Handle specific error types
        if (errorMsg.includes('Abort')) {
          console.warn(`⏰ ${rpcUrl} timed out. Trying next provider.`);
        } else if (errorMsg.includes('Network request failed')) {
          console.warn(`🌐 ${rpcUrl} network error. Trying next provider.`);
          await new Promise(resolve => setTimeout(resolve, 500));
        } else if (errorMsg.includes('401')) {
          console.warn(`🔑 ${rpcUrl} requires API key. Trying next provider.`);
        } else if (errorMsg.includes('fetch')) {
          console.warn(`🌐 ${rpcUrl} fetch error. Trying next provider.`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (i === rpcUrls.length - 1) {
          console.error(`💥 All Solana ${network} RPC endpoints failed for address: ${address}`);
          console.error(`💥 Last error: ${errorMsg}`);
        }
      }
    }

    if (balanceInfo) {
      this.cache.set(cacheKey, { info: balanceInfo, ts: Date.now() });
      return balanceInfo;
    } else if (cached) {
      console.warn(`⚠️ All SOL providers failed, returning cached value for ${address}.`);
      return cached.info;
    } else {
      console.error(`💥 All SOL providers failed for ${address}. Last error:`, lastError);
      
      // Try one more time with a simple direct approach
      try {
        console.info(`🔄 Final attempt with direct Solana RPC call...`);
        const directResponse = await fetch('https://api.devnet.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address]
          }),
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.result && typeof directData.result.value === 'number') {
            const balanceLamports = directData.result.value;
            const balanceSol = balanceLamports / 1e9;
            
            console.info(`✅ Direct SOL balance fetched: ${balanceSol} SOL`);
            const directBalance: SOLBalanceInfo = {
              balance: balanceSol,
              balanceLamports: balanceLamports.toString(),
              address: address,
              network: network
            };
            this.cache.set(cacheKey, { info: directBalance, ts: Date.now() });
            return directBalance;
          }
        }
      } catch (directError) {
        console.warn(`⚠️ Direct RPC call also failed:`, directError);
      }
      
      // Return zero balance as final fallback
      console.warn(`⚠️ All SOL balance attempts failed. Returning zero balance.`);
      return {
        balance: 0,
        balanceLamports: '0',
        address,
        network: network
      };
    }
  }

  async getAccountInfo(address: string, network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<any> {
    try {
      const rpcUrl = network === 'devnet' ? this.DEVNET_RPC_URLS[0] : this.MAINNET_RPC_URLS[0];
      
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address, { encoding: 'base64' }]
      };

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }

  async getRecentBlockhash(network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<string | null> {
    try {
      const rpcUrl = network === 'devnet' ? this.DEVNET_RPC_URLS[0] : this.MAINNET_RPC_URLS[0];
      
      const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: []
      };

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      return data.result?.value?.blockhash || null;
    } catch (error) {
      console.error('Error fetching recent blockhash:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}