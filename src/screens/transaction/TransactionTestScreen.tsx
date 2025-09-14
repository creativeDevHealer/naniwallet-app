import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import TransactionService from '../../services/transactionService';
import PaymentMethodService from '../../services/paymentMethodService';
import SecurityService from '../../services/securityService';

interface TransactionTestScreenProps {
  navigation: any;
}

export const TransactionTestScreen: React.FC<TransactionTestScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { activeWallet } = useWeb3Auth();
  const [loading, setLoading] = useState(false);

  const transactionService = TransactionService.getInstance();
  const paymentMethodService = PaymentMethodService.getInstance();
  const securityService = SecurityService.getInstance();

  const testTransactionService = async () => {
    try {
      setLoading(true);
      
      // Test creating a transaction
      const transaction = await transactionService.createTransaction({
        userId: user?.uid || 'test-user',
        walletId: activeWallet?.id || 'test-wallet',
        type: 'send',
        amount: '0.1',
        currency: 'ETH',
        recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        senderAddress: activeWallet?.address || '0x123...',
        network: 'ethereum',
        chainId: 1,
        purpose: 'Test transaction',
      });

      Alert.alert('Success', `Transaction created: ${transaction._id}`);
    } catch (error) {
      Alert.alert('Error', `Failed to create transaction: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentMethodService = async () => {
    try {
      setLoading(true);
      
      // Test adding a payment method
      const paymentMethod = await paymentMethodService.addPaymentMethod({
        userId: user?.uid || 'test-user',
        type: 'card',
        name: 'Test Card',
        cardLast4: '1234',
        cardBrand: 'visa',
        cardExpiryMonth: 12,
        cardExpiryYear: 2025,
      });

      Alert.alert('Success', `Payment method added: ${paymentMethod._id}`);
    } catch (error) {
      Alert.alert('Error', `Failed to add payment method: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSecurityService = async () => {
    try {
      setLoading(true);
      
      // Test biometric availability
      const isAvailable = await securityService.isBiometricAvailable();
      
      // Test transaction authentication
      const authenticated = await securityService.authenticateTransaction(50, {
        requireBiometric: false,
        requirePIN: true,
        transactionLimit: 100,
        sessionTimeout: 300,
      });

      Alert.alert('Security Test', `Biometric available: ${isAvailable}, Authenticated: ${authenticated}`);
    } catch (error) {
      Alert.alert('Error', `Security test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginBottom: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    info: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 20,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Services Test</Text>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>User: {user?.email || 'Not logged in'}</Text>
        <Text style={styles.infoText}>Wallet: {activeWallet?.address || 'No wallet'}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={testTransactionService}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Transaction Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testPaymentMethodService}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Payment Method Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testSecurityService}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Security Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.secondary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};
