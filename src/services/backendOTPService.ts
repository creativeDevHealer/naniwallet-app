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
    this.config = {
      baseUrl: 'https://your-backend-api.com/api', // Replace with your backend URL
    };
  }

  public static getInstance(): BackendOTPService {
    if (!BackendOTPService.instance) {
      BackendOTPService.instance = new BackendOTPService();
    }
    return BackendOTPService.instance;
  }

  /**
   * Configure backend settings
   */
  public configure(config: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...config };
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
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);
      
      return result;
    } catch (error: any) {
      console.error('❌ Backend request failed:', error);
      
      // Return error in expected format
      return {
        success: false,
        message: error.message || 'Backend request failed',
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

      const response = await this.makeRequest('/otp/resend', 'POST', {
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
