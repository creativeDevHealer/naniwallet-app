import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from '../../i18n';
import BackendTransactionService, { Transaction } from '../../services/backendTransactionService';
import TokenAddressService from '../../services/tokenAddressService';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TransactionHistoryScreenProps {
  navigation: any;
}

// Transaction interface is now imported from backendTransactionService

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { wallet } = useWeb3Auth();
  const { formatPrice } = useCurrency();
  const { t, formatRelativeTime, isRTL, getTextAlign } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [solAddress, setSolAddress] = useState('');

  const backendService = BackendTransactionService.getInstance();

  useEffect(() => {
    if (wallet?.address) {
      loadTransactions();
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet?.address) {
      loadTransactions(1, false);
    }
  }, [selectedFilter]);

  const loadTransactions = async (page: number = 1, append: boolean = false) => {
    try {
      if (!wallet?.address) {
        console.log('No wallet address available');
        setLoading(false);
        return;
      }

      if (!append) {
        setLoading(true);
      }

      console.log('Loading transactions for wallet:', wallet.address);

      // Get SOL address
      let currentSolAddress = '';
      if (wallet?.mnemonic) {
        const addressService = TokenAddressService.getInstance();
        const addressInfo = await addressService.getTokenAddressInfo(
          { symbol: 'SOL', network: 'solana' } as any, 
          wallet.mnemonic
        );
        currentSolAddress = addressInfo?.address || '';
        setSolAddress(currentSolAddress); // Store for later use
      }

      const result = await backendService.getTransactionsByEthAddress(wallet.address, currentSolAddress, {
        page,
        limit: 20,
        type: selectedFilter === 'all' ? undefined : selectedFilter,
      });

      if (result.success) {
        const newTransactions = result.data.transactions;
        
        if (append) {
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }
        
        setCurrentPage(result.data.pagination.current);
        setTotalTransactions(result.data.pagination.total);
        setHasMoreData(result.data.pagination.current < result.data.pagination.pages);
        
        console.log(`Loaded ${newTransactions.length} transactions (page ${page})`);
        console.log(`Total transactions: ${result.data.pagination.total}`);
      } else {
        console.error('Failed to load transactions:', result.error);
        if (!append) {
          Alert.alert('Error', result.error || 'Failed to load transaction history');
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      if (!append) {
        Alert.alert('Error', 'Failed to load transaction history');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(1, false);
  };

  const loadMoreTransactions = async () => {
    if (hasMoreData && !loading) {
      await loadTransactions(currentPage + 1, true);
    }
  };

  const getFilteredTransactions = () => {
    if (selectedFilter === 'all') {
      return transactions;
    }
    
    console.log('=== FILTERING TRANSACTIONS ===');
    console.log('Selected filter:', selectedFilter);
    console.log('Total transactions:', transactions.length);
    console.log('Wallet address:', wallet?.address);
    console.log('SOL address:', solAddress);
    
    // Filter based on determined transaction type (send/receive)
    const filtered = transactions.filter(tx => {
      const currentEthAddress = wallet?.address?.toLowerCase();
      const currentSolAddressLower = solAddress?.toLowerCase();
      
      console.log('Checking transaction:', {
        txId: tx._id,
        txType: tx.type,
        txSenderAddress: tx.senderAddress,
        txToAddress: tx.toAddress,
        txEthAddress: tx.ethaddress,
        currentEthAddress,
        currentSolAddressLower
      });
      
      // Method 1: Check if senderAddress matches current wallet
      const isSendBySender = tx.senderAddress?.toLowerCase() === currentEthAddress || 
                            tx.senderAddress?.toLowerCase() === currentSolAddressLower;
      
      // Method 2: Check if ethaddress matches and it's a send transaction
      const isSendByEthAddress = tx.ethaddress?.toLowerCase() === currentEthAddress && 
                                (tx.senderAddress?.toLowerCase() === currentEthAddress || tx.type === 'send' || tx.type === 'transfer');
      
      // Method 3: Check if toAddress matches current wallet (receive)
      const isReceiveByToAddress = tx.toAddress?.toLowerCase() === currentEthAddress || 
                                  tx.toAddress?.toLowerCase() === currentSolAddressLower;
      
      const isSendTransaction = isSendBySender || isSendByEthAddress;
      const isReceiveTransaction = isReceiveByToAddress;
      
      console.log('Transaction analysis:', {
        isSendBySender,
        isSendByEthAddress,
        isReceiveByToAddress,
        isSendTransaction,
        isReceiveTransaction
      });
      
      if (selectedFilter === 'send') {
        const shouldShow = isSendTransaction;
        console.log('Should show in SENT filter:', shouldShow);
        return shouldShow;
      } else if (selectedFilter === 'receive') {
        const shouldShow = isReceiveTransaction;
        console.log('Should show in RECEIVE filter:', shouldShow);
        return shouldShow;
      }
      
      return false;
    });
    
    console.log('Filtered result:', filtered.length, 'transactions');
    console.log('=== END FILTERING ===');
    
    return filtered;
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return 'schedule';
    } else if (status === 'failed') {
      return 'error';
    }
    
    switch (type) {
      case 'send':
        return 'call-made';
      case 'receive':
        return 'call-received';
      case 'swap':
        return 'swap-horiz';
      default:
        return 'receipt';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') {
      return theme.colors.warning;
    } else if (status === 'failed') {
      return theme.colors.error;
    }
    
    switch (type) {
      case 'send':
        return theme.colors.error;
      case 'receive':
        return theme.colors.success;
      case 'swap':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    // Convert timestamp string to number for formatDate function
    const timestamp = typeof item.timestamp === 'string' ? new Date(item.timestamp).getTime() : item.timestamp;
    
    // Get current wallet addresses for comparison
    const currentEthAddress = wallet?.address?.toLowerCase();
    const currentSolAddressLower = solAddress?.toLowerCase();
    
    // Determine if this is a send or receive transaction
    const isSendTransaction = item.senderAddress?.toLowerCase() === currentEthAddress || 
                             item.senderAddress?.toLowerCase() === currentSolAddressLower;
    const isReceiveTransaction = item.toAddress?.toLowerCase() === currentEthAddress || 
                                item.toAddress?.toLowerCase() === currentSolAddressLower;
    
    // Determine transaction type for display
    let transactionType = item.type;
    if (isSendTransaction) {
      transactionType = 'send';
    } else if (isReceiveTransaction) {
      transactionType = 'receive';
    }
    
    // Determine the address to show and label
    let displayAddress = '';
    let addressLabel = '';
    
    if (isSendTransaction) {
      // If we sent it, show the recipient address
      displayAddress = item.toAddress || '';
      addressLabel = t('to');
    } else if (isReceiveTransaction) {
      // If we received it, show the sender address
      displayAddress = item.senderAddress || item.ethaddress || '';
      addressLabel = t('from');
    } else {
      // Fallback for other cases
      displayAddress = item.toAddress || item.senderAddress || '';
      addressLabel = '';
    }
    
    // Calculate amount display - use amountUSD converted to token amount if amount is not available
    const tokenAmount = item.amount || (item.amountUSD / 2000).toFixed(6); // Rough conversion for display
    
    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Icon
            name={getTransactionIcon(transactionType, item.status)}
            size={24}
            color={getTransactionColor(transactionType, item.status)}
          />
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>
              {t(transactionType)} {item.token}
            </Text>
            <Text style={styles.transactionTime}>
              {formatRelativeTime(new Date(timestamp))}
            </Text>
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionAddress}>
              {addressLabel}
              {formatAddress(displayAddress || '')}
            </Text>
            <Text style={styles.transactionAmount}>
              {transactionType === 'send' ? '-' : '+'}{tokenAmount} {item.token}
            </Text>
          </View>
          
          <View style={styles.transactionFooter}>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.transactionStatus,
                { color: getTransactionColor(transactionType, item.status) }
              ]}>
                {t(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-long" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('no_transactions')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('transaction_history_will_appear')}
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 40, // Same width as back button to center title
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginHorizontal: 4,
      borderRadius: 20,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    filterButtonTextActive: {
      color: theme.colors.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    transactionList: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    emptyList: {
      flex: 1,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    transactionType: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    transactionTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    transactionInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    transactionAddress: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    transactionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    transactionUSD: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    statusContainer: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
    },
    transactionStatus: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: getTextAlign('center') }]}>
          {t('transaction_history')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'all' && styles.filterButtonTextActive
          ]}>
            {t('all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'send' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('send')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'send' && styles.filterButtonTextActive
          ]}>
            {t('sent')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'receive' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('receive')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === 'receive' && styles.filterButtonTextActive
          ]}>
            {t('received')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredTransactions()}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          contentContainerStyle={[
            styles.transactionList,
            getFilteredTransactions().length === 0 && styles.emptyList
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={() => 
            hasMoreData && getFilteredTransactions().length > 0 ? (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 16,
              }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: theme.colors.textSecondary
                }}>
                  {t('loading_more')}
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  transactionList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionUSD: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
