import { Platform, Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

export interface SecurityConfig {
  requireBiometric: boolean;
  requirePIN: boolean;
  transactionLimit: number;
  sessionTimeout: number;
}

class SecurityService {
  private static instance: SecurityService;
  private rnBiometrics: ReactNativeBiometrics;
  private biometricAvailable: boolean = false;
  private isBiometricEnabled: boolean = false;

  private constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    this.initializeBiometrics();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize biometric authentication
   */
  private async initializeBiometrics(): Promise<void> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      this.biometricAvailable = available;
      
      if (available) {
        console.log('🔐 Biometric sensor available:', biometryType);
      } else {
        console.log('❌ Biometric sensor not available');
      }
    } catch (error) {
      console.error('Error initializing biometrics:', error);
      this.biometricAvailable = false;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    return this.biometricAvailable;
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<boolean> {
    try {
      if (!this.biometricAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const result = await this.rnBiometrics.createKeys();
      if (result.publicKey) {
        this.isBiometricEnabled = true;
        console.log('✅ Biometric authentication enabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<boolean> {
    try {
      const result = await this.rnBiometrics.deleteKeys();
      if (result.keysDeleted) {
        this.isBiometricEnabled = false;
        console.log('✅ Biometric authentication disabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
      return false;
    }
  }

  /**
   * Authenticate with biometric
   */
  async authenticateWithBiometric(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      if (!this.biometricAvailable || !this.isBiometricEnabled) {
        return false;
      }

      const result = await this.rnBiometrics.biometricKeysExist();
      if (!result.keysExist) {
        // Keys don't exist, create them
        await this.enableBiometric();
      }

      const { success: authSuccess } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload: 'transaction_auth',
      });

      return authSuccess;
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      return false;
    }
  }

  /**
   * Show PIN input dialog
   */
  async authenticateWithPIN(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.prompt(
        'Enter PIN',
        'Please enter your 6-digit PIN to continue',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Confirm',
            onPress: (pin?: string) => {
              // In a real app, you'd validate the PIN against stored hash
              if (pin && pin.length === 6) {
                resolve(true);
              } else {
                resolve(false);
              }
            },
          },
        ],
        'secure-text'
      );
    });
  }

  /**
   * Authenticate transaction based on amount and security settings
   */
  async authenticateTransaction(
    amount: number,
    securityConfig: SecurityConfig
  ): Promise<boolean> {
    try {
      // Check if transaction requires biometric authentication
      if (amount >= securityConfig.transactionLimit && securityConfig.requireBiometric) {
        const biometricAuth = await this.authenticateWithBiometric(
          `Authenticate to send ${amount} ${securityConfig.requirePIN ? 'and enter PIN' : ''}`
        );
        
        if (!biometricAuth) {
          return false;
        }
      }

      // Check if transaction requires PIN
      if (securityConfig.requirePIN) {
        const pinAuth = await this.authenticateWithPIN();
        if (!pinAuth) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error authenticating transaction:', error);
      return false;
    }
  }

  /**
   * Show security confirmation dialog
   */
  async showSecurityConfirmation(
    title: string,
    message: string,
    amount?: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const fullMessage = amount 
        ? `${message}\n\nAmount: ${amount}`
        : message;

      Alert.alert(
        title,
        fullMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Validate transaction data
   */
  validateTransactionData(data: {
    amount: string;
    recipientAddress: string;
    currency: string;
  }): { isValid: boolean; error?: string } {
    // Validate amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: 'Invalid amount' };
    }

    // Validate recipient address
    if (!data.recipientAddress || data.recipientAddress.length < 20) {
      return { isValid: false, error: 'Invalid recipient address' };
    }

    // Validate currency
    if (!data.currency || data.currency.length < 2) {
      return { isValid: false, error: 'Invalid currency' };
    }

    return { isValid: true };
  }

  /**
   * Get security recommendations
   */
  getSecurityRecommendations(amount: number): string[] {
    const recommendations: string[] = [];

    if (amount > 1000) {
      recommendations.push('Consider using biometric authentication for large transactions');
    }

    if (amount > 100) {
      recommendations.push('Enable PIN verification for transactions over $100');
    }

    recommendations.push('Always verify recipient address before sending');
    recommendations.push('Keep your device secure and up to date');

    return recommendations;
  }
}

export default SecurityService;
