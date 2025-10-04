import { Platform } from 'react-native';

/**
 * Backend Transaction Service
 * 
 * Handles all transaction-related API calls to the backend
 */

interface BackendConfig {
  baseUrl: string;
  apiKey?: string;
}

interface Transaction {
  _id: string;
  ethaddress: string;
  timestamp: string;
  txHash: string;
  toAddress: string;
  amountUSD: number;
  type: 'send' | 'receive' | 'top_up' | 'swap' | 'transfer';
  token: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  userId?: string;
  // Legacy fields for backward compatibility
  amount?: string;
  currency?: string;
  tokenAddress?: string;
  recipientAddress?: string;
  senderAddress?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  chainId?: number;
  paymentMethod?: string;
  purpose?: string;
  kycVerified?: boolean;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
}

interface TransactionResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
  error?: string;
}

interface StoreTransactionRequest {
  ethaddress: string;
  txHash: string;
  toAddress: string;
  amountUSD: number;
  type: 'send' | 'receive' | 'top_up' | 'swap' | 'transfer';
  token: string;
  network: string;
  status?: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  timestamp?: string;
  userId?: string;
  // Optional fields for backward compatibility
  amount?: string;
  currency?: string;
  tokenAddress?: string;
  recipientAddress?: string;
  senderAddress?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  chainId?: number;
  paymentMethod?: string;
  purpose?: string;
  kycVerified?: boolean;
  metadata?: any;
}

interface StoreTransactionResponse {
  success: boolean;
  data: Transaction;
  error?: string;
}

class BackendTransactionService {
  private static instance: BackendTransactionService;
  private config: BackendConfig;

  private constructor() {
    // Configure your backend URL here
    // For Android emulator: use 10.0.2.2 instead of localhost
    // For iOS simulator: use localhost (works or your computer's IP
    // For physical device: use your computer's IP address (e.g., 192.168.1.100)
    
    let baseUrl = 'https://antihuman-harvey-cupulate.ngrok-free.app/api';
    
    if (Platform.OS === 'android') {
      // Android emulator maps 10.0.2.2 to the host machine's localhost
      baseUrl = 'https://antihuman-harvey-cupulate.ngrok-free.app/api';
    }
    
    this.config = {
      baseUrl,
    };
    
    console.log(`🔧 Backend Transaction Service configured for ${Platform.OS}:`, baseUrl);
  }

  public static getInstance(): BackendTransactionService {
    if (!BackendTransactionService.instance) {
      BackendTransactionService.instance = new BackendTransactionService();
    }
    return BackendTransactionService.instance;
  }

  /**
   * Get backend configuration
   */
  public getConfig(): BackendConfig {
    return this.config;
  }

  /**
   * Set custom backend URL (for physical devices)
   */
  public setDeviceUrl(url: string): void {
    this.config.baseUrl = url;
    console.log('🔧 Backend URL updated to:', url);
  }

  /**
   * Fetch with timeout utility
   */
  private async fetchWithTimeout(url: string, options?: any, timeoutMs: number = 15000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      return resp;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Get transactions by ETH address
   */
  async getTransactionsByEthAddress(
    ethaddress: string,
    soladdress: string,
    options: {
      page?: number;
      limit?: number;
      type?: 'send' | 'receive' | 'top_up' | 'swap' | 'transfer';
      status?: 'pending' | 'confirmed' | 'failed' | 'cancelled';
      token?: string;
      network?: string;
    } = {}
  ): Promise<TransactionResponse> {
    try {
      const { page = 1, limit = 20, type, status, token, network } = options;
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      if (token) params.append('token', token);
      if (network) params.append('network', network);
      if (soladdress) params.append('soladdress', soladdress);

      const url = `${this.config.baseUrl}/transaction/eth/${ethaddress}?${params.toString()}`;
      
      console.log('📡 Fetching transactions for ETH address:', ethaddress);
      console.log('📡 Fetching transactions for SOL address:', soladdress);
      console.log('📡 Request URL:', url);

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
      }, 15000);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      let result: TransactionResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('❌ Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching transactions by ETH address:', error);
      return {
        success: false,
        data: {
          transactions: [],
          pagination: {
            current: 1,
            pages: 0,
            total: 0,
          },
        },
        error: error.message || 'Failed to fetch transactions',
      };
    }
  }

  /**
   * Update transaction by hash
   */
  async updateTransactionByHash(txHash: string, updateData: Partial<Transaction>): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      const url = `${this.config.baseUrl}/transaction/hash/${txHash}`;
      
      console.log('📡 Updating transaction by hash:', txHash);
      console.log('📡 Request URL:', url);

      const response = await this.fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(updateData),
      }, 15000);

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      let result: { success: boolean; data: Transaction; error?: string };
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('❌ Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update transaction');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error updating transaction by hash:', error);
      return {
        success: false,
        error: error.message || 'Failed to update transaction',
      };
    }
  }

  /**
   * Store transaction history
   */
  async storeTransactionHistory(transactionData: StoreTransactionRequest): Promise<StoreTransactionResponse> {
    try {
      const url = `${this.config.baseUrl}/transaction/store`;
      
      console.log('📡 Storing transaction history:', transactionData);
      console.log('📡 Request URL:', url);

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        body: JSON.stringify(transactionData),
      }, 15000);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      let result: StoreTransactionResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('❌ Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to store transaction');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error storing transaction history:', error);
      return {
        success: false,
        data: {} as Transaction,
        error: error.message || 'Failed to store transaction',
      };
    }
  }
}

export default BackendTransactionService;
export type { Transaction, TransactionResponse, StoreTransactionRequest, StoreTransactionResponse };
