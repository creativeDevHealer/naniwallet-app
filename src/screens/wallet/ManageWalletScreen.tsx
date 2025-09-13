import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';

interface WalletRow {
  id: string;
  name: string;
  address: string;
  balance: string;
  selected?: boolean;
}

export const ManageWalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { wallet, wallets, removeWallet } = useWeb3Auth();
  const [items, setItems] = useState<WalletRow[]>([]);

  useEffect(() => {
    const rows: WalletRow[] = wallets.map((w: any, idx: number) => ({
      id: w.id || w.address || String(idx),
      name: w.name || `Wallet${idx + 1}`,
      address: w.address,
      balance: '0 USDT',
      selected: (wallet?.id || wallet?.address) === (w.id || w.address),
    }));
    setItems(rows);
  }, [wallets, wallet]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text },
    back: { padding: 8 },
    placeholderRight: { width: 32 },
    listWrap: { padding: 12 },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 14, marginBottom: 12 },
    rowSelected: { borderColor: '#4C6FFF' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontWeight: '800', color: theme.colors.text },
    rowMid: { flex: 1, marginHorizontal: 10 },
    rowTitle: { color: theme.colors.text, fontWeight: '700' },
    rowSub: { color: theme.colors.textSecondary, marginTop: 2 },
    iconBtn: { padding: 6, marginLeft: 6 },
  });

  const renderRow = (item: WalletRow) => (
    <View key={item.id} style={[styles.row, item.selected && styles.rowSelected]}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || item.address || 'W').charAt(0).toUpperCase()}</Text></View>
      <View style={styles.rowMid}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSub}>{item.balance}</Text>
      </View>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          Alert.alert(
            'Disconnect Wallet',
            'Are you sure you want to disconnect this wallet?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Disconnect',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await removeWallet(item.id);
                    // If no wallets remain, route to setup
                    if (wallets.length - 1 <= 0) {
                      navigation.reset({ index: 0, routes: [{ name: 'WalletSetup' as never, params: { fromMain: true } as never }] });
                    }
                  } catch (e) {}
                },
              },
            ]
          );
        }}
      >
        <Icon name="delete-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditWallet', { walletId: item.id })}>
        <Icon name="edit" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Wallet</Text>
        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.listWrap}>
        {items.map(renderRow)}
      </View>
    </SafeAreaView>
  );
};


