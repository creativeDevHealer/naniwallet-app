import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Animated } from 'react-native';
import { Clipboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';

interface Props { navigation: any; route: any }

export const EditWalletScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { wallets, wallet, renameWallet, removeWallet } = useWeb3Auth();
  const walletId: string | undefined = route?.params?.walletId;
  const current = useMemo(() => wallets.find(w => (w.id || w.address) === walletId) || wallet, [wallets, wallet, walletId]);
  const [name, setName] = useState(current?.name || '');
  // biometric toggle removed
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDraft, setRenameDraft] = useState(current?.name || '');
  const [seedVisible, setSeedVisible] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { setName(current?.name || ''); setRenameDraft(current?.name || ''); }, [current?.name]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text },
    back: { padding: 8 },
    placeholderRight: { width: 32 },
    content: { padding: 16 },
    avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    avatarText: { fontWeight: '800', color: theme.colors.text },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, flex: 1 },
    nameText: { color: theme.colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
    editIcon: { padding: 6 },
    field: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    fieldText: { color: theme.colors.text, fontSize: 16 },
    fieldArrow: {},
    removeText: { color: '#FF5A5F', textAlign: 'center', fontWeight: '700', marginTop: 24 },
    nameInput: { color: theme.colors.text, fontSize: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 6 },
    modalOverlay: { flex: 1, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '86%', backgroundColor: theme.colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    modalClose: { padding: 6 },
    modalInputWrap: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
    modalInput: { color: theme.colors.text, fontSize: 16 },
    modalConfirm: { marginTop: 18, backgroundColor: '#4C6FFF', borderRadius: 24, alignItems: 'center', paddingVertical: 14 },
    modalConfirmText: { color: theme.colors.white, fontWeight: '800' },
    toastContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: theme.colors.surface, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, shadowColor: theme.colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.isDark ? 0.25 : 0.1, shadowRadius: 4, elevation: 2 },
    toastText: { color: theme.colors.text, fontSize: 14, fontWeight: '500', marginLeft: 8 },
  });

  const initial = (current?.name || current?.address || 'W').charAt(0).toUpperCase();

  const handleRename = async () => {
    if (!current) return;
    const newName = name.trim();
    if (!newName) return;
    await renameWallet(current.id || current.address, newName);
  };

  const confirmRemove = () => {
    if (!current) return;
    Alert.alert('Remove Wallet', 'Are you sure you want to remove this wallet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await removeWallet(current.id || current.address);
          navigation.goBack();
        }
      }
    ]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToastMessage(''));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Wallet</Text>
        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{name || 'Wallet'}</Text>
            <TouchableOpacity style={styles.editIcon} onPress={() => { setRenameDraft(name); setRenameVisible(true); }}>
              <Icon name="edit" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.field}
          onPress={() => { setSeedPhrase(current?.mnemonic || ''); setSeedVisible(true); }}
        >
          <Text style={styles.fieldText}>Seed phrase</Text>
          <Icon name="chevron-right" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.field} onPress={() => { /* navigate to private key reveal in future */ }}>
          <Text style={styles.fieldText}>Private Key</Text>
          <Icon name="chevron-right" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Face/Fingerprint payment row removed */}

        <TouchableOpacity onPress={confirmRemove}>
          <Text style={styles.removeText}>Remove Wallet</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={renameVisible} transparent animationType="fade" onRequestClose={() => setRenameVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rename Wallet</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setRenameVisible(false)}>
                <Icon name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme.colors.text, marginLeft: 6 }}>Wallet Name</Text>
            <View style={styles.modalInputWrap}>
              <TextInput
                value={renameDraft}
                onChangeText={setRenameDraft}
                placeholder="Wallet Name"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.modalInput}
              />
            </View>
            <TouchableOpacity
              style={styles.modalConfirm}
              onPress={async () => {
                const newName = (renameDraft || '').trim();
                if (current && newName) {
                  await renameWallet(current.id || current.address, newName);
                  setName(newName);
                }
                setRenameVisible(false);
              }}
            >
              <Text style={styles.modalConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={seedVisible} transparent animationType="fade" onRequestClose={() => setSeedVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seed phrase</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {seedPhrase ? (
                  <TouchableOpacity style={styles.modalClose} onPress={() => { Clipboard.setString(seedPhrase); showToast('Copied to clipboard'); }}>
                    <Icon name="content-copy" size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.modalClose} onPress={() => setSeedVisible(false)}>
                  <Icon name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            {seedPhrase ? (
              <View style={[styles.modalInputWrap, { paddingVertical: 14 }]}>
                <Text style={[styles.modalInput, { lineHeight: 22 }]}>{seedPhrase}</Text>
              </View>
            ) : (
              <Text style={{ color: theme.colors.textSecondary }}>No seed phrase available for this wallet.</Text>
            )}
          </View>
        </View>
      </Modal>

      {toastMessage !== '' && (
        <Modal transparent visible animationType="none" onRequestClose={() => {}}>
          <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]} pointerEvents="none">
            <Icon name="check" size={18} color={theme.colors.primary} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default EditWalletScreen;


