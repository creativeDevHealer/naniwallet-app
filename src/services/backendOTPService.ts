import { Platform } from 'react-native';

/**
 * Backend OTP Service
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 
 * 1. Backend Server Setup:
 *    - Create a Node.js/Express server on port 3000
 *    - Implement these endpoints:
 *      • POST /api/otp/send - Send OTP via email
 *      • POST /api/otp/verify - Verify OTP code
 * 
 * 2. Network Configuration:
 *    - Android Emulator: Uses 10.0.2.2:3000 (automatic)
 *    - iOS Simulator: Uses localhost:3000 (automatic)
 *    - Physical Device: Call setDeviceUrl('YOUR_COMPUTER_IP:3000')
 * 
 * 3. Find Your Computer's IP:
 *    - Windows: Run 'ipconfig' in CMD, look for IPv4 Address
 *    - Mac/Linux: Run 'ifconfig' or 'ip addr show'
 *    - Example: 192.168.1.100
 * 
 * 4. Usage for Physical Device:
 *    const service = BackendOTPService.getInstance();
 *    service.setDeviceUrl('192.168.1.100:3000');
 */

interface BackendOTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface BackendConfig {
  baseUrl: string;
  apiKey?: string;
}

class BackendOTPService {
  private static instance: BackendOTPService;
  private config: BackendConfig;

  private constructor() {
    // Configure your backend URL here
    // For Android emulator: use 10.0.2.2 instead of localhost
    // For iOS simulator: use localhost (works) or your computer's IP
    // For physical device: use your computer's IP address (e.g., 192.168.1.100)
    
    let baseUrl = 'https://antihuman-harvey-cupulate.ngrok-free.app/api';
    
    if (Platform.OS === 'android') {
      // Android emulator maps 10.0.2.2 to the host machine's localhost
      baseUrl = 'https://antihuman-harvey-cupulate.ngrok-free.app/api';
    }
    
    this.config = {
      baseUrl,
    };
    
    console.log(`🔧 Backend configured for ${Platform.OS}:`, baseUrl);
  }

  public static getInstance(): BackendOTPService {
    if (!BackendOTPService.instance) {
      BackendOTPService.instance = new BackendOTPService();
    }
    return BackendOTPService.instance;
  }

  /**
   * Get backend configuration
   */
  public getConfig(): BackendConfig {
    return this.config;
  }

  /**
   * Configure backend settings
   */
  public configure(config: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 Backend reconfigured:', this.config.baseUrl);
  }

  /**
   * Set backend URL for physical device (use your computer's IP address)
   * Example: setDeviceUrl('192.168.1.100:3000')
   */
  public setDeviceUrl(hostIP: string): void {
    this.config.baseUrl = `http://${hostIP}/api`;
    console.log('📱 Backend configured for physical device:', this.config.baseUrl);
  }

  /**
   * Make HTTP request to backend
   */
  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    data?: any
  ): Promise<BackendOTPResponse> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      console.log(`🌐 Making ${method} request to:`, url);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ Backend request failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Backend request failed';
      
      if (error.message === 'Network request failed') {
        errorMessage = 'Unable to connect to server. Please check:\n' +
          '1. Backend server is running on port 3000\n' +
          '2. Network connection is working\n' +
          '3. Firewall is not blocking the connection';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your network connection.';
      } else if (error.message.includes('HTTP')) {
        errorMessage = `Server error: ${error.message}`;
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      // Return error in expected format
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Send OTP to user's email via backend
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Sending OTP request to backend for:', email);

      const response = await this.makeRequest('/otp/send', 'POST', {
        email: email,
        type: 'signup', // Optional: specify OTP type
      });

      console.log(response);

      return {
        success: response.success,
        message: response.message || 'OTP sent successfully',
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
   * Verify OTP with backend
   */
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Verifying OTP with backend for:', email);

      const response = await this.makeRequest('/otp/verify', 'POST', {
        email: email,
        otp: otp,
      });

      return {
        success: response.success,
        message: response.message || 'OTP verified successfully',
      };
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP. Please try again.',
      };
    }
  }

  /**
   * Resend OTP via backend
   */
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Resending OTP via backend for:', email);

      const response = await this.makeRequest('/otp/send', 'POST', {
        email: email,
      });

      return {
        success: response.success,
        message: response.message || 'OTP resent successfully',
      };
    } catch (error: any) {
      console.error('❌ Error resending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend OTP. Please try again.',
      };
    }
  }
}

export default BackendOTPService;
