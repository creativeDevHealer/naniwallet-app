import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackendOTPService from '../../services/backendOTPService';

interface EmailOTPVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      password: string;
      fullName: string;
      acceptTerms: boolean;
    };
  };
}

const { width, height } = Dimensions.get('window');

export const EmailOTPVerificationScreen: React.FC<EmailOTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { signUp, updateProfile } = useAuth();
  const { email, password, fullName, acceptTerms } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showModal, setShowModal] = useState(true);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto focus previous input on backspace
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP using Backend service
      const backendOTPService = BackendOTPService.getInstance();
      const verificationResult = await backendOTPService.verifyOTP(email, otpCode);
      
      if (verificationResult.success) {
        // Create the Firebase account after OTP verification
        await signUp(email, password);
        
        // Update profile with full name
        await updateProfile(fullName);
        
        // Account created successfully - Firebase auth will handle navigation
        Alert.alert('Success', 'Your account has been created successfully!');
      } else {
        Alert.alert('Verification Failed', verificationResult.message);
        
        // If it's an attempts error, clear the form
        if (verificationResult.message.includes('Maximum attempts exceeded')) {
          setCode(['', '', '', '', '', '']);
        }
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Clear current OTP inputs
      setCode(['', '', '', '', '', '']);
      
      // Resend OTP using Backend service
      const backendOTPService = BackendOTPService.getInstance();
      const result = await backendOTPService.resendOTP(email);
      
      if (result.success) {
        setTimer(30);
        setCanResend(false);
        Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
      } else {
        Alert.alert('Failed to Resend', result.message);
      }
    } catch (error: any) {
      Alert.alert('Failed to Resend', error.message || 'Please try again.');
    }
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const visibleChars = username.slice(0, 2);
    const hiddenChars = '*'.repeat(Math.max(0, username.length - 2));
    return `${visibleChars}${hiddenChars}@${domain}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 32,
      width: width * 0.9,
      maxWidth: 400,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: theme.isDark ? 0.25 : 0.4,
      shadowRadius: 24,
      elevation: 20,
      borderWidth: theme.isDark ? 0 : 1,
      borderColor: theme.isDark ? 'transparent' : theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      alignItems: 'center',
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
      marginBottom: 32,
    },
    email: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    codeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 32,
      paddingHorizontal: 8,
    },
    codeInput: {
      width: 45,
      height: 50,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginHorizontal: 4,
    },
    codeInputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    codeInputFilled: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 25,
      paddingVertical: 18,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      minHeight: 54,
    },
    verifyButtonDisabled: {
      backgroundColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    verifyButtonText: {
      color: theme.colors.white,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    verifyButtonTextDisabled: {
      color: theme.colors.textSecondary,
      fontSize: 18,
      fontWeight: '600',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      minHeight: 40,
    },
    timerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 8,
    },
    timerValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      minWidth: 35,
      textAlign: 'center',
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: 24,
      minHeight: 40,
    },
    resendText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    resendButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    resendButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={styles.container}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Verify Your Email</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Enter Your{'\n'}Verification Code</Text>
              <Text style={styles.subtitle}>
                Enter the OTP code that we have sent to your email{' '}
                <Text style={styles.email}>{formatEmail(email)}</Text>
              </Text>


              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    placeholder=""
                    placeholderTextColor={theme.colors.textSecondary}
                    textContentType="oneTimeCode"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  code.join('').length !== 6 && styles.verifyButtonDisabled
                ]}
                onPress={handleVerifyCode}
                disabled={isLoading || code.join('').length !== 6}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.verifyButtonText,
                    code.join('').length !== 6 && styles.verifyButtonTextDisabled
                  ]}>
                    Verify
                  </Text>
                )}
              </TouchableOpacity>

              {timer > 0 ? (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>Resend OTP in</Text>
                  <Text style={styles.timerValue}>00:{timer.toString().padStart(2, '0')}</Text>
                </View>
              ) : (
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code?</Text>
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendCode}
                  >
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
