import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const HomeScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="settings" size={24} color={theme.colors.text} />
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Email</Text>
            <Text style={styles.userInfoValue}>{user?.email || 'Not provided'}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Phone</Text>
            <Text style={styles.userInfoValue}>{user?.phoneNumber || 'Not provided'}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Email Verified</Text>
            <Text style={styles.userInfoValue}>
              {user?.emailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.themeSection}>
          <Text style={styles.sectionTitle}>Theme Settings</Text>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>
              Toggle Theme ({theme.isDark ? 'Dark' : 'Light'})
            </Text>
            <Icon 
              name={theme.isDark ? 'light-mode' : 'dark-mode'} 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          size="large"
        />
      </ScrollView>
    </SafeAreaView>
  );
};
