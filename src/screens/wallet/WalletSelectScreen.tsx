import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props { navigation: any }

export const WalletSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { wallet, wallets, setActiveWallet } = useWeb3Auth();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text },
    back: { padding: 8 },
    placeholderRight: { width: 32 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 16, borderRadius: 12, marginBottom: 12 },
    itemTextWrap: { marginLeft: 12, flex: 1 },
    itemTitle: { color: theme.colors.text, fontWeight: '600' },
    itemSubtitle: { color: theme.colors.textSecondary, marginTop: 2 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, marginVertical: 12 },
    addBtn: { flex: 1, backgroundColor: theme.colors.accent, borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginRight: 10 },
    addBtnText: { color: theme.colors.white, fontWeight: '800' },
    manageBtn: { flex: 1, backgroundColor: 'transparent', borderRadius: 24, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    manageBtnText: { color: theme.colors.text, fontWeight: '800' },
  });

  const shortAddr = (addr?: string) => !addr ? '' : `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Wallet</Text>
        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('WalletSetup', { fromMain: true })}>
          <Text style={styles.addBtnText}>Add Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.manageBtn} onPress={() => navigation.navigate('ManageWallet')}>
          <Text style={styles.manageBtnText}>Manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        {wallets.map(w => (
          <TouchableOpacity key={w.id || w.address} style={styles.item} onPress={async () => { await setActiveWallet(w.id || w.address); navigation.goBack(); }}>
            <Icon name="account-balance-wallet" size={22} color={theme.colors.primary} />
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>{w.name || 'Wallet'}</Text>
              <Text style={styles.itemSubtitle}>{shortAddr(w.address)}</Text>
            </View>
            {(wallet?.id || wallet?.address) === (w.id || w.address) && (
              <Icon name="check-circle" size={20} color={theme.colors.success} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};


