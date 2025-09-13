import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  BackHandler,
  Image,
  Animated,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Clipboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService, { NetworkToken } from '../../services/tokenService';
import NetworkService, { NetworkChain } from '../../services/networkService';

interface WalletDashboardScreenProps {
  navigation: any;
}

export const WalletDashboardScreen: React.FC<WalletDashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { wallet, wallets, getWalletBalance, removeWallet } = useWeb3Auth();
  const [balance, setBalance] = useState('0.0');
  const [networkLabel, setNetworkLabel] = useState('All Network');
  const [networkSheetVisible, setNetworkSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [hideSmallAssets, setHideSmallAssets] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts'>('tokens');
  const [selectedTokens, setSelectedTokens] = useState<NetworkToken[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [chains, setChains] = useState<NetworkChain[]>([]);
  const [chainsLoading, setChainsLoading] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToastMessage(''));
  };

  const loadSelectedTokens = async () => {
    try {
      const ids = await AsyncStorage.getItem('selected_token_ids');
      if (ids) {
        const list: string[] = JSON.parse(ids);
        // Try cache first to avoid rate limits and speed up render
        let real = await TokenService.getCachedTokens('ethereum', 200);
        if (real && real.length) {
          real = real.filter((t) => list.includes(t.id));
        }
        // If cache miss or incomplete, fetch by ids
        if (!real || real.length === 0) {
          real = await TokenService.fetchTokensByIds(list);
        }
        setSelectedTokens(real);
      } else {
        setSelectedTokens([]);
      }
    } catch {
      setSelectedTokens([]);
    }
  };

  useEffect(() => { loadSelectedTokens(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSelectedTokens);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadWalletBalance();
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      try {
        setChainsLoading(true);
        const all = await NetworkService.fetchChainsCached();
        setChains([{ id: 'all', name: 'All Network' }, ...all]);
      } finally {
        setChainsLoading(false);
      }
    })();
  }, []);

  const renderChainItem = ({ item }: { item: NetworkChain }) => (
    <TouchableOpacity key={item.id} style={styles.chainItem} onPress={() => { setNetworkLabel(item.name); setNetworkSheetVisible(false); }}>
      <View style={styles.chainIconWrap}>
        {item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={styles.chainIconImg} />
        ) : (
          <Icon name="all-inclusive" size={20} color={theme.colors.text} />
        )}
      </View>
      <Text style={styles.chainName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Home');
      return true; // Prevent default back action
    });

    return () => backHandler.remove();
  }, [navigation]);

  const loadWalletBalance = async () => {
    try {
      // Skip fetching if wallet is not connected
      if (!wallet) {
        setBalance('0.0');
        return;
      }
      const walletBalance = await getWalletBalance();
      setBalance(walletBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletBalance();
    // refresh balances for tokens (stub: keep zeros or plug provider later)
    setRefreshing(false);
  };

  const handleSendMoney = () => {
    navigation.navigate('SendMoney');
  };

  const handleReceiveMoney = () => {
    navigation.navigate('ReceiveMoney');
  };

  const handleViewTransactions = () => {
    navigation.navigate('TransactionHistory');
  };

  const handleDisconnectWallet = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const id = wallet?.id || wallet?.address;
              if (id) {
                await removeWallet(id);
              }
              navigation.reset({ index: 0, routes: [{ name: 'WalletSetup' as never, params: { fromMain: true } as never }] });
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect wallet');
            }
          },
        },
      ]
    );
  };

  const formatAddress = (address: string) => {
    if (!address) return 'No Address';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingTop: 16,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center' },
    backButton: { padding: 8, marginRight: 12 },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    headerSubtitleRow: { flexDirection: 'row', alignItems: 'center'},
    headerSubtitle: { fontSize: 12, color: theme.colors.textSecondary },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    addressRow: { flexDirection: 'row', alignItems: 'center' },
    vDivider: { width: 1, height: 14, backgroundColor: theme.colors.border, marginRight: 7 },
    networkPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      marginRight: 8,
    },
    networkText: { color: theme.colors.primary, fontWeight: '700', marginRight: 2 },
    headerIconBtn: { padding: 8, marginLeft: 3 },
    headerIconTight: { paddingVertical: 0 },
    sheetOverlay: {
      flex: 1,
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      paddingBottom: 16,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    closeBtn: { padding: 8 },
    sheetScroll: { paddingHorizontal: 16, paddingTop: 12 },
    chainItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
    },
    chainIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.textSecondary + '22',
      marginRight: 12,
    },
    chainIconImg: { width: 24, height: 24, borderRadius: 12 },
    chainName: { color: theme.colors.text, fontWeight: '600' },
    balanceCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bigBalance: { fontSize: 32, fontWeight: '800', color: theme.colors.text },
    eyeButton: { padding: 6, borderRadius: 16 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    pillButton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginHorizontal: 6 },
    pillPrimary: { backgroundColor: theme.colors.primary },
    pillDark: { backgroundColor: theme.colors.text },
    pillTextLight: { color: theme.colors.white, fontWeight: '700' },
    tabsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, alignItems: 'center' },
    tabText: { marginRight: 16, fontWeight: '700', color: theme.colors.textSecondary },
    tabTextActive: { color: theme.colors.text },
    hideRowWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 12 },
    hideSmallRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: theme.colors.surface, flex: 1, borderRadius: 12,
      borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 12,
    },
    plusButton: { paddingHorizontal: 10, paddingVertical: 8, marginLeft: 8 },
    tokenRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    tokenIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    tokenSymbol: { color: theme.colors.text, fontWeight: '700' },
    tokenMidCol: { flex: 1 },
    tokenNameRow: { flexDirection: 'row', alignItems: 'center' },
    tokenPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    tokenPriceText: { color: theme.colors.textSecondary, marginRight: 10 },
    tokenRightCol: { marginLeft: 'auto', alignItems: 'flex-end' },
    tokenRightFiat: { alignItems: 'flex-end' },
    pctGreen: { color: theme.colors.success },
    pctRed: { color: theme.colors.error },
    divider: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: 16 },
    emptyNfts: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, color: theme.colors.textSecondary },
    menuContainer: { margin: 20 },
    menuItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    menuIcon: {
      marginRight: 16,
    },
    menuText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    menuArrow: {
      marginLeft: 8,
    },
    disconnectButton: {
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      margin: 20,
    },
    disconnectButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    toastContainer: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    toastText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
  });

  if (!wallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>No Wallet Connected</Text>
              <Text style={styles.headerSubtitle}>Please set up your wallet first</Text>
            </View>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('WalletSetup')}
          >
            <Icon name="account-balance-wallet" size={24} color={theme.colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Set Up Wallet</Text>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{wallet?.name || 'Wallet'}</Text>
              <TouchableOpacity style={[styles.headerIconBtn, styles.headerIconTight]} onPress={() => navigation.navigate('WalletSelect')}>
                <Icon name="arrow-drop-down" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.addressRow}>
                <Text style={styles.headerSubtitle}>{formatAddress(wallet?.address || '')}</Text>
                <TouchableOpacity style={styles.headerIconBtn} onPress={() => { Clipboard.setString(wallet?.address || ''); showToast('Address copied to clipboard'); }}>
                  <Icon name="content-copy" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.vDivider} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setNetworkSheetVisible(true)}
                style={[styles.networkPill, { backgroundColor: theme.colors.primary + '15' }]}
              >
                <Text style={styles.networkText}>{networkLabel}</Text>
                <Icon name="arrow-drop-down" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => showToast('Coming soon')}>
              <Icon name="history" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Notification')}>
              <Icon name="notifications-none" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Text style={styles.bigBalance}>{isBalanceHidden ? '•••••' : `${Number(balance).toFixed(2)} USDT`}</Text>
          <TouchableOpacity style={styles.eyeButton} onPress={() => setIsBalanceHidden(v => !v)}>
            <Icon name={isBalanceHidden ? 'visibility-off' : 'visibility'} size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.pillButton, styles.pillDark]} onPress={handleSendMoney}>
            <Text style={styles.pillTextLight}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillButton, styles.pillPrimary]} onPress={handleReceiveMoney}>
            <Text style={styles.pillTextLight}>Receive</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setActiveTab('tokens')}>
          <Text style={[styles.tabText, activeTab === 'tokens' && styles.tabTextActive]}>Token</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('nfts')}>
          <Text style={[styles.tabText, activeTab === 'nfts' && styles.tabTextActive]}>NFTs</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tokens' && (
        <>
          <View style={styles.hideRowWrap}>
            <View style={styles.hideSmallRow}>
              <Text style={{ color: theme.colors.text }}>Hide Small Asset</Text>
              <TouchableOpacity onPress={() => setHideSmallAssets(v => !v)}>
                <Icon name={hideSmallAssets ? 'toggle-on' : 'toggle-off'} size={38} color={hideSmallAssets ? theme.colors.primary : theme.colors.border} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate('SelectToken')}>
              <Icon name="add" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {selectedTokens
            .filter(t => !hideSmallAssets || (balances[t.id] || 0) > 0)
            .map((t, idx) => (
              <View key={t.symbol}>
                <View style={styles.tokenRow}>
                  {t.iconUrl ? (
                    <Image source={{ uri: t.iconUrl }} style={[styles.tokenIcon, { borderRadius: 14 }]} />
                  ) : (
                    <View style={[styles.tokenIcon, { backgroundColor: t.color + '33' }] }>
                      <Text style={{ color: t.color, fontWeight: '800' }}>{t.symbol.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.tokenMidCol}>
                    <View style={styles.tokenNameRow}>
                      <Text style={styles.tokenSymbol}>{t.symbol}</Text>
                    </View>
                    <View style={styles.tokenPriceRow}>
                      <Text style={styles.tokenPriceText}>{`${t.priceUSDT} USDT`}</Text>
                      <Text style={(t.changePct24h || 0) >= 0 ? styles.pctGreen : styles.pctRed}>
                        {`${(t.changePct24h || 0) >= 0 ? '+' : ''}${t.changePct24h || 0}%`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tokenRightCol}>
                    <Text style={{ color: theme.colors.text }}>{balances[t.id] || 0}</Text>
                    <Text style={[{ color: theme.colors.textSecondary }]}>{`${(balances[t.id] || 0) * (t.priceUSDT || 0)} USDT`}</Text>
                  </View>
                </View>
                {idx < selectedTokens.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
        </>
      )}

      {activeTab === 'nfts' && (
        <View style={styles.emptyNfts}>
          <Icon name="receipt-long" size={96} color={theme.colors.textSecondary + '66'} />
          <Text style={styles.emptyText}>There's nothing here</Text>
        </View>
      )}

      </ScrollView>

      {toastMessage !== '' && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Icon name="check" size={18} color={theme.colors.primary} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <Modal visible={networkSheetVisible} transparent animationType="fade" onRequestClose={() => setNetworkSheetVisible(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setNetworkSheetVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Chain</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setNetworkSheetVisible(false)}>
                <Icon name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {chainsLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}
                data={chains}
                keyExtractor={(item) => item.id}
                renderItem={renderChainItem}
                initialNumToRender={20}
                windowSize={10}
                removeClippedSubviews
                maxToRenderPerBatch={20}
                updateCellsBatchingPeriod={50}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
