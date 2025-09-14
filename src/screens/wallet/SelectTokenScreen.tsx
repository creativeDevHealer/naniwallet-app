import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TokenService, { NetworkToken } from '../../services/tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props { navigation: any }

export const SelectTokenScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [tokens, setTokens] = useState<NetworkToken[]>([]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const tks = await TokenService.fetchTokensCached('ethereum', 200);
        if (!tks.length) setError('Failed to load tokens. Please retry.');
        setTokens(tks);
      } catch (_e) {
        setError('Failed to load tokens. Please retry.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const saved = await AsyncStorage.getItem('selected_token_ids');
        const map: Record<string, boolean> = {};
        if (saved) {
          const ids: string[] = JSON.parse(saved);
          ids.forEach((id) => (map[id] = true));
        }
        setEnabled(map);
      } catch {}
    });
    return unsubscribe;
  }, [navigation]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: theme.colors.text },
    back: { padding: 8 },
    searchWrap: { margin: 16, backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, paddingVertical: 10, color: theme.colors.text },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    midCol: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    symbol: { color: theme.colors.text, fontWeight: '700' },
    tag: { marginLeft: 8, fontSize: 10, color: theme.colors.textSecondary, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    price: { color: theme.colors.textSecondary, marginRight: 10 },
    pct: { color: theme.colors.success },
    toggle: { marginLeft: 16 },
  });

  const filtered = tokens.filter(t => `${t.symbol} ${t.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Token</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.searchWrap}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Search" placeholderTextColor={theme.colors.textSecondary} value={query} onChangeText={setQuery} />
      </View>
      {loading && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      {!loading && error ? (
        <View style={{ alignItems: 'center', paddingTop: 24 }}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity onPress={async () => {
            try {
              setLoading(true); setError('');
              const tks = await TokenService.fetchTokensCached('ethereum', 200);
              if (!tks.length) setError('Failed to load tokens. Please retry.');
              setTokens(tks);
            } finally { setLoading(false); }
          }} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
            <Text style={{ color: theme.colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!loading && !error && (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.iconUrl ? (
              <Image source={{ uri: item.iconUrl }} style={[styles.icon, { borderRadius: 14 }]} />
            ) : (
              <View style={[styles.icon, { backgroundColor: item.color + '33' }]}>
                <Text style={{ color: item.color, fontWeight: '800' }}>{item.symbol.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.midCol}>
              <View style={styles.nameRow}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.tag}>{item.name}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.priceUSDT ? item.priceUSDT : '--'} USDT</Text>
                <Text style={[styles.pct, { color: (item.changePct24h || 0) >= 0 ? theme.colors.success : theme.colors.error }]}>
                  {item.changePct24h ? `${item.changePct24h > 0 ? '+' : ''}${item.changePct24h}%` : '--'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.toggle} onPress={async () => {
              const next = !enabled[item.id];
              let selectedIds: string[] = [];
              try {
                const saved = await AsyncStorage.getItem('selected_token_ids');
                selectedIds = saved ? JSON.parse(saved) : [];
              } catch {}
              if (next) {
                if (!selectedIds.includes(item.id)) selectedIds.push(item.id);
              } else {
                selectedIds = selectedIds.filter((id) => id !== item.id);
              }
              await AsyncStorage.setItem('selected_token_ids', JSON.stringify(selectedIds));
              const map: Record<string, boolean> = {};
              selectedIds.forEach((id) => (map[id] = true));
              setEnabled(map);
            }}>
              <Icon name={enabled[item.id] ? 'toggle-on' : 'toggle-off'} size={40} color={enabled[item.id] ? theme.colors.accent : theme.colors.border} />
            </TouchableOpacity>
          </View>
        )}
      />)}
    </SafeAreaView>
  );
};


