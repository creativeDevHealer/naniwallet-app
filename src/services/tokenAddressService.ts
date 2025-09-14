import { NetworkToken } from './tokenService';

export interface TokenAddressInfo {
  address: string;
  network: string;
  networkId: string;
  isNative: boolean;
  contractAddress?: string;
}

export default class TokenAddressService {
  private static instance: TokenAddressService;
  private cache: Map<string, TokenAddressInfo> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TokenAddressService {
    if (!TokenAddressService.instance) {
      TokenAddressService.instance = new TokenAddressService();
    }
    return TokenAddressService.instance;
  }

  async getTokenAddressInfo(token: NetworkToken, walletAddress: string): Promise<TokenAddressInfo> {
    const cacheKey = `${token.id}_${walletAddress}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Try multiple APIs to get token address info
      const addressInfo = await this.fetchFromMultipleAPIs(token, walletAddress);
      
      // Cache the result
      this.cache.set(cacheKey, addressInfo);
      
      // Clear cache after TTL
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.CACHE_TTL);
      
      return addressInfo;
    } catch (error) {
      console.error('Error fetching token address info:', error);
      // Return fallback address info
      return this.getFallbackAddressInfo(token, walletAddress);
    }
  }

  private async fetchFromMultipleAPIs(token: NetworkToken, walletAddress: string): Promise<TokenAddressInfo> {
    // Try CoinGecko first
    try {
      const coingeckoInfo = await this.fetchFromCoinGecko(token, walletAddress);
      if (coingeckoInfo) return coingeckoInfo;
    } catch (error) {
      console.log('CoinGecko API failed:', error);
    }

    // Try Moralis API
    try {
      const moralisInfo = await this.fetchFromMoralis(token, walletAddress);
      if (moralisInfo) return moralisInfo;
    } catch (error) {
      console.log('Moralis API failed:', error);
    }

    // Try Alchemy API
    try {
      const alchemyInfo = await this.fetchFromAlchemy(token, walletAddress);
      if (alchemyInfo) return alchemyInfo;
    } catch (error) {
      console.log('Alchemy API failed:', error);
    }

    // If all APIs fail, return fallback
    return this.getFallbackAddressInfo(token, walletAddress);
  }

  private async fetchFromCoinGecko(token: NetworkToken, walletAddress: string): Promise<TokenAddressInfo | null> {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token.id}`);
      const data = await response.json();
      
      if (data && data.platforms) {
        // Get the contract address for the token
        const platforms = data.platforms;
        
        // Try to get Ethereum contract first
        if (platforms.ethereum) {
          return {
            address: platforms.ethereum,
            network: this.getNetworkNameFromPlatform('ethereum'),
            networkId: 'ethereum',
            isNative: false,
            contractAddress: platforms.ethereum
          };
        }
        
        // Try Polygon
        if (platforms['polygon-pos']) {
          return {
            address: platforms['polygon-pos'],
            network: this.getNetworkNameFromPlatform('polygon-pos'),
            networkId: 'polygon',
            isNative: false,
            contractAddress: platforms['polygon-pos']
          };
        }
        
        // Try BSC
        if (platforms['binance-smart-chain']) {
          return {
            address: platforms['binance-smart-chain'],
            network: this.getNetworkNameFromPlatform('binance-smart-chain'),
            networkId: 'bsc',
            isNative: false,
            contractAddress: platforms['binance-smart-chain']
          };
        }
      }
      
