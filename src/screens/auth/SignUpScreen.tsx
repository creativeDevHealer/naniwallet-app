import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { t, isRTL, getTextAlign } from '../../i18n';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
// BackendOTPService is now handled through AuthContext

interface SignUpScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showModal] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('full_name_required', locale);
    }

    if (!email.trim()) {
      newErrors.email = t('email_required', locale);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('email_invalid', locale);
    }

    if (!password.trim()) {
      newErrors.password = t('password_required', locale);
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length', locale);
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('confirm_password_required', locale);
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwords_no_match', locale);
    }

    if (!acceptTerms) {
      newErrors.terms = t('terms_required', locale);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('🚀 Starting signup process for:', email);
      
      // Use AuthContext signUp function to store temp data and send OTP
      await signUp(email, password, fullName);
      
      console.log('✅ SignUp function completed successfully');
      
      // Navigate to email OTP verification screen
      navigation.navigate('EmailOTPVerification', {
        email,
        password,
        fullName,
        acceptTerms,
      });
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      Alert.alert(t('failed_send_otp', locale), error.message || t('try_again_later', locale));
    } finally {
      setIsLoading(false);
    }
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backgroundOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.isDark ? theme.colors.primary : theme.colors.background,
      opacity: theme.isDark ? 0.1 : 1,
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 32,
      width: width * 0.9,
      maxWidth: 400,
      maxHeight: height * 0.9,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: theme.isDark ? 0.25 : 0.4,
      shadowRadius: 24,
      elevation: 20,
      borderWidth: theme.isDark ? 0 : 1,
      borderColor: theme.isDark ? 'transparent' : theme.colors.border,
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
      marginBottom: 16,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      top: 0,
      padding: 8,
      zIndex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    form: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    termsContainer: {
      flexDirection: isRTL(locale) ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginVertical: 16,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: 12,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      textAlign: getTextAlign(locale, 'left'),
      writingDirection: isRTL(locale) ? 'rtl' : 'ltr',
    },
    termsLink: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    signUpButton: {
      marginBottom: 32,
    },
    footer: {
      alignItems: 'center',
    },
    footerText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    footerLink: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOverlay} />
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => navigation.goBack()}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.title}>{t('create_account', locale)}</Text>
              <Text style={styles.subtitle}>
                {t('nani_wallet_description', locale)}
              </Text>
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('full_name', locale)}</Text>
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('enter_full_name_placeholder', locale)}
                  error={errors.fullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email_address', locale)}</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('enter_email_placeholder', locale)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('password', locale)}</Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('create_password_placeholder', locale)}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('confirm_password', locale)}</Text>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('confirm_password_placeholder', locale)}
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Text style={styles.checkboxText}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  {t('i_agree_to', locale)}{' '}
                  <Text style={styles.termsLink}>{t('terms_of_service', locale)}</Text> {t('and', locale)}{' '}
                  <Text style={styles.termsLink}>{t('privacy_policy', locale)}</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

              <View style={styles.signUpButton}>
                <Button
                  title={t('create_account', locale)}
                  onPress={handleEmailSignUp}
                  loading={isLoading}
                  fullWidth
                  size="large"
                />
              </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('have_account', locale)}{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('SignIn')}
                >
                  {t('sign_in_here', locale)}
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};