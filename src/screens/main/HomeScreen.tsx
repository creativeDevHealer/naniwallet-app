import React, { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
// import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, kycStatus, checkKYCStatus } = useAuth();
  const { wallet, clearWallet } = useWeb3Auth();
  const { locale } = useLocale();
  const backPressCount = useRef(0);

  // Check KYC status on component mount
  useEffect(() => {
    if (user) {
      checkKYCStatus();
    }
  }, [user, checkKYCStatus]);

  // Refresh KYC status whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('🔄 HomeScreen focused - refreshing KYC status');
        checkKYCStatus();
      }
    }, [user, checkKYCStatus])
  );

  const handleSignOut = async () => {
    try {
      // Clear wallet data first
      await clearWallet();
      // Then sign out from auth
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleBackPress = () => {
    if (backPressCount.current === 0) {
      backPressCount.current = 1;
      
      // Show toast message
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      }
      
      // Reset counter after 2 seconds
      setTimeout(() => {
        backPressCount.current = 0;
      }, 2000);
      
      return true; // Prevent default back action
    } else {
      // Second back press - exit app
      BackHandler.exitApp();
      return true;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
    };
  }, []);

  // Helper functions for KYC status
  const getKYCStatusText = (status: string | null) => {
    switch (status) {
      case 'approved':
        return t('kyc_verified', locale);
      case 'pending':
        return t('kyc_under_review', locale);
      case 'rejected':
        return t('kyc_rejected', locale);
      case 'notstarted':
      default:
        return t('kyc_pending', locale);
    }
  };

  const getKYCStatusDescription = (status: string | null) => {
    switch (status) {
      case 'approved':
        return t('kyc_verified', locale);
      case 'pending':
        return t('kyc_description_pending', locale);
      case 'rejected':
        return t('kyc_description_rejected', locale);
      case 'notstarted':
      default:
        return t('kyc_description_not_started', locale);
    }
  };

  const getKYCStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'rejected':
        return theme.colors.error;
      case 'notstarted':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getKYCStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'verified';
      case 'pending':
        return 'schedule';
      case 'rejected':
        return 'error';
      case 'notstarted':
      default:
        return 'warning';
    }
  };

  const isKYCApproved = kycStatus === 'approved';

  const handleKYCStatusPress = () => {
    if (!isKYCApproved && kycStatus !== 'pending') {
      navigation.navigate('KYCWelcome');
    }
  };

  const handleRestrictedAction = () => {
    Alert.alert(
      t('account_verification_required', locale),
      t('kyc_verification_message', locale),
      [
        {
          text: t('cancel', locale),
          style: 'cancel',
        },
        {
          text: t('start_verification', locale),
          onPress: handleKYCStatusPress,
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    greetingRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileButton: {
      marginRight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    greeting: {
      flex: 1,
    },
    greetingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: 8,
      marginLeft: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    walletSection: {
      marginBottom: 20,
    },
    walletSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    walletCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.25 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    walletInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    walletDetails: {
      marginLeft: 12,
      flex: 1,
    },
    walletTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    walletAddress: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    walletSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    welcomeCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.white,
      marginBottom: 8,
    },
    welcomeText: {
      fontSize: 16,
      color: theme.colors.white,
      opacity: 0.9,
      lineHeight: 24,
    },
    quickActions: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    userInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    userInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    userInfoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    userInfoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    themeSection: {
      marginBottom: 24,
    },
    themeButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    themeButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    kycStatusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    kycStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kycStatusLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    kycStatusIcon: {
      marginRight: 12,
    },
    kycStatusInfo: {
      flex: 1,
    },
    kycStatusTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    kycStatusText: {
      fontSize: 14,
      fontWeight: '500',
    },
    kycStatusDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    kycBanner: {
      backgroundColor: theme.colors.warning + '20',
      borderColor: theme.colors.warning,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    kycBannerText: {
      fontSize: 13,
      color: theme.colors.warning,
      fontWeight: '500',
      marginLeft: 8,
      flex: 1,
    },
    kycActionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: theme.colors.primary + '20',
    },
    kycActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    restrictedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    restrictedIcon: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: 4,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    restrictedContent: {
      opacity: 0.5,
    },
  });

  const quickActions = [
    { icon: 'account-balance-wallet', title: t('my_wallet', locale), color: theme.colors.primary, action: 'WalletDashboard' },
    { icon: 'send', title: t('send_money', locale), color: theme.colors.secondary, action: 'SelectSendToken' },
    { icon: 'add-circle', title: t('top_up', locale), color: theme.colors.success, action: 'TopUp' },
    { icon: 'calculate', title: t('zakat_calculator', locale), color: theme.colors.warning, action: 'ZakatCalculator' },
    { icon: 'trending-up', title: t('investments', locale), color: theme.colors.primary, action: 'Investments' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{t('welcome_back', locale)}</Text>
            <Text style={styles.userName}>
              {user?.fullName || user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
            <Icon name="notifications" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* KYC Warning Banner for non-approved users */}
        {!isKYCApproved && (
          <View style={styles.kycBanner}>
            <Icon name="info" size={20} color={theme.colors.warning} />
            <Text style={styles.kycBannerText}>
              {kycStatus === 'pending' 
                ? t('kyc_banner_pending', locale)
                : t('kyc_banner_not_started', locale)}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.kycStatusCard}
          onPress={handleKYCStatusPress}
          disabled={isKYCApproved || kycStatus === 'pending'}
          activeOpacity={isKYCApproved || kycStatus === 'pending' ? 1 : 0.7}
        >
          <View style={styles.kycStatusRow}>
            <View style={styles.kycStatusLeft}>
              <View style={styles.kycStatusIcon}>
                <Icon 
                  name={getKYCStatusIcon(kycStatus)} 
                  size={24} 
                  color={getKYCStatusColor(kycStatus)} 
                />
              </View>
              <View style={styles.kycStatusInfo}>
                <Text style={styles.kycStatusTitle}>{t('account_verification', locale)}</Text>
                <Text style={[styles.kycStatusText, { color: getKYCStatusColor(kycStatus) }]}>
                  {getKYCStatusText(kycStatus)}
                </Text>
                <Text style={styles.kycStatusDescription}>
                  {getKYCStatusDescription(kycStatus)}
                </Text>
              </View>
            </View>
            {!isKYCApproved && kycStatus !== 'pending' && (
              <TouchableOpacity style={styles.kycActionButton} onPress={handleKYCStatusPress}>
                <Text style={styles.kycActionText}>
                  {kycStatus === 'rejected' ? t('retry', locale) : t('start', locale)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>{t('nani_wallet_title', locale)}</Text>
          <Text style={styles.welcomeText}>
            {t('nani_wallet_description', locale)}
          </Text>
        </View>

        <View style={[styles.quickActions, !isKYCApproved && styles.restrictedContent]}>
          <Text style={styles.sectionTitle}>{t('quick_actions', locale)}</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionCard,
                  !isKYCApproved && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (!isKYCApproved) {
                    handleRestrictedAction();
                    return;
                  }
                  if (action.action) {
                    navigation.navigate(action.action);
                  }
                }}
                disabled={!isKYCApproved}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                {!isKYCApproved && (
                  <View style={styles.restrictedOverlay}>
                    <View style={styles.restrictedIcon}>
                      <Icon name="lock" size={16} color={theme.colors.textSecondary} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
};
