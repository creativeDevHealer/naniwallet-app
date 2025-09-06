import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

// Email configuration (you'll need to set these in Firebase Functions config)
const EMAIL_CONFIG = {
  service: 'gmail', // or your email service
  auth: {
    user: functions.config().email?.user || 'your-email@gmail.com',
    pass: functions.config().email?.password || 'your-app-password',
  },
};

// Create Nodemailer transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

export const sendOTPEmail = functions.https.onCall(async (data, context) => {
  try {
    const { email, otp } = data;

    // Validate input
    if (!email || !otp) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email and OTP are required'
      );
    }

    // Email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Nani Wallet - Email Verification</title>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: #2E7D32; color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 40px; text-align: center; }
              .otp-box { background: #F0F2F5; border: 2px solid #2E7D32; border-radius: 12px; padding: 20px; margin: 30px 0; display: inline-block; }
              .otp-code { font-size: 32px; font-weight: bold; color: #2E7D32; letter-spacing: 8px; margin: 0; }
              .message { color: #666; line-height: 1.6; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
              .logo { width: 60px; height: 60px; background: #2E7D32; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">NW</div>
                  <h1>Nani Wallet</h1>
                  <p>Email Verification</p>
              </div>
              
              <div class="content">
                  <h2>Verify Your Email Address</h2>
                  <p class="message">
                      Thank you for joining Nani Wallet! Please use the verification code below to complete your account setup.
                  </p>
                  
                  <div class="otp-box">
                      <p class="otp-code">${otp}</p>
                  </div>
                  
                  <p class="message">
                      This code will expire in <strong>5 minutes</strong>.<br>
                      If you didn't request this verification, please ignore this email.
                  </p>
              </div>
              
              <div class="footer">
                  <p>© 2024 Nani Wallet - Secure and Halal Financial Management</p>
                  <p>This is an automated message, please do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"Nani Wallet" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: 'Nani Wallet - Email Verification Code',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'OTP email sent successfully',
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send OTP email'
    );
  }
});

// Optional: Function to clean up expired OTPs (can be scheduled)
export const cleanupExpiredOTPs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const expiryTime = 5 * 60 * 1000; // 5 minutes
      const cutoffTime = Date.now() - expiryTime;

      const expiredOTPs = await admin
        .firestore()
        .collection('emailOTPs')
        .where('timestamp', '<', cutoffTime)
        .get();

      const batch = admin.firestore().batch();
      expiredOTPs.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${expiredOTPs.docs.length} expired OTPs`);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  });
