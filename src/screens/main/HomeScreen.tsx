import React, { useEffect, useRef } from 'react';
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
  const { user, signOut } = useAuth();
  const { wallet } = useWeb3Auth();
  const { locale } = useLocale();
  const backPressCount = useRef(0);

  const handleSignOut = async () => {
    try {
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
  });

  const quickActions = [
    { icon: 'account-balance-wallet', title: 'My Wallet', color: theme.colors.primary },
    { icon: 'send', title: 'Send Money', color: theme.colors.secondary },
    { icon: 'receipt', title: 'Transactions', color: theme.colors.info },
    { icon: 'calculate', title: 'Zakat Calculator', color: theme.colors.success },
    { icon: 'people', title: 'Ayuto Groups', color: theme.colors.warning },
    { icon: 'trending-up', title: 'Investments', color: theme.colors.primary },
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

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Nani Wallet</Text>
          <Text style={styles.welcomeText}>
            Your trusted partner for Halal financial management and Islamic banking solutions.
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>{t('quick_actions', locale)}</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => {
                  if (action.title === 'My Wallet') {
                    navigation.navigate('WalletDashboard');
                  }
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
};
