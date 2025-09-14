import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TokenService, { NetworkToken } from '../../services/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface SelectReceiveTokenScreenProps {
  navigation: any;
}

export const SelectReceiveTokenScreen: React.FC<SelectReceiveTokenScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { activeWallet } = useWeb3Auth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<NetworkToken[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserTokens();
  }, []);

  const loadUserTokens = async () => {
    try {
      setLoading(true);
      
      // Load user's selected tokens from AsyncStorage (same as WalletDashboard)
      const selectedTokensData = await AsyncStorage.getItem('selectedTokens');
      let selectedTokens: NetworkToken[] = [];
      
      if (selectedTokensData) {
        selectedTokens = JSON.parse(selectedTokensData);
      } else {
        // If no selected tokens, load some popular tokens
        selectedTokens = await TokenService.fetchTokensCached('ethereum', 20);
        await AsyncStorage.setItem('selectedTokens', JSON.stringify(selectedTokens));
      }

      // Load balances for each token - set all to 0
      const tokenBalances: Record<string, number> = {};
      for (const token of selectedTokens) {
        tokenBalances[token.id] = 0; // All tokens have 0 balance
      }
      setBalances(tokenBalances);

      // Use NetworkToken directly
      setTokens(selectedTokens);
    } catch (error) {
      console.error('Error loading user tokens:', error);
      // Fallback to mock data
      loadMockTokens();
    } finally {
      setLoading(false);
    }
  };

  const loadMockTokens = () => {
    // Fallback mock data with realistic balances
    const mockTokens: NetworkToken[] = [
      {
        id: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        priceUSDT: 116049,
        changePct24h: 1.41,
        color: '#F7931A',
      },
      {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        priceUSDT: 4613.29,
        changePct24h: 4.17,
        color: '#627EEA',
      },
      {
        id: 'usdt',
        symbol: 'USDT',
        name: 'Tether',
        priceUSDT: 1.001,
        changePct24h: 0.02,
        color: '#26A17B',
      },
    ];
    
    // Set all balances to 0 for mock tokens
    const mockBalances: Record<string, number> = {
      'btc': 0,
      'eth': 0,
      'usdt': 0,
    };
    
    setTokens(mockTokens);
    setBalances(mockBalances);
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: NetworkToken) => {
    // Navigate to receive dialog with selected token
    navigation.navigate('ReceiveDialog', { token });
  };

  const renderTokenItem = ({ item }: { item: NetworkToken }) => (
    <TouchableOpacity
      style={[styles.tokenItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => handleTokenSelect(item)}
    >
      <View style={styles.tokenLeft}>
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={[styles.tokenIcon, { borderRadius: 14 }]} />
        ) : (
          <View style={[styles.tokenIcon, { backgroundColor: item.color + '33' }]}>
            <Text style={{ color: item.color, fontWeight: '800' }}>{item.symbol.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.tokenInfo}>
          <Text style={[styles.tokenSymbol, { color: theme.colors.text }]}>{item.symbol}</Text>
          <View style={styles.tokenPriceRow}>
            <Text style={[styles.tokenPrice, { color: theme.colors.textSecondary }]}>{`${item.priceUSDT} USDT`}</Text>
            <Text style={[styles.tokenChange, { color: (item.changePct24h || 0) >= 0 ? theme.colors.success : theme.colors.error }]}>
              {`${(item.changePct24h || 0) >= 0 ? '+' : ''}${item.changePct24h || 0}%`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.tokenRight}>
        <Text style={[styles.tokenBalance, { color: theme.colors.text }]}>{balances[item.id] || 0}</Text>
        <Text style={[styles.tokenBalanceUnit, { color: theme.colors.textSecondary }]}>
          {`${(balances[item.id] || 0) * (item.priceUSDT || 0)} USDT`}
        </Text>
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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginVertical: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    searchIcon: {
      marginRight: 12,
      fontSize: 18,
      color: theme.colors.textSecondary,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    tokenList: {
      flex: 1,
    },
    tokenItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    tokenLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tokenIcon: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    tokenPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenPrice: {
      fontSize: 14,
      marginRight: 8,
    },
    tokenChange: {
      fontSize: 14,
      fontWeight: '500',
    },
    tokenRight: {
      alignItems: 'flex-end',
    },
    tokenBalance: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    tokenBalanceUnit: {
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Token</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your tokens...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTokens}
          renderItem={renderTokenItem}
          keyExtractor={(item) => item.id}
          style={styles.tokenList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No tokens found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
