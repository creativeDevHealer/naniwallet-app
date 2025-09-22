import AsyncStorage from '@react-native-async-storage/async-storage';
import BackendOTPService from './backendOTPService';

export interface KYCStatus {
  success: boolean;
  kycStatus: 'notstarted' | 'pending' | 'approved' | 'rejected';
  kyc: {
    status: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    verificationNotes?: string;
  } | null;
}

class KYCService {
  private static instance: KYCService;
  private backendService: BackendOTPService;

  private constructor() {
    this.backendService = BackendOTPService.getInstance();
  }

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  /**
   * Get KYC status for the current user
   */
  async getKYCStatus(): Promise<KYCStatus> {
    try {
      let token = await AsyncStorage.getItem('authToken');
      
      // If no auth token, check for pending account data (during sign-up flow)
      if (!token) {
        const pendingAccountData = await AsyncStorage.getItem('pendingAccountData');
        if (pendingAccountData) {
          const accountData = JSON.parse(pendingAccountData);
          token = accountData.token;
        }
      }
      
      if (!token) {
        throw new Error('No auth token found');
      }

      const config = this.backendService.getConfig();
      const response = await fetch(`${config.baseUrl}/kyc/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 KYC Status Response:', result);

      return {
        success: result.success,
        kycStatus: result.kycStatus || 'notstarted',
        kyc: result.kyc
      };

    } catch (error) {
      console.error('❌ Failed to get KYC status:', error);
      return {
        success: false,
        kycStatus: 'notstarted',
        kyc: null
      };
    }
  }

  /**
   * Submit KYC information
   */
  async submitKYC(personalInfo: any, documentType: string, frontImage: any, backImage?: any): Promise<any> {
    try {
      console.log('🔍 KYC Submit: Checking for auth token...');
      let token = await AsyncStorage.getItem('authToken');
      console.log('🔍 KYC Submit: Auth token found:', token ? 'YES' : 'NO');
      
      // If no auth token, check for pending account data (during sign-up flow)
      if (!token) {
        console.log('🔍 KYC Submit: Checking for pending account data...');
        const pendingAccountData = await AsyncStorage.getItem('pendingAccountData');
        if (pendingAccountData) {
          const accountData = JSON.parse(pendingAccountData);
          token = accountData.token;
          console.log('🔍 KYC Submit: Using token from pending account data');
        }
      }
      
      if (!token) {
        console.error('❌ KYC Submit: No auth token found in AsyncStorage or pending data');
        // Let's also check what keys are available
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('📋 Available AsyncStorage keys:', allKeys);
        throw new Error('No auth token found. Please sign in again.');
      }

      const formData = new FormData();
      
      console.log('📋 KYC Submit: Personal info data:', personalInfo);
      console.log('📋 KYC Submit: Document type:', documentType);
      
      formData.append('personalInfo', JSON.stringify(personalInfo));
      formData.append('documentType', documentType);
      
      // Handle image format - convert URI to file object if needed
      if (typeof frontImage === 'string') {
        // If frontImage is a URI string, create a file object
        formData.append('frontImage', {
          uri: frontImage,
          type: 'image/jpeg',
          name: 'front-document.jpg',
        } as any);
      } else {
        formData.append('frontImage', frontImage);
      }
      
      if (backImage) {
        if (typeof backImage === 'string') {
          // If backImage is a URI string, create a file object
          formData.append('backImage', {
            uri: backImage,
            type: 'image/jpeg',
            name: 'back-document.jpg',
          } as any);
        } else {
          formData.append('backImage', backImage);
        }
      }

      const config = this.backendService.getConfig();
      console.log('🌐 KYC Submit: Making request to:', `${config.baseUrl}/kyc/submit`);

      console.log(formData);
      console.log(token);      
      const response = await fetch(`${config.baseUrl}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let fetch set it automatically with boundary
        },
        body: formData
      });


      console.log('📡 KYC Submit: Response status:', response.status);

      if (!response.ok) {
        // Get the error details from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('❌ KYC Submit: Error response:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.log('❌ KYC Submit: Could not parse error response');
          const errorText = await response.text();
          console.log('❌ KYC Submit: Raw error response:', errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ KYC Submission Response:', result);

      return result;

    } catch (error) {
      console.error('❌ Failed to submit KYC:', error);
      throw error;
    }
  }
}

export default KYCService;