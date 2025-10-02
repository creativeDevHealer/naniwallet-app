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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWeb3Auth } from '../context/Web3AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NetworkToken } from '../services/tokenService';
import BTCBalanceService from '../services/btcBalanceService';
import ETHBalanceService from '../services/ethBalanceService';
import SOLBalanceService from '../services/solBalanceService';
import TokenAddressService from '../services/tokenAddressService';
import BTCSendService from '../services/btcSendService';
import ETHSendService from '../services/ethSendService';
import SOLSendService from '../services/solSendService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SendDialogProps {
  visible: boolean;
  token: NetworkToken | null;
  onClose: () => void;
}

export const SendDialog: React.FC<SendDialogProps> = ({ visible, token, onClose }) => {
  const { theme } = useTheme();
  const { activeWallet, wallet, wallets } = useWeb3Auth();
  const { selectedCurrency, convertAmount, formatAmount } = useCurrency();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('0.00');

  useEffect(() => {
    if (visible && token && wallet) {
      console.log('SendDialog: Token received:', token);
      console.log('SendDialog: Wallet:', wallet.address);
      
      // Fetch actual balance for the selected token
      fetchTokenBalance();
      
      // Reset form when dialog opens
      setRecipientAddress('');
      setAmount('');
      setCurrencyValue('0.00');
      setLoading(false);
      setImageError(false);
    }
  }, [visible, token, wallet]);

  const fetchTokenBalance = async () => {
    if (!token || !wallet) return;
    
    setBalanceLoading(true);
    try {
      console.log(`🔍 === BALANCE FETCHING DEBUG ===`);
      console.log(`🔍 Token: ${token.symbol}`);
      console.log(`🔍 Wallet Address: ${wallet.address}`);
      console.log(`🔍 Wallet Mnemonic: ${wallet.mnemonic ? 'Available' : 'Not available'}`);
      console.log(`🔍 Wallet Object Keys:`, Object.keys(wallet));
      console.log(`🔍 Full Wallet Object:`, wallet);
      
      const addressService = TokenAddressService.getInstance();
      
      if (token.symbol.toUpperCase() === 'BTC') {
        console.log(`🔍 Fetching BTC balance using proper BTC address derivation`);
        
        // Get proper BTC address from mnemonic
        try {
          console.log(`🔍 Calling getTokenAddressInfo for BTC with mnemonic: ${wallet.mnemonic ? 'Present' : 'Missing'}`);
          const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
          console.log(`🔍 BTC Address Info Result:`, addressInfo);
          
          if (addressInfo?.address) {
            console.log(`🔍 BTC Address: ${addressInfo.address}`);
            const btcService = BTCBalanceService.getInstance();
            const balanceInfo = await btcService.getBTCBalance(addressInfo.address, true); // Use testnet
            const formattedBalance = balanceInfo.balance.toFixed(8);
            setBalance(formattedBalance);
            console.log(`✅ BTC Balance: ${balanceInfo.balance} BTC (${balanceInfo.balanceSatoshis} satoshis)`);
            console.log(`📊 Formatted balance: ${formattedBalance} BTC`);
          } else {
            console.log(`❌ No BTC address found for wallet - addressInfo:`, addressInfo);
            setBalance('0');
          }
        } catch (btcError) {
          console.error(`❌ BTC address derivation failed:`, btcError);
          setBalance('0');
        }
      } else if (token.symbol.toUpperCase() === 'ETH') {
        console.log(`🔍 Fetching ETH balance for address: ${wallet.address}`);
        const ethService = ETHBalanceService.getInstance();
        const balanceInfo = await ethService.getETHBalance(wallet.address, 'sepolia'); // Use testnet
        const formattedBalance = balanceInfo.balance.toFixed(6);
        setBalance(formattedBalance);
        console.log(`✅ ETH Balance: ${balanceInfo.balance} ETH (${balanceInfo.balanceWei} wei)`);
        console.log(`📊 Formatted balance: ${formattedBalance} ETH`);
        console.log(`🔢 Raw balance number: ${balanceInfo.balance}`);
      } else if (token.symbol.toUpperCase() === 'SOL') {
        console.log(`🔍 Fetching SOL balance using proper SOL address derivation`);
        
        // Get proper SOL address from mnemonic
        try {
          console.log(`🔍 Calling getTokenAddressInfo for SOL with mnemonic: ${wallet.mnemonic ? 'Present' : 'Missing'}`);
          const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
          console.log(`🔍 SOL Address Info Result:`, addressInfo);
          
          if (addressInfo?.address) {
            console.log(`🔍 SOL Address: ${addressInfo.address}`);
            const solService = SOLBalanceService.getInstance();
            const balanceInfo = await solService.getBalance(addressInfo.address, 'devnet');
            const formattedBalance = balanceInfo.balance.toFixed(6);
            setBalance(formattedBalance);
            console.log(`✅ SOL Balance: ${balanceInfo.balance} SOL (${balanceInfo.balanceLamports} lamports)`);
            console.log(`📊 Formatted balance: ${formattedBalance} SOL`);
          } else {
            console.log(`❌ No SOL address found for wallet - addressInfo:`, addressInfo);
            setBalance('0');
          }
        } catch (solError) {
          console.error(`❌ SOL address derivation failed:`, solError);
          setBalance('0');
        }
      } else {
        // For other tokens, you might want to implement additional services
        console.log(`⚠️ Balance fetching not implemented for ${token.symbol}`);
        setBalance('0');
      }
    } catch (error) {
      console.error('❌ Error fetching token balance:', error);
      console.error('❌ Error details:', error);
      setBalance('0');
    } finally {
      setBalanceLoading(false);
      console.log(`🔍 === BALANCE FETCHING COMPLETE ===`);
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

  const handleSend = async () => {
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

    if (!wallet || !wallet.mnemonic) {
      Alert.alert('Error', 'Wallet not available');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🚀 Starting real transaction:', {
        token: token?.symbol,
        amount: amount,
        recipient: recipientAddress,
        from: wallet.address
      });

      let result;

      if (token?.symbol.toUpperCase() === 'BTC') {
        console.log('📤 Sending BTC transaction...');
        const btcService = BTCSendService.getInstance();
        const addressService = TokenAddressService.getInstance();
        const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
        
        if (!addressInfo?.address) {
          throw new Error('Failed to get BTC address');
        }

        result = await btcService.sendBTC({
          senderAddress: addressInfo.address,
          receiverAddress: recipientAddress,
          amountSatoshis: Math.floor(parseFloat(amount) * 100000000), // Convert to satoshis
          network: 'testnet', // Use testnet for now
          senderPrivateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic // Pass mnemonic for proper address derivation
        });

      } else if (token?.symbol.toUpperCase() === 'ETH') {
        console.log('📤 Sending ETH transaction...');
        const ethService = ETHSendService.getInstance();
        
        result = await ethService.sendETH({
          fromAddress: wallet.address,
          toAddress: recipientAddress,
          amountETH: parseFloat(amount),
          network: 'sepolia', // Use sepolia testnet for now
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic
        });

      } else if (token?.symbol.toUpperCase() === 'SOL') {
        console.log('📤 Sending SOL transaction...');
        const solService = SOLSendService.getInstance();
        const addressService = TokenAddressService.getInstance();
        const addressInfo = await addressService.getTokenAddressInfo(token, wallet.mnemonic);
        
        if (!addressInfo?.address) {
          throw new Error('Failed to get SOL address');
        }

        result = await solService.sendSOL({
          fromAddress: addressInfo.address,
          toAddress: recipientAddress,
          amountSOL: parseFloat(amount),
          network: 'devnet', // Use devnet for now
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic
        });

      } else {
        throw new Error(`Sending ${token?.symbol} not implemented yet`);
      }

      if (result.success) {
        console.log('✅ Transaction successful:', result.txHash);
        Alert.alert(
          'Transaction Sent',
          `Successfully sent ${amount} ${token?.symbol} to ${recipientAddress.slice(0, 10)}...${recipientAddress.slice(-10)}\n\nTransaction Hash: ${result.txHash}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setRecipientAddress('');
                setAmount('');
                setCurrencyValue('0.00');
                onClose();
              }
            }
          ]
        );
        
        // Refresh balance after successful transaction
        setTimeout(() => {
          fetchTokenBalance();
        }, 2000);
      } else {
        console.error('❌ Transaction failed:', result.error);
        Alert.alert('Transaction Failed', result.error || 'Unknown error occurred');
      }

    } catch (error: any) {
      console.error('❌ Send transaction error:', error);
      Alert.alert('Error', error.message || 'Failed to send transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balance);
    calculateCurrencyValue(balance);
  };

  const handleRefreshBalance = async () => {
    if (token && wallet) {
      await fetchTokenBalance();
    }
  };

  const calculateCurrencyValue = (amount: string) => {
    if (!amount || !token?.priceUSDT || isNaN(parseFloat(amount))) {
      setCurrencyValue('0.00');
      return;
    }
    
    const numericAmount = parseFloat(amount);
    const usdAmount = numericAmount * token.priceUSDT;
    const convertedAmount = convertAmount(usdAmount, 'USD', selectedCurrency);
    setCurrencyValue(formatAmount(convertedAmount));
  };

  const handleAmountChange = (text: string) => {
    setAmount(text);
    calculateCurrencyValue(text);
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
    balanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    balanceLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginRight: 8,
    },
    refreshButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    refreshButtonDisabled: {
      opacity: 0.5,
    },
    balanceAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    balanceNote: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
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
    usdValueContainer: {
      marginTop: 8,
      alignItems: 'center',
    },
    usdValueLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: 'hidden',
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
                  <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>Available</Text>
                    <TouchableOpacity 
                      style={[styles.refreshButton, balanceLoading && styles.refreshButtonDisabled]} 
                      onPress={handleRefreshBalance}
                      activeOpacity={0.7}
                      disabled={balanceLoading}
                    >
                      <Icon 
                        name="refresh" 
                        size={16} 
                        color={balanceLoading ? theme.colors.textTertiary : theme.colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.balanceAmount}>
                    {balanceLoading ? 'Loading...' : `${balance} ${token.symbol || 'Token'}`}
                  </Text>
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
                    onChangeText={handleAmountChange}
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
                {amount.trim() && parseFloat(amount) > 0 && (
                  <View style={styles.usdValueContainer}>
                    <Text style={styles.usdValueLabel}>≈ {currencyValue} {selectedCurrency}</Text>
                  </View>
                )}
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
                  {loading ? 'Sending...' : `Send ${token.symbol || 'Token'}`}
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
