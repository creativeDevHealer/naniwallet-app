import BackendOTPService from './backendOTPService';

export interface PaymentMethod {
  _id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'mobile_money' | 'crypto_wallet';
  name: string;
  cardLast4?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  mobileProvider?: 'mpesa' | 'orange_money' | 'airtel_money' | 'mtn_mobile_money';
  mobileNumber?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodData {
  userId: string;
  type: 'card' | 'bank_account' | 'mobile_money' | 'crypto_wallet';
  name: string;
  cardLast4?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  mobileProvider?: 'mpesa' | 'orange_money' | 'airtel_money' | 'mtn_mobile_money';
  mobileNumber?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
}

class PaymentMethodService {
  private static instance: PaymentMethodService;
  private backendService: BackendOTPService;

  private constructor() {
    this.backendService = BackendOTPService.getInstance();
  }

  public static getInstance(): PaymentMethodService {
    if (!PaymentMethodService.instance) {
      PaymentMethodService.instance = new PaymentMethodService();
    }
    return PaymentMethodService.instance;
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/payment-methods/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment methods');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(paymentMethodData: PaymentMethodData): Promise<PaymentMethod> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/payment-methods`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentMethodData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add payment method');
      }

      return result.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    updateData: Partial<PaymentMethodData>
  ): Promise<PaymentMethod> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/payment-methods/${paymentMethodId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update payment method');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/payment-methods/${paymentMethodId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Verify a payment method
   */
  async verifyPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await fetch(
        `${this.backendService.getConfig().baseUrl}/payment-methods/${paymentMethodId}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify payment method');
      }

      return result.data;
    } catch (error) {
      console.error('Error verifying payment method:', error);
      throw error;
    }
  }

  /**
   * Format payment method for display
   */
  formatPaymentMethod(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        return `${paymentMethod.cardBrand?.toUpperCase()} •••• ${paymentMethod.cardLast4}`;
      case 'bank_account':
        return `${paymentMethod.bankName} •••• ${paymentMethod.accountNumber?.slice(-4)}`;
      case 'mobile_money':
        return `${paymentMethod.mobileProvider} •••• ${paymentMethod.mobileNumber?.slice(-4)}`;
      case 'crypto_wallet':
        return `${paymentMethod.cryptoNetwork} •••• ${paymentMethod.cryptoAddress?.slice(-6)}`;
      default:
        return paymentMethod.name;
    }
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        return 'credit-card';
      case 'bank_account':
        return 'bank';
      case 'mobile_money':
        return 'smartphone';
      case 'crypto_wallet':
        return 'wallet';
      default:
        return 'payment';
    }
  }
}

export default PaymentMethodService;
