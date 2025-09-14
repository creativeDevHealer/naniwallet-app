import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWeb3Auth } from '../../context/Web3AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { clearWallet } = useWeb3Auth();
  const { locale } = useLocale();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    section: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    listItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    listIcon: {
      marginRight: 12,
    },
    listLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    profileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarInitial: { color: theme.colors.primary, fontWeight: '700', fontSize: 20 },
    emailText: { color: theme.colors.text, fontSize: 16 },
    signOutCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signOutRow: { flexDirection: 'row', alignItems: 'center' },
    signOutText: { color: theme.colors.error, fontSize: 16, fontWeight: '600', marginLeft: 8 },
  });

  const maskEmail = (email?: string): string => {
    if (!email) return '-';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const masked = name.length <= 2 ? name[0] + '*' : name.slice(0, 2) + '***';
    return `${masked}@${domain}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account', locale)}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile row */}
        <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('AccountProfile')}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.emailText}>{maskEmail(user?.email)}</Text>
          </View>
          <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>{t('settings', locale)}</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={styles.listItemLeft}>
              <Icon name="account-balance" size={22} color={theme.colors.text} style={styles.listIcon} />
              <Text style={styles.listLabel}>Payment methods</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('Preferences')}
          >
            <View style={styles.listItemLeft}>
              <Icon name="settings" size={22} color={theme.colors.text} style={styles.listIcon} />
              <Text style={styles.listLabel}>{t('preferences', locale)}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('Security')}
          >
            <View style={styles.listItemLeft}>
              <Icon name="lock" size={22} color={theme.colors.text} style={styles.listIcon} />
              <Text style={styles.listLabel}>{t('security', locale)}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={styles.listItemLeft}>
              <Icon name="notifications" size={22} color={theme.colors.text} style={styles.listIcon} />
              <Text style={styles.listLabel}>{t('notifications', locale)}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 4 }}>
          <TouchableOpacity
            style={styles.signOutCard}
            activeOpacity={0.85}
            onPress={async () => { 
              try { 
                // Clear wallet data first
                await clearWallet();
                // Then sign out from auth
                await signOut(); 
              } catch {} 
            }}
          >
            <View style={styles.signOutRow}>
              <Icon name="logout" size={20} color={theme.colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


