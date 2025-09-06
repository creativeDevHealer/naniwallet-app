import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch, 
  query, 
  where, 
  getDocs 
} from '@react-native-firebase/firestore';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getApp } from '@react-native-firebase/app';

interface OTPData {
  email: string;
  otp: string;
  timestamp: number;
  attempts: number;
  verified: boolean;
}

class EmailOTPService {
  private static instance: EmailOTPService;
  private readonly OTP_EXPIRY_MINUTES = 5; // OTP expires in 5 minutes
  private readonly MAX_ATTEMPTS = 3; // Maximum verification attempts
  private tempOTPStorage: Map<string, { otp: string; timestamp: number; attempts: number }> | undefined;

  public static getInstance(): EmailOTPService {
    if (!EmailOTPService.instance) {
      EmailOTPService.instance = new EmailOTPService();
    }
    return EmailOTPService.instance;
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user's email via Firebase Functions
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Starting OTP send process for:', email);
      
      // Generate new OTP
      const otp = this.generateOTP();
      const timestamp = Date.now();
      
      console.log('🔢 Generated OTP:', otp);

      // Get Firestore instance
      const db = getFirestore(getApp());
      console.log('🔥 Firestore instance obtained');

      // Store OTP in Firestore with timeout and error handling
      try {
        console.log('💾 Attempting to store OTP in Firestore...');
        const otpDocRef = doc(collection(db, 'emailOTPs'), email);
        
        // Add timeout to prevent hanging
        const storePromise = setDoc(otpDocRef, {
          email,
          otp,
          timestamp,
          attempts: 0,
          verified: false,
        });
        
        // 10-second timeout for Firestore operation
        await Promise.race([
          storePromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore timeout')), 10000)
          )
        ]);
        
        console.log('✅ OTP stored in Firestore successfully');
      } catch (firestoreError: any) {
        console.warn('⚠️ Firestore storage failed (continuing without it):', firestoreError.message);
        console.log('📝 This is normal if Firestore isn\'t set up yet');
      }

      // For testing: Show OTP in console (remove in production)
      console.log('🚀 TESTING MODE - OTP Code:', otp);
      console.log('📱 Use this code in the verification screen');

      // Try to call Firebase Function, but don't fail if it doesn't exist
      try {
        console.log('📨 Attempting to send email via Firebase Functions...');
        const functions = getFunctions(getApp());
        const sendEmailFunction = httpsCallable(functions, 'sendOTPEmail');
        const result = await sendEmailFunction({
          email,
          otp,
        });
        console.log('✅ Email sent successfully via Firebase Functions:', result.data);
      } catch (functionError: any) {
        console.warn('⚠️ Firebase Function not available (this is normal during development):', functionError.message);
        console.log('📧 Email sending skipped - using console OTP for testing');
      }

      // Store OTP in memory for testing (fallback)
      this.tempOTPStorage = this.tempOTPStorage || new Map();
      this.tempOTPStorage.set(email, { otp, timestamp, attempts: 0 });
      console.log('💭 OTP also stored in memory for testing');

      return {
        success: true,
        message: `OTP generated successfully! Check console for code: ${otp}`,
      };
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.',
      };
    }
  }

  /**
   * Verify OTP entered by user
   */
  async verifyOTP(email: string, userOTP: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Starting OTP verification for:', email);
      console.log('🔢 User entered OTP:', userOTP);
      
      let otpData: OTPData | null = null;

      // Try Firestore first
      try {
        console.log('📊 Checking Firestore for OTP...');
        const db = getFirestore(getApp());
        const otpDocRef = doc(collection(db, 'emailOTPs'), email);
        const otpDoc = await getDoc(otpDocRef);

        if (otpDoc.exists()) {
          otpData = otpDoc.data() as OTPData;
          console.log('✅ Found OTP in Firestore');
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore read failed, checking memory storage');
      }

      // Fallback to memory storage
      if (!otpData && this.tempOTPStorage?.has(email)) {
        const memoryData = this.tempOTPStorage.get(email)!;
        otpData = {
          email,
          otp: memoryData.otp,
          timestamp: memoryData.timestamp,
          attempts: memoryData.attempts,
          verified: false,
        };
        console.log('✅ Found OTP in memory storage');
      }

      if (!otpData) {
        console.log('❌ No OTP found in any storage');
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.',
        };
      }

      // Check if already verified
      if (otpData.verified) {
        return {
          success: false,
          message: 'OTP already used. Please request a new one.',
        };
      }

      // Check expiry
      const currentTime = Date.now();
      const otpAge = currentTime - otpData.timestamp;
      const expiryTime = this.OTP_EXPIRY_MINUTES * 60 * 1000;

      if (otpAge > expiryTime) {
        // Delete expired OTP
        await deleteDoc(otpDocRef);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Check attempts
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        // Delete OTP after max attempts
        await deleteDoc(otpDocRef);
        return {
          success: false,
          message: 'Maximum attempts exceeded. Please request a new OTP.',
        };
      }

      // Verify OTP
      console.log('🔐 Comparing OTPs - Expected:', otpData.otp, 'Got:', userOTP);
      
      if (otpData.otp === userOTP) {
        console.log('✅ OTP verification successful!');
        
        // Clean up - try Firestore first, then memory
        try {
          const db = getFirestore(getApp());
          const otpDocRef = doc(collection(db, 'emailOTPs'), email);
          await deleteDoc(otpDocRef);
          console.log('🗑️ Deleted OTP from Firestore');
        } catch (error) {
          console.log('⚠️ Firestore cleanup failed (normal if not configured)');
        }
        
        // Clean up memory storage
        if (this.tempOTPStorage?.has(email)) {
          this.tempOTPStorage.delete(email);
          console.log('🗑️ Deleted OTP from memory');
        }
        
        return {
          success: true,
          message: 'OTP verified successfully!',
        };
      } else {
        console.log('❌ OTP verification failed');
        
        // Increment attempts
        otpData.attempts += 1;
        
        // Update storage
        try {
          const db = getFirestore(getApp());
          const otpDocRef = doc(collection(db, 'emailOTPs'), email);
          await updateDoc(otpDocRef, {
            attempts: otpData.attempts,
          });
        } catch (error) {
          // Update memory storage
          if (this.tempOTPStorage?.has(email)) {
            const memoryData = this.tempOTPStorage.get(email)!;
            memoryData.attempts = otpData.attempts;
          }
        }

        return {
          success: false,
          message: `Invalid OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.`,
        };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP. Please try again.',
      };
    }
  }

  /**
   * Clean up expired OTPs (can be called periodically)
   */
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const expiryTime = this.OTP_EXPIRY_MINUTES * 60 * 1000;
      const cutoffTime = Date.now() - expiryTime;

      // Get Firestore instance
      const db = getFirestore(getApp());
      
      // Query expired OTPs
      const emailOTPsCollection = collection(db, 'emailOTPs');
      const expiredQuery = query(emailOTPsCollection, where('timestamp', '<', cutoffTime));
      const expiredOTPs = await getDocs(expiredQuery);

      // Create batch for deletion
      const batch = writeBatch(db);
      expiredOTPs.docs.forEach((docSnapshot: any) => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${expiredOTPs.docs.length} expired OTPs`);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export default EmailOTPService;
