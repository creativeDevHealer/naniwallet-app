import { NetworkToken } from './tokenService';

export interface BTCBalanceInfo {
  balance: number; // in BTC
  balanceSatoshis: number;
  address: string;
  network: 'mainnet' | 'testnet';
}

export default class BTCBalanceService {
  private static instance: BTCBalanceService;
  private cache: Map<string, { info: BTCBalanceInfo; ts: number }> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds for balance data

  static getInstance(): BTCBalanceService {
    if (!BTCBalanceService.instance) {
      BTCBalanceService.instance = new BTCBalanceService();
    }
    return BTCBalanceService.instance;
  }

  private async fetchWithTimeout(url: string, timeoutMs: number = 12000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // @ts-ignore fetch available in RN
      const resp = await fetch(url, { signal: controller.signal });
      return resp as unknown as Response;
    } finally {
      clearTimeout(timer);
    }
  }
  private async sleep(ms: number): Promise<void> { return new Promise(res => setTimeout(res, ms)); }

  /**
   * Get BTC balance for a given address on testnet or mainnet
   */
  async getBTCBalance(address: string, isTestnet: boolean = true): Promise<BTCBalanceInfo> {
    try {
      const network = isTestnet ? 'testnet' : 'mainnet';
      const cacheKey = `${address}:${network}`;

      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
        return cached.info;
      }

      let balanceInfo: BTCBalanceInfo;

      if (isTestnet) {
        // Use testnet API
        balanceInfo = await this.fetchTestnetBalance(address);
      } else {
        // Use mainnet API
        balanceInfo = await this.fetchMainnetBalance(address);
      }

      // Cache the result
      this.cache.set(cacheKey, { info: balanceInfo, ts: Date.now() });
      return balanceInfo;
    } catch (error) {
      console.warn('Error fetching BTC balance:', error);
      const network = isTestnet ? 'testnet' : 'mainnet';
      const cacheKey = `${address}:${network}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        // Serve last known value instead of zero if available
        return cached.info;
      }
      // Return zero balance on error as last resort
      return {
        balance: 0,
        balanceSatoshis: 0,
        address,
        network
      };
    }
  }

  /**
   * Fetch BTC balance from testnet API
   */
  private async fetchTestnetBalance(address: string): Promise<BTCBalanceInfo> {
    // Primary: BlockCypher
    try {
      const response = await this.fetchWithTimeout(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`, 7000);
      if (!response.ok) {
        // Handle rate limit gracefully
        if (response.status === 429) {
          console.warn('BlockCypher rate limited (429). Falling back to Blockstream.');
          await this.sleep(1000);
        } else {
          console.warn(`BlockCypher responded ${response.status}. Falling back.`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        balance: (data.balance || 0) / 100000000,
        balanceSatoshis: data.balance || 0,
        address,
        network: 'testnet'
      };
    } catch (primaryErr: any) {
      const msg = (primaryErr && (primaryErr.message || String(primaryErr))) || '';
      if (msg.includes('Abort')) {
        console.log('Testnet primary provider timed out; trying fallback...');
      } else {
        console.log('Testnet balance fetch failed (primary), trying fallback');
      }
      // Fallback: Blockstream
      try {
        const response = await this.fetchWithTimeout(`https://blockstream.info/testnet/api/address/${address}`, 12000);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const funded = Number(data.chain_stats?.funded_txo_sum || 0);
        const spent = Number(data.chain_stats?.spent_txo_sum || 0);
        const sats = Math.max(funded - spent, 0);
        return {
          balance: sats / 100000000,
          balanceSatoshis: sats,
          address,
          network: 'testnet'
        };
      } catch (fallbackError: any) {
        const fmsg = (fallbackError && (fallbackError.message || String(fallbackError))) || '';
        if (!fmsg.includes('Abort')) {
          console.log('Blockstream fallback failed; trying mempool.space');
        }
        // Second fallback: mempool.space testnet (compatible API)
        try {
          const response = await this.fetchWithTimeout(`https://mempool.space/testnet/api/address/${address}`, 12000);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          const funded = Number(data.chain_stats?.funded_txo_sum || 0);
          const spent = Number(data.chain_stats?.spent_txo_sum || 0);
          const sats = Math.max(funded - spent, 0);
          return {
            balance: sats / 100000000,
            balanceSatoshis: sats,
            address,
            network: 'testnet'
          };
        } catch (thirdErr) {
          console.log('All BTC testnet providers failed; returning cached/zero');
          // Gracefully return zero to avoid redbox
          return {
            balance: 0,
            balanceSatoshis: 0,
            address,
            network: 'testnet'
          };
        }
      }
    }
  }

  /**
   * Fetch BTC balance from mainnet API
   */
  private async fetchMainnetBalance(address: string): Promise<BTCBalanceInfo> {
    try {
      // Using BlockCypher API for mainnet
      const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        balance: data.balance / 100000000, // Convert satoshis to BTC
        balanceSatoshis: data.balance,
        address: address,
        network: 'mainnet'
      };
    } catch (error) {
      console.error('Mainnet balance fetch failed:', error);
      
      // Fallback to alternative mainnet API
      try {
        const response = await fetch(`https://blockstream.info/api/address/${address}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          balance: (data.chain_stats?.funded_txo_sum || 0) / 100000000 - (data.chain_stats?.spent_txo_sum || 0) / 100000000,
          balanceSatoshis: (data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0),
          address: address,
          network: 'mainnet'
        };
      } catch (fallbackError) {
        console.error('Fallback mainnet balance fetch failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Get balance for a specific token (BTC only)
   */
  async getTokenBalance(token: NetworkToken, address: string): Promise<number> {
    if (token.symbol.toUpperCase() !== 'BTC') {
      return 0;
    }

    try {
      const balanceInfo = await this.getBTCBalance(address, true); // Use testnet
      return balanceInfo.balance;
    } catch (error) {
      console.error('Error getting BTC token balance:', error);
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