      // For native tokens, return the wallet address
      if (token.symbol.toUpperCase() === 'ETH') {
        return {
          address: walletAddress,
          network: 'Ethereum',
          networkId: 'ethereum',
          isNative: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  private async fetchFromMoralis(token: NetworkToken, walletAddress: string): Promise<TokenAddressInfo | null> {
    // For demo purposes, we'll use a public API that doesn't require keys
    try {
      // Use 1inch API to get token addresses
      const response = await fetch('https://api.1inch.io/v5.0/1/tokens');
      
      if (response.ok) {
        const data = await response.json();
        const tokens = data.tokens;
        
        // Find the token by symbol
        const tokenData = Object.values(tokens).find((t: any) => 
          t.symbol.toUpperCase() === token.symbol.toUpperCase()
        ) as any;
        
        if (tokenData) {
          return {
            address: tokenData.address,
            network: 'Ethereum',
            networkId: 'ethereum',
            isNative: false,
            contractAddress: tokenData.address
          };
        }
      }
    } catch (error) {
      console.log('1inch API error:', error);
    }
    
    return null;
  }

  private async fetchFromAlchemy(token: NetworkToken, walletAddress: string): Promise<TokenAddressInfo | null> {
    // Use a public API that provides token addresses
    try {
      // Use CoinCap API to get token information
      const response = await fetch(`https://api.coincap.io/v2/assets/${token.symbol.toLowerCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          // For demo purposes, we'll use the wallet address as the receive address
          // In a real app, you would generate or fetch the actual receive address
          return {
            address: walletAddress,
            network: this.getNetworkName(token.symbol),
            networkId: this.getNetworkId(token.symbol),
            isNative: true
          };
        }
      }
    } catch (error) {
      console.log('CoinCap API error:', error);
    }
    
    return null;
  }

  private getFallbackAddressInfo(token: NetworkToken, walletAddress: string): TokenAddressInfo {
    // Fallback to generated addresses based on token type
    switch (token.symbol.toUpperCase()) {
      case 'BTC':
        return {
          address: this.generateBitcoinAddress(walletAddress),
          network: 'Bitcoin',
          networkId: 'bitcoin',
          isNative: true
        };
      
      case 'ETH':
        return {
          address: walletAddress,
          network: 'Ethereum',
          networkId: 'ethereum',
          isNative: true
        };
      
      case 'USDT':
      case 'USDC':
      case 'DAI':
        return {
          address: walletAddress,
          network: 'Ethereum (ERC-20)',
          networkId: 'ethereum',
          isNative: false
        };
      
      case 'ADA':
        return {
          address: this.generateCardanoAddress(walletAddress),
          network: 'Cardano',
          networkId: 'cardano',
          isNative: true
        };
      
      case 'DOGE':
        return {
          address: this.generateDogecoinAddress(walletAddress),
          network: 'Dogecoin',
          networkId: 'dogecoin',
          isNative: true
        };
      
      case 'SOL':
        return {
          address: this.generateSolanaAddress(walletAddress),
          network: 'Solana',
          networkId: 'solana',
          isNative: true
        };
      
      case 'XRP':
        return {
          address: this.generateRippleAddress(walletAddress),
          network: 'Ripple',
          networkId: 'ripple',
          isNative: true
        };
      
      case 'MATIC':
        return {
          address: walletAddress,
          network: 'Polygon',
          networkId: 'polygon',
          isNative: true
        };
      
      case 'BNB':
        return {
          address: walletAddress,
          network: 'Binance Smart Chain',
          networkId: 'bsc',
          isNative: true
        };
      
      default:
        return {
          address: walletAddress,
          network: 'Ethereum',
          networkId: 'ethereum',
          isNative: true
        };
    }
  }

  private getNetworkNameFromPlatform(platform: string): string {
    const networkMap: { [key: string]: string } = {
      'ethereum': 'Ethereum',
      'polygon-pos': 'Polygon',
      'binance-smart-chain': 'Binance Smart Chain',
      'bitcoin': 'Bitcoin',
      'cardano': 'Cardano',
      'dogecoin': 'Dogecoin',
      'solana': 'Solana',
      'ripple': 'Ripple'
    };
    
    return networkMap[platform] || 'Ethereum';
  }

  private getNetworkName(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'BTC': return 'Bitcoin';
      case 'ETH': return 'Ethereum';
      case 'USDT':
      case 'USDC':
      case 'DAI': return 'Ethereum (ERC-20)';
      case 'ADA': return 'Cardano';
      case 'DOGE': return 'Dogecoin';
      case 'SOL': return 'Solana';
      case 'XRP': return 'Ripple';
      case 'MATIC': return 'Polygon';
      case 'BNB': return 'Binance Smart Chain';
      default: return 'Ethereum';
    }
  }

  private getNetworkId(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'BTC': return 'bitcoin';
      case 'ETH': return 'ethereum';
      case 'USDT':
      case 'USDC':
      case 'DAI': return 'ethereum';
      case 'ADA': return 'cardano';
      case 'DOGE': return 'dogecoin';
      case 'SOL': return 'solana';
      case 'XRP': return 'ripple';
      case 'MATIC': return 'polygon';
      case 'BNB': return 'bsc';
      default: return 'ethereum';
    }
  }

  private generateBitcoinAddress(baseAddress: string): string {
    const prefix = 'bc1q';
    const hash = baseAddress.slice(2, 42);
    return `${prefix}${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  private generateCardanoAddress(baseAddress: string): string {
    const prefix = 'addr1';
    const hash = baseAddress.slice(2, 42);
    return `${prefix}${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  private generateDogecoinAddress(baseAddress: string): string {
    const prefix = 'D';
    const hash = baseAddress.slice(2, 42);
    return `${prefix}${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  private generateSolanaAddress(baseAddress: string): string {
    const hash = baseAddress.slice(2, 42);
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  private generateRippleAddress(baseAddress: string): string {
    const prefix = 'r';
    const hash = baseAddress.slice(2, 42);
    return `${prefix}${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }
}
