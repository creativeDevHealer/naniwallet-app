import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Clipboard,
  Share,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface WalletSetupScreenProps {
  navigation: any;
  route: { params?: { fromMain?: boolean } };
}


type SetupStep = 'welcome' | 'create' | 'import' | 'mnemonic' | 'confirm' | 'complete';

export const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { 
    createWallet, 
    importWalletFromMnemonic, 
    importWalletFromPrivateKey,
    validateMnemonic,
    wallet,
    loading 
  } = useWeb3Auth();
  const { completeWalletSetup, needsWalletSetup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const enteredFromMain = !!route?.params?.fromMain;

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(''));
  };
  
  const handleWalletSetupComplete = async () => {
    console.log('🎯 WalletSetupScreen - handleWalletSetupComplete called');
    
    // Add a small delay to ensure wallet is fully saved
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await completeWalletSetup();
    console.log('🎯 WalletSetupScreen - completeWalletSetup called, AppNavigator should switch to MainStack');
    
    // The AppNavigator will automatically switch to MainStack when needsWalletSetup becomes false
    // If this screen was opened from MainStack (disconnect flow), navigate to Home
    if (enteredFromMain) {
      try {
        navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
      } catch (_e) {}
    }
  };
  const [importMnemonic, setImportMnemonic] = useState('');
  const [confirmMnemonic, setConfirmMnemonic] = useState('');
  const [importingMnemonic, setImportingMnemonic] = useState(false);

  // No explicit navigation effect; AppNavigator handles stack switch on flag change

  const handleCreateNewWallet = async () => {
    try {
      setCreating(true);
      // Yield to the UI so the spinner renders before heavy work
      await new Promise(resolve => setTimeout(resolve, 100));
      await createWallet();
      setCurrentStep('mnemonic');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };


  const handleImportWallet = () => {
    setCurrentStep('import');
  };

  const handleImportFromMnemonic = async () => {
    try {
      if (!validateMnemonic(importMnemonic.trim())) {
        Alert.alert('Invalid Mnemonic', 'Please enter a valid 12-word mnemonic phrase');
        return;
      }
      
      console.log('🔄 Importing wallet from mnemonic...');
      setImportingMnemonic(true);
      // Yield to UI so in-button spinner renders
      await new Promise(resolve => setTimeout(resolve, 100));
      await importWalletFromMnemonic(importMnemonic.trim());
      console.log('✅ Wallet imported successfully from mnemonic');
      showToast('Wallet imported successfully');
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (needsWalletSetup) {
        handleWalletSetupComplete();
      } else {
        // We are in MainStack (post-disconnect flow). Go straight to Home.
        navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
      }
    } catch (error: any) {
      console.error('❌ Failed to import wallet from mnemonic:', error);
      Alert.alert('Error', error.message || 'Failed to import wallet');
    } finally {
      setImportingMnemonic(false);
    }
  };

  // Import from private key removed per design

  const handleCopyMnemonic = () => {
    if (wallet?.mnemonic) {
      Clipboard.setString(wallet.mnemonic);
      showToast('Mnemonic phrase copied to clipboard');
    }
  };

  const handleShareMnemonic = async () => {
    try {
      if (wallet?.mnemonic) {
        await Share.share({
          message: `My wallet mnemonic (keep this secure): ${wallet.mnemonic}`,
          title: 'Wallet Backup'
        });
      }
    } catch (error) {
      console.error('Error sharing mnemonic:', error);
    }
  };

  const handleConfirmMnemonic = () => {
    if (wallet?.mnemonic && confirmMnemonic.trim() === wallet.mnemonic) {
      setCurrentStep('complete');
    } else {
      Alert.alert('Error', 'Mnemonic phrases do not match. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Removed fullscreen overlay in favor of in-button loader
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    stepContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 32,
      alignItems: 'center',
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
      paddingHorizontal: 16,
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
    buttonContainer: {
      width: '100%',
      marginBottom: 24,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      flexDirection: 'row',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    disabledButton: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    mnemonicContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: '100%',
    },
    mnemonicText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      textAlign: 'center',
      fontFamily: 'monospace',
    },
    mnemonicActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.warning + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 12,
      lineHeight: 20,
    },
    mnemonicInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 20,
      width: '100%',
      minHeight: 100,
    },
    importOptions: {
      width: '100%',
    },
    importLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    importInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
      width: '100%',
      minHeight: 80,
    },
    importButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    importButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonContentText: {
      marginLeft: 8,
    },
    orText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginVertical: 16,
    },
  });

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="account-balance-wallet" size={64} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Set Up Your Wallet</Text>
      <Text style={styles.subtitle}>
        Create a new non-custodial wallet or import an existing one. You have full control of your private keys.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, (loading || creating) && styles.disabledButton]}
          onPress={handleCreateNewWallet}
          activeOpacity={0.8}
          disabled={loading || creating}
        >
          {creating ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.white} />
              <Text style={styles.primaryButtonText}> Creating wallet...</Text>
            </>
          ) : (
            <>
              <Icon name="add-circle" size={24} color={theme.colors.white} />
              <Text style={styles.primaryButtonText}>Create New Wallet</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleImportWallet}
          activeOpacity={0.8}
          disabled={loading || creating}
        >
          <Icon name="download" size={24} color={theme.colors.primary} />
          <Text style={styles.secondaryButtonText}>Import Existing Wallet</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  const renderMnemonicStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="security" size={64} color={theme.colors.warning} />
      </View>
      <Text style={styles.title}>Backup Your Wallet</Text>
      <Text style={styles.subtitle}>
        Write down these 12 words in the exact order shown. This is your recovery phrase - keep it safe and never share it.
      </Text>

      <View style={styles.mnemonicContainer}>
        <Text style={styles.mnemonicText}>{wallet?.mnemonic || 'Generating...'}</Text>
      </View>

      <View style={styles.mnemonicActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopyMnemonic}>
          <Icon name="content-copy" size={20} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareMnemonic}>
          <Icon name="share" size={20} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningContainer}>
        <Icon name="warning" size={20} color={theme.colors.warning} />
        <Text style={styles.warningText}>
          Never share your recovery phrase. Anyone with these words can access your wallet.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep('confirm')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>I've Backed It Up</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="check-circle" size={64} color={theme.colors.success} />
      </View>
      <Text style={styles.title}>Confirm Your Recovery Phrase</Text>
      <Text style={styles.subtitle}>
        Please enter your 12-word recovery phrase to confirm you've backed it up correctly.
      </Text>

      <TextInput
        style={styles.mnemonicInput}
        placeholder="Enter your 12-word recovery phrase..."
        placeholderTextColor={theme.colors.textSecondary}
        value={confirmMnemonic}
        onChangeText={setConfirmMnemonic}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.primaryButton, confirmMnemonic.trim().split(' ').length !== 12 && styles.disabledButton]}
        onPress={handleConfirmMnemonic}
        disabled={confirmMnemonic.trim().split(' ').length !== 12}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Confirm & Create Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderImportStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="download" size={64} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Import Your Wallet</Text>
      <Text style={styles.subtitle}>
        Choose how you'd like to import your existing wallet.
      </Text>

      <View style={styles.importOptions}>
        <Text style={styles.importLabel}>Recovery Phrase (12 words)</Text>
        <TextInput
          style={styles.importInput}
          placeholder="Enter your 12-word recovery phrase..."
          placeholderTextColor={theme.colors.textSecondary}
          value={importMnemonic}
          onChangeText={setImportMnemonic}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.importButton, (!validateMnemonic(importMnemonic.trim()) || importingMnemonic) && styles.disabledButton]}
          onPress={handleImportFromMnemonic}
          disabled={!validateMnemonic(importMnemonic.trim()) || importingMnemonic}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {importingMnemonic && (
              <ActivityIndicator size="small" color={theme.colors.white} />
            )}
            <Text style={[styles.importButtonText, importingMnemonic && styles.buttonContentText]}>
              {importingMnemonic ? 'Importing...' : 'Import from Recovery Phrase'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Private key import removed */}
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="check-circle" size={64} color={theme.colors.success} />
      </View>
      <Text style={styles.title}>Wallet Created Successfully!</Text>
      <Text style={styles.subtitle}>
        Your non-custodial wallet is ready. You have full control of your private keys and funds.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleWalletSetupComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'mnemonic':
        return renderMnemonicStep();
      case 'confirm':
        return renderConfirmStep();
      case 'import':
        return renderImportStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {wallet ? (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.headerTitle}>Wallet Setup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {toastMessage !== '' && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Icon name="check" size={18} color={theme.colors.primary} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};
