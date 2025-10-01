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
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  // Solana devnet RPC endpoints (ordered by perceived reliability)
  private readonly DEVNET_RPC_URLS = [
    'https://api.devnet.solana.com', // Official Solana devnet
    'https://devnet.helius-rpc.com', // Helius RPC
    'https://rpc-devnet.helius.xyz', // Alternative Helius
    'https://solana-devnet.g.alchemy.com/v2/demo', // Alchemy
  ];

  // Mainnet RPC endpoints
  private readonly MAINNET_RPC_URLS = [
    'https://api.mainnet-beta.solana.com', // Official Solana mainnet
    'https://solana-mainnet.g.alchemy.com/v2/demo', // Alchemy
    'https://rpc.helius.xyz', // Helius mainnet
  ];

  static getInstance(): SOLBalanceService {
    if (!SOLBalanceService.instance) {
      SOLBalanceService.instance = new SOLBalanceService();
    }
    return SOLBalanceService.instance;
  }

  clearCache(): void {
    this.cache.clear();
  }

  async getSOLBalance(address: string, network: 'devnet' | 'mainnet-beta' = 'devnet'): Promise<SOLBalanceInfo> {
    const cacheKey = `${address}:${network}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
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
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (response.status === 429) {
          console.warn(`⚠️ ${rpcUrl} rate limited (429). Waiting 1s before next attempt.`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          lastError = new Error(`HTTP 429: ${response.statusText}`);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
        console.warn(`❌ Failed to fetch from ${rpcUrl}:`, error.message || error);
        lastError = error;
        if (i === rpcUrls.length - 1) {
          console.error(`💥 All Solana ${network} RPC endpoints failed for address: ${address}`);
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
      console.error(`💥 All SOL providers failed for ${address}. Returning zero balance. Last error:`, lastError);
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
}
