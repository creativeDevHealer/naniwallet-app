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
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TransactionHistoryScreenProps {
  navigation: any;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  token: string;
  amount: string;
  amountUSD: number;
  toAddress?: string;
  fromAddress?: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { wallet } = useWeb3Auth();
  const { formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'send' | 'receive'>('all');

  // Mock transaction data - replace with actual API calls
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'send',
      token: 'ETH',
      amount: '0.5',
      amountUSD: 2250.81,
      toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'confirmed',
      network: 'Ethereum',
    },
    {
      id: '2',
      type: 'receive',
      token: 'BTC',
      amount: '0.01',
      amountUSD: 1225.31,
      fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'confirmed',
      network: 'Bitcoin',
    },
    {
      id: '3',
      type: 'send',
      token: 'SOL',
      amount: '2.5',
      amountUSD: 573.48,
      toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      txHash: '0x9876543210fedcba9876543210fedcba98765432',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'pending',
      network: 'Solana',
    },
  ];

  useEffect(() => {
    loadTransactions();
  }, [wallet]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter transactions by wallet address if needed
      const walletTransactions = mockTransactions.filter(tx => 
        tx.fromAddress === wallet?.address || tx.toAddress === wallet?.address
      );
      
      setTransactions(walletTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getFilteredTransactions = () => {
    if (selectedFilter === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.type === selectedFilter);
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

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Icon
          name={getTransactionIcon(item.type, item.status)}
          size={24}
          color={getTransactionColor(item.type, item.status)}
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.token}
          </Text>
          <Text style={styles.transactionTime}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionAddress}>
            {item.type === 'send' ? 'To: ' : 'From: '}
            {formatAddress(item.toAddress || item.fromAddress || '')}
          </Text>
          <Text style={styles.transactionAmount}>
            {item.type === 'send' ? '-' : '+'}{item.amount} {item.token}
          </Text>
        </View>
        
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionUSD}>
            {formatPrice(item.amountUSD)}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.transactionStatus,
              { color: getTransactionColor(item.type, item.status) }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-long" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your transaction history will appear here once you start making transactions.
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
        <Text style={styles.headerTitle}>Transaction History</Text>
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
            All
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
            Sent
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
            Received
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredTransactions()}
          keyExtractor={(item) => item.id}
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
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};
