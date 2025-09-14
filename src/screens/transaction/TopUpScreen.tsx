import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';
import PaymentMethodService, { PaymentMethod } from '../../services/paymentMethodService';
import TransactionService, { TransactionData } from '../../services/transactionService';
import SecurityService from '../../services/securityService';

interface TopUpScreenProps {
  navigation: any;
}

export const TopUpScreen: React.FC<TopUpScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { activeWallet } = useWeb3Auth();
  const { locale } = useLocale();
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const paymentMethodService = PaymentMethodService.getInstance();
  const transactionService = TransactionService.getInstance();
  const securityService = SecurityService.getInstance();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      if (user?.uid) {
        const methods = await paymentMethodService.getPaymentMethods(user.uid);
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleTopUp = async () => {
    try {
      if (!selectedPaymentMethod) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      // Show security confirmation
      const confirmed = await securityService.showSecurityConfirmation(
        'Confirm Top-up',
        `Are you sure you want to top up ${amount} ETH using ${paymentMethodService.formatPaymentMethod(selectedPaymentMethod)}?`,
        amountNum
      );

      if (!confirmed) {
        return;
      }

      // Authenticate transaction
      const authenticated = await securityService.authenticateTransaction(amountNum, {
        requireBiometric: amountNum > 100,
        requirePIN: true,
        transactionLimit: 100,
        sessionTimeout: 300,
      });

      if (!authenticated) {
        Alert.alert('Authentication Failed', 'Please try again.');
        return;
      }

      setLoading(true);

      // Create transaction record
      const transactionData: TransactionData = {
        userId: user?.uid || '',
        walletId: activeWallet?.id || '',
        type: 'top_up',
        amount,
        currency: 'ETH',
        network: 'ethereum',
        chainId: 1,
        paymentMethod: selectedPaymentMethod.type,
        purpose: 'Wallet top-up',
      };

      const transaction = await transactionService.createTransaction(transactionData);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction status
      await transactionService.updateTransactionStatus(
        transaction._id,
        'confirmed',
        '0x' + Math.random().toString(16).substr(2, 64),
        12345678,
        '21000',
        '20000000000'
      );

      Alert.alert(
        'Top-up Successful',
        `Your wallet has been topped up with ${amount} ETH successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error processing top-up:', error);
      Alert.alert('Error', 'Failed to process top-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethodCard,
        selectedPaymentMethod?._id === item._id && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedPaymentMethod(item)}
    >
      <View style={styles.paymentMethodInfo}>
        <Text style={styles.paymentMethodName}>{item.name}</Text>
        <Text style={styles.paymentMethodDetails}>
          {paymentMethodService.formatPaymentMethod(item)}
        </Text>
      </View>
      <View style={styles.radioButton}>
        {selectedPaymentMethod?._id === item._id && (
          <View style={styles.radioButtonSelected} />
        )}
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    amountCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    amountLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 12,
    },
    amountInput: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 18,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    paymentMethodsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    paymentMethodCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedPaymentMethod: {
      borderColor: theme.colors.primary,
    },
    paymentMethodInfo: {
      flex: 1,
    },
    paymentMethodName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    paymentMethodDetails: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    addPaymentMethodButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    addPaymentMethodText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    topUpButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    topUpButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
    },
    topUpButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.headerTitle, { fontSize: 24 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('top_up', locale)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t('amount', locale)}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <Text style={styles.paymentMethodsTitle}>{t('payment_methods', locale)}</Text>

        {loadingMethods ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {t('no_payment_methods', locale)}
              </Text>
            <TouchableOpacity
              style={styles.addPaymentMethodButton}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={styles.addPaymentMethodText}>
                {t('add_payment_method', locale)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
            <TouchableOpacity
              style={styles.addPaymentMethodButton}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={styles.addPaymentMethodText}>
                {t('add_new_payment_method', locale)}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.topUpButton,
            (!amount || !selectedPaymentMethod || loading) && styles.topUpButtonDisabled,
          ]}
          onPress={handleTopUp}
          disabled={!amount || !selectedPaymentMethod || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.loadingText}>{t('processing', locale)}...</Text>
            </View>
          ) : (
            <Text style={styles.topUpButtonText}>{t('top_up', locale)}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
