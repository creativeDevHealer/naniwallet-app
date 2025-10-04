import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWeb3Auth } from '../context/Web3AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NetworkToken } from '../services/tokenService';
import TransactionService from '../services/transactionService';
import TokenAddressService from '../services/tokenAddressService';
import BTCBalanceService from '../services/btcBalanceService';
import ETHBalanceService from '../services/ethBalanceService';
import SOLBalanceService from '../services/solBalanceService';
import BackendTransactionService from '../services/backendTransactionService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SendDialogProps {
  visible: boolean;
  token: NetworkToken | null;
  onClose: () => void;
}

export const SendDialog: React.FC<SendDialogProps> = ({ visible, token, onClose }) => {
  const { theme } = useTheme();
  const { activeWallet, wallet, wallets } = useWeb3Auth();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [imageError, setImageError] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (visible && token) {
      console.log('SendDialog: Token received:', token);
      loadTokenBalance();
      // Reset form when dialog opens
      setRecipientAddress('');
      setAmount('');
      setLoading(false);
      setImageError(false);
    }
  }, [visible, token]);

  const loadTokenBalance = async () => {
    if (!wallet || !token) return;
    
    try {
      setLoadingBalance(true);
      const symbol = token.symbol.toUpperCase();
      
      if (symbol === 'ETH') {
        const ethService = ETHBalanceService.getInstance();
        const balanceInfo = await ethService.getETHBalance(wallet.address, 'sepolia');
        setBalance(balanceInfo.balance.toFixed(6));
      } else if (symbol === 'BTC') {
        const addressService = TokenAddressService.getInstance();
        const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
        if (addressInfo?.address) {
          const btcService = BTCBalanceService.getInstance();
          const balanceInfo = await btcService.getBTCBalance(addressInfo.address, true);
          setBalance(balanceInfo.balance.toFixed(8));
        }
      } else if (symbol === 'SOL') {
        const addressService = TokenAddressService.getInstance();
        const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
        if (addressInfo?.address) {
          const solService = SOLBalanceService.getInstance();
          const balanceInfo = await solService.getSOLBalance(addressInfo.address, 'devnet');
          setBalance(balanceInfo.balance.toFixed(6));
        }
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
      setBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  const getTokenIconUrl = (idOrSymbol?: string | null) => {
    if (!idOrSymbol) return undefined;
    const key = String(idOrSymbol).toLowerCase();
    const map: Record<string, string> = {
      btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      sol: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    };
    return map[key];
  };

  const getTokenUSDPrice = (symbol: string): number => {
    // Rough USD prices for demo purposes - in production, you'd fetch real-time prices
    const prices: Record<string, number> = {
      'BTC': 65000,
      'ETH': 4000,
      'SOL': 200,
    };
    return prices[symbol.toUpperCase()] || 1;
  };

  const getNetworkName = (symbol: string): string => {
    const networks: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
    };
    return networks[symbol.toUpperCase()] || 'unknown';
  };

  const getTokenAddress = async (tokenSymbol: string): Promise<string> => {
    if (!wallet) return '';
    
    const symbol = tokenSymbol.toUpperCase();
    
    if (symbol === 'ETH') {
      return wallet.address; // ETH address is the main wallet address
    } else if (symbol === 'BTC') {
      // Get BTC address
      const addressService = TokenAddressService.getInstance();
      const addressInfo = await addressService.getTokenAddressInfo(
        { symbol: 'BTC', network: 'bitcoin' } as any, 
        wallet.mnemonic
      );
      return addressInfo?.address || '';
    } else if (symbol === 'SOL') {
      // Get SOL address
      const addressService = TokenAddressService.getInstance();
      const addressInfo = await addressService.getTokenAddressInfo(
        { symbol: 'SOL', network: 'solana' } as any, 
        wallet.mnemonic
      );
      return addressInfo?.address || '';
    }
    
    return wallet.address; // Fallback to ETH address
  };

  const storeTransactionHistory = async (transactionData: any) => {

    console.log(transactionData);
    const backendService = BackendTransactionService.getInstance();
    const result = await backendService.storeTransactionHistory(transactionData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to store transaction history');
    }
    
    return result;
  };

  const handleSend = async () => {
    if (!wallet) {
      Alert.alert('Error', 'No wallet connected');
      return;
    }

    if (!recipientAddress.trim()) {
      Alert.alert('Error', 'Please enter recipient address');
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!wallet.mnemonic) {
      Alert.alert('Error', 'Wallet mnemonic not available');
      return;
    }

    try {
      setLoading(true);
      
      const transactionService = TransactionService.getInstance();
      const result = await transactionService.sendTransaction(
        token?.symbol || '',
        wallet.mnemonic,
        recipientAddress,
        amount
      );

      if (result.success && result.txHash) {
        // Update transaction status to confirmed if we stored a pending transaction
        if (result.txHash) {
          try {
            // Get the correct address for this token/network
            const tokenAddress = await getTokenAddress(token?.symbol || '');
            
            // Note: In a real implementation, you'd need to update the existing transaction
            // For now, we'll store a new confirmed transaction
            // console.log(tokenAddress);
            await storeTransactionHistory({
              txHash: result.txHash,
              toAddress: recipientAddress,
              senderAddress: tokenAddress, // Use the correct address for the token
              amountUSD: parseFloat(amount) * getTokenUSDPrice(token?.symbol || ''),
              type: 'transfer',
              token: token?.symbol || '',
              network: getNetworkName(token?.symbol || ''),
              status: 'confirmed',
              timestamp: new Date().toISOString(),
              amount: amount,
              currency: token?.symbol || '',
            });
          } catch (storeError) {
            console.error('❌ Failed to store confirmed transaction history:', storeError);
            // Don't fail the transaction if storage fails
          }
        } 
        Alert.alert(
          'Transaction Sent',
          `Successfully sent ${amount} ${token?.symbol}\n\nTransaction Hash:\n${result.txHash?.slice(0, 20)}...${result.txHash?.slice(-20)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setRecipientAddress('');
                setAmount('');
                loadTokenBalance(); // Reload balance
                onClose();
              }
            }
          ]
        );
      } else {
        // If we stored a pending transaction and it failed, we should update its status
        // For now, we'll just log the failure
        console.error('❌ Transaction failed:', result.error);
        Alert.alert('Transaction Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      Alert.alert('Error', error.message || 'Failed to send transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balance);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 12,
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 32,
      maxHeight: SCREEN_HEIGHT * 0.85,
      minHeight: SCREEN_HEIGHT * 0.65,
    },
    handleBar: {
      width: 48,
      height: 5,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
      paddingHorizontal: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tokenCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    tokenIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    tokenImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    tokenName: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    balanceInfo: {
      alignItems: 'flex-end',
    },
    balanceLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 6,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    balanceAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 14,
      letterSpacing: -0.2,
    },
    input: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 18,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      minHeight: 70,
      textAlignVertical: 'top',
      fontWeight: '500',
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    amountInput: {
      flex: 1,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: 20,
      paddingVertical: 18,
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    amountInputFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    maxButton: {
      paddingHorizontal: 24,
      paddingVertical: 18,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
    },
    maxButtonText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingVertical: 20,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 12,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    sendButtonText: {
      fontSize: 19,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
    sendButtonTextDisabled: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    loadingText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      fontWeight: '600',
    },
    bottomSection: {
      backgroundColor: theme.colors.surface,
      paddingTop: 12,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.error,
      marginTop: 8,
      fontWeight: '600',
    },
    successText: {
      fontSize: 14,
      color: theme.colors.success,
      marginTop: 8,
      fontWeight: '600',
    },
  });

  if (!token || !visible) return null;

  const isFormValid = recipientAddress.trim() && amount.trim() && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <View style={styles.modalContent}>
            <View style={styles.handleBar} />
            
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Send {token?.symbol || 'Token'}</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Icon name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.tokenCard}>
                <View style={[
                  styles.tokenIcon, 
                  { 
                    backgroundColor: (token.color || theme.colors.primary) + '15',
                    borderWidth: 2,
                    borderColor: (token.color || theme.colors.primary) + '30'
                  }
                ]}>
                  {!imageError && (getTokenIconUrl(token.id) || getTokenIconUrl(token.symbol)) ? (
                    <Image
                      source={{ uri: (getTokenIconUrl(token.id) || getTokenIconUrl(token.symbol)) as string }}
                      style={styles.tokenImage}
                      onError={() => setImageError(true)}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ 
                      color: token.color || theme.colors.primary, 
                      fontWeight: '900', 
                      fontSize: 24,
                      letterSpacing: -0.5
                    }}>
                      {token.symbol?.charAt(0) || 'T'}
                    </Text>
                  )}
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol || 'Token'}</Text>
                  <Text style={styles.tokenName}>{token.name || 'Unknown Token'}</Text>
                </View>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceLabel}>Available</Text>
                  {loadingBalance ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.balanceAmount}>{balance} {token.symbol || 'Token'}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    recipientAddress.trim() && styles.inputFocused
                  ]}
                  placeholder="Enter wallet address"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  multiline
                  numberOfLines={3}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={[
                      styles.amountInput,
                      amount.trim() && styles.amountInputFocused
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.maxButton} 
                    onPress={handleMaxAmount}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !isFormValid && styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                <Text style={[
                  !isFormValid
                    ? styles.sendButtonTextDisabled
                    : styles.sendButtonText
                ]}>
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                      Sending...
                    </>
                  ) : (
                    `Send ${token.symbol || 'Token'}`
                  )}
                </Text>
              </TouchableOpacity>

              {loading && (
                <Text style={styles.loadingText}>
                  Processing transaction...
                </Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
