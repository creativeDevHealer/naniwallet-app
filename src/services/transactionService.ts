import BackendOTPService from './backendOTPService';

export interface TransactionData {
  userId: string;
  walletId: string;
  type: 'send' | 'receive' | 'top_up' | 'swap';
  amount: string;
  currency: string;
  tokenAddress?: string;
  recipientAddress?: string;
  senderAddress?: string;
  network: string;
  chainId: number;
  paymentMethod?: string;
  purpose?: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  walletId: string;
  type: 'send' | 'receive' | 'top_up' | 'swap';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  amount: string;
  currency: string;
  tokenAddress?: string;
  recipientAddress?: string;
  senderAddress?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  network: string;
  chainId: number;
  paymentMethod?: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

export interface TransactionStats {
  _id: string;
  count: number;
  totalAmount: number;
}

class TransactionService {
  private static instance: TransactionService;
  private backendService: BackendOTPService;

  private constructor() {
    this.backendService = BackendOTPService.getInstance();
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
    } = {}
  ): Promise<{ transactions: Transaction[]; pagination: any }> {
    try {
      const { page = 1, limit = 20, type, status } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(status && { status }),
      });

      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/history/${userId}?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transaction history');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transaction');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transactionData: TransactionData): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create transaction');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    txHash?: string,
    blockNumber?: number,
    gasUsed?: string,
    gasPrice?: string
  ): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/${transactionId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            txHash,
            blockNumber,
            gasUsed,
            gasPrice,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update transaction status');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    to: string,
    value: string,
    data?: string,
    network: string = 'ethereum'
  ): Promise<GasEstimate> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/estimate-gas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to,
            value,
            data,
            network,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to estimate gas');
      }

      return result.data;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(transactionId: string, txHash: string): Promise<Transaction> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/broadcast`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId,
            txHash,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to broadcast transaction');
      }

      return result.data;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(
    userId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<TransactionStats[]> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/transactions/stats/${userId}?period=${period}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transaction statistics');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
}

export default TransactionService;
