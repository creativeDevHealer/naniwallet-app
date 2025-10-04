import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t, isRTL, getTextAlign } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError(t('email_required'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('email_invalid'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert(t('reset_failed'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      paddingTop: 40,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    icon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    form: {
      marginBottom: 32,
    },
    successContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    successMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    emailText: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    footer: {
      alignItems: 'center',
      paddingBottom: 24,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    footerLink: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign: getTextAlign('center') }]}>
            {t('reset_password')}
          </Text>
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="email" size={40} color={theme.colors.success} />
          </View>
          <Text style={[styles.successTitle, { textAlign: getTextAlign('center') }]}>
            {t('check_your_email')}
          </Text>
          <Text style={[styles.successMessage, { textAlign: getTextAlign('center') }]}>
            {t('password_reset_link_sent')}{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Button
            title={t('back_to_sign_in')}
            onPress={() => navigation.navigate('SignIn')}
            fullWidth
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Didn't receive the email? Check your spam folder or{' '}
            <Text
              style={styles.footerLink}
              onPress={() => setEmailSent(false)}
            >
              try again
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: getTextAlign('center') }]}>
          {t('reset_password')}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <Icon name="lock-reset" size={40} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { textAlign: getTextAlign('center') }]}>
          {t('forgot_password')}
        </Text>
        <Text style={[styles.subtitle, { textAlign: getTextAlign('center') }]}>
          {t('forgot_password_description')}
        </Text>

        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            placeholder={t('enter_email_placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
            error={error}
            autoFocus
          />

          <Button
            title={t('send_reset_link')}
            onPress={handleResetPassword}
            loading={isLoading}
            fullWidth
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember your password?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate('SignIn')}
            >
              Back to Sign In
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
