import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackendOTPService from '../services/backendOTPService';
import { navigate } from '../navigation/navigationRef';

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  needsWalletSetup: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName?: string, photoURL?: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  verifyOTPAndCreateAccount: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyPhoneOTP: (phoneNumber: string, otp: string) => Promise<void>;
  verifyPhoneOTPAndCreateAccount: (email: string, password: string, fullName: string, phoneNumber: string, otp: string) => Promise<void>;
  completeWalletSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsWalletSetup, setNeedsWalletSetup] = useState(false);

  useEffect(() => {
    // Check for existing authentication token on app start
    checkAuthToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const walletSetupCompleted = await AsyncStorage.getItem('walletSetupCompleted');
      
      if (token && userData) {
        // Verify token is still valid with backend
        const isValid = await verifyTokenWithBackend(token);
        if (isValid) {
          setUser(JSON.parse(userData));
          
          // Check if user has a wallet
          // Support multi-wallets: check 'wallets'
          const walletsJson = await AsyncStorage.getItem('wallets');
          if (!walletsJson) {
            console.log('🔍 No wallet found for existing user, setting needsWalletSetup to true');
            setNeedsWalletSetup(true);
          } else {
            console.log('🔍 Wallet found for existing user, checking wallet setup completion');
            // Check if wallet setup is completed (for existing users who might have skipped)
            setNeedsWalletSetup(walletSetupCompleted !== 'true');
          }
        } else {
          // Token expired, clear storage
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const verifyTokenWithBackend = async (token: string): Promise<boolean> => {
    try {
      const backendOTPService = BackendOTPService.getInstance();
      const response = await fetch(`${backendOTPService.getConfig().baseUrl}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update user data with fresh data from backend
          setUser(result.user);
          await AsyncStorage.setItem('userData', JSON.stringify(result.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  const clearAuthData = async () => {
    // Keep 'walletInfo' on device so the non-custodial wallet remains connected across sign-outs.
    await AsyncStorage.multiRemove(['authToken', 'userData', 'walletSetupCompleted']);
    setUser(null);
    setNeedsWalletSetup(false);
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      console.log('📧 Starting signup process for:', email);
      
      // Send OTP for email verification
      const backendOTPService = BackendOTPService.getInstance();
      const result = await backendOTPService.sendOTP(email);
      
      if (!result.success) {
        console.log('❌ OTP send failed:', result.message);
        throw new Error(result.message);
      }
      
      console.log('✅ OTP sent successfully');
      
      // Store signup data temporarily for OTP verification
      const tempData = {
        email,
        password,
        fullName
      };
      
      await AsyncStorage.setItem('tempSignupData', JSON.stringify(tempData));
      console.log('💾 Temporary signup data stored:', tempData);
      
      // Verify the data was stored correctly
      const storedData = await AsyncStorage.getItem('tempSignupData');
      console.log('✅ Verification - stored data:', storedData);
      console.log('✅ Verification - data matches:', storedData === JSON.stringify(tempData));
    } catch (error: any) {
      console.log('❌ Signup error:', error.message);
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const backendOTPService = BackendOTPService.getInstance();
      console.log('🔐 Attempting sign in for:', email);
      console.log('🌐 Backend URL:', `${backendOTPService.getConfig().baseUrl}/auth/login`);
      
      const response = await fetch(`${backendOTPService.getConfig().baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('❌ Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Store auth data
      await AsyncStorage.setItem('authToken', result.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      
      setUser(result.user);
      console.log('✅ Sign in successful for user:', result.user);
      
      // Check if user has a wallet
      const walletsJson = await AsyncStorage.getItem('wallets');
      if (!walletsJson) {
        console.log('🔍 No wallet found for user, setting needsWalletSetup to true');
        setNeedsWalletSetup(true);
      } else {
        console.log('🔍 Wallet found for user, wallet setup not needed');
        setNeedsWalletSetup(false);
      }
    } catch (error: any) {
      console.log('❌ Sign in error:', error);
      throw new Error(error.message);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await clearAuthData();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (_email: string): Promise<void> => {
    try {
      // TODO: Implement password reset through backend
      throw new Error('Password reset not implemented yet');
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateProfile = async (fullName?: string, photoURL?: string): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const backendOTPService = BackendOTPService.getInstance();
      const response = await fetch(`${backendOTPService.getConfig().baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          photoURL
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Profile update failed');
      }

      // Update local user data
      setUser(result.user);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      const backendOTPService = BackendOTPService.getInstance();
      const result = await backendOTPService.verifyOTP(email, otp);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Just verify OTP, don't create account or log in
      // This is used for password reset or other OTP verifications
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const verifyOTPAndCreateAccount = async (email: string, otp: string): Promise<void> => {
    try {
      console.log('🔍 Starting OTP verification and account creation for:', email);
      
      // Debug: Check all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔑 All AsyncStorage keys:', allKeys);
      
      // Debug: Check if tempSignupData exists
      const tempData = await AsyncStorage.getItem('tempSignupData');
      console.log('📦 Temp signup data found:', tempData ? 'YES' : 'NO');
      console.log('📦 Temp signup data content:', tempData);
      
      const backendOTPService = BackendOTPService.getInstance();
      const result = await backendOTPService.verifyOTP(email, otp);
      
      if (!result.success) {
        console.log('❌ OTP verification failed:', result.message);
        throw new Error(result.message);
      }

      console.log('✅ OTP verified successfully');

      // Get temporary signup data again after OTP verification
      const tempDataAfterOTP = await AsyncStorage.getItem('tempSignupData');
      console.log('📦 Temp signup data after OTP verification:', tempDataAfterOTP ? 'YES' : 'NO');
      console.log('📦 Temp signup data content after OTP:', tempDataAfterOTP);
      
      if (tempDataAfterOTP) {
        const { email: signupEmail, password, fullName } = JSON.parse(tempDataAfterOTP);
        console.log('📱 Email OTP verified, preparing for phone verification for:', signupEmail);
        
        // Store verified email data for phone verification
        await AsyncStorage.setItem('emailVerifiedData', JSON.stringify({
          email: signupEmail,
          password,
          fullName,
          emailOtpVerified: true
        }));
        
        console.log('✅ Email verification complete, ready for phone OTP');
      } else {
        console.log('❌ No temporary signup data found after OTP verification');
        console.log('🔍 Available AsyncStorage keys:', await AsyncStorage.getAllKeys());
        throw new Error('No signup data found. Please try signing up again.');
      }
    } catch (error: any) {
      console.log('❌ Error in verifyOTPAndCreateAccount:', error.message);
      throw new Error(error.message);
    }
  };

  const resendOTP = async (email: string): Promise<void> => {
    try {
      const backendOTPService = BackendOTPService.getInstance();
      const result = await backendOTPService.resendOTP(email);
      
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const sendPhoneOTP = async (phoneNumber: string): Promise<void> => {
    try {
      console.log('📱 Sending phone OTP to:', phoneNumber);
      
      const backendOTPService = BackendOTPService.getInstance();
      const url = `${backendOTPService.getConfig().baseUrl}/otp/send-phone`;
      console.log('🌐 Phone OTP URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });

      console.log('📡 Phone OTP response status:', response.status);
      console.log('📡 Phone OTP response headers:', response.headers);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Phone OTP error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('📄 Phone OTP raw response text:', responseText);
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ Phone OTP JSON parse error:', parseError);
        console.log('❌ Phone OTP response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Phone OTP parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send phone OTP');
      }
    } catch (error: any) {
      console.log('❌ Phone OTP send error:', error);
      throw new Error(error.message);
    }
  };

  const verifyPhoneOTP = async (phoneNumber: string, otp: string): Promise<void> => {
    try {
      console.log('🔐 Verifying phone OTP for:', phoneNumber);
      
      const backendOTPService = BackendOTPService.getInstance();
      const url = `${backendOTPService.getConfig().baseUrl}/otp/verify-phone`;
      console.log('🌐 Phone OTP verification URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, otp })
      });

      console.log('📡 Phone OTP verification response status:', response.status);
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Phone OTP verification error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('📄 Phone OTP verification raw response text:', responseText);
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('❌ Phone OTP verification JSON parse error:', parseError);
        console.log('❌ Phone OTP verification response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('✅ Phone OTP verification parsed response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Phone OTP verification failed');
      }
    } catch (error: any) {
      console.log('❌ Phone OTP verification error:', error);
      throw new Error(error.message);
    }
  };

  const verifyPhoneOTPAndCreateAccount = async (
    email: string, 
    password: string, 
    fullName: string, 
    phoneNumber: string, 
    otp: string
  ): Promise<void> => {
    try {
      console.log('🔐 Verifying phone OTP and creating account for:', email);
      
      // First verify the phone OTP
      await verifyPhoneOTP(phoneNumber, otp);
      
      // Get email verified data
      const emailVerifiedData = await AsyncStorage.getItem('emailVerifiedData');
      if (!emailVerifiedData) {
        throw new Error('Email verification data not found. Please start over.');
      }
      
      const { email: verifiedEmail, password: verifiedPassword, fullName: verifiedFullName } = JSON.parse(emailVerifiedData);
      
      // Create user account with phone number
      await createUserAccount(verifiedEmail, verifiedPassword, verifiedFullName, phoneNumber);
      
      // Clean up all temporary data
      await AsyncStorage.removeItem('tempSignupData');
      await AsyncStorage.removeItem('emailVerifiedData');
      
      console.log('✅ Account created successfully with phone verification');
    } catch (error: any) {
      console.log('❌ Phone OTP verification and account creation error:', error);
      throw new Error(error.message);
    }
  };

  const createUserAccount = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    try {
      console.log('🌐 Calling registration API for:', email);
      
      const backendOTPService = BackendOTPService.getInstance();
      const url = `${backendOTPService.getConfig().baseUrl}/auth/register`;
      console.log('📡 Registration URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phoneNumber
        })
      });

      console.log('📊 Registration response status:', response.status);
      
      const result = await response.json();
      console.log('📋 Registration response:', result);

      if (!result.success) {
        console.log('❌ Registration failed:', result.error);
        throw new Error(result.error || 'Registration failed');
      }

      console.log('✅ Registration successful');
      
      // Automatically log in the user after successful registration
      if (result.token && result.user) {
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Don't set walletSetupCompleted yet - user needs to complete wallet setup
        setUser(result.user);
        setNeedsWalletSetup(true); // User needs to complete wallet setup
        console.log('🔐 User automatically logged in after registration');
      }
      
      return {
        token: result.token,
        user: result.user
      };
    } catch (error: any) {
      console.log('❌ Registration error:', error.message);
      throw new Error(error.message || 'Failed to create user account');
    }
  };

  const completeWalletSetup = async () => {
    console.log('🔄 completeWalletSetup called - current needsWalletSetup:', needsWalletSetup);
    setNeedsWalletSetup(false);
    // Persist the wallet setup completion
    await AsyncStorage.setItem('walletSetupCompleted', 'true');
    console.log('✅ Wallet setup completed - needsWalletSetup set to false');
    console.log('🔍 Current user state:', user ? 'User logged in' : 'No user');
    console.log('🔍 Wallet setup completion saved to AsyncStorage');

    // Proactively navigate to Home once navigator is ready
    setTimeout(() => {
      try {
        navigate('Home');
      } catch (_e) {}
    }, 100);
  };

  const value: AuthContextType = {
    user,
    loading,
    needsWalletSetup,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    verifyOTP,
    verifyOTPAndCreateAccount,
    resendOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
    verifyPhoneOTPAndCreateAccount,
    completeWalletSetup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
