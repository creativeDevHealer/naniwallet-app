import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { t } from '../../i18n';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface SignInScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showModal] = useState(true);

  // Handle Android back button to exit app
  useEffect(() => {
    const backAction = () => {
      Alert.alert(t('exit_app', locale), t('exit_app_confirm', locale), [
        {
          text: t('cancel', locale),
          onPress: () => null,
          style: 'cancel',
        },
        { text: t('yes', locale).toUpperCase(), onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert(t('sign_in_failed', locale), error.message);
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
      maxHeight: height * 0.85,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: theme.isDark ? 0.25 : 0.4,
      shadowRadius: 24,
      elevation: 20,
      borderWidth: theme.isDark ? 0 : 1,
      borderColor: theme.isDark ? 'transparent' : theme.colors.border,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    form: {
      marginBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    signInButton: {
      marginBottom: 24,
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
        animationType="fade"
        onRequestClose={() => {
          // Handle hardware back button on Android - exit app
          Alert.alert('Exit App', 'Are you sure you want to exit?', [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            { text: 'YES', onPress: () => BackHandler.exitApp() },
          ]);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('sign_in', locale)}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('email', locale)}</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('input_email_placeholder', locale)}
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
                  placeholder={t('enter_password_placeholder', locale)}
                  secureTextEntry
                  error={errors.password}
                />
              </View>

              <View style={styles.signInButton}>
                <Button
                  title={t('sign_in', locale)}
                  onPress={handleEmailSignIn}
                  loading={isLoading}
                  fullWidth
                  size="large"
                />
              </View>
            </View>


            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('no_account', locale)}{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  {t('create_one', locale)}
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};