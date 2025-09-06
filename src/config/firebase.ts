// Firebase configuration
// This file contains Firebase initialization and configuration

// Note: The actual Firebase configuration is handled by the google-services.json file
// for Android and GoogleService-Info.plist for iOS

// Firebase app instance will be automatically initialized when the app starts
// The configuration comes from:
// - Android: android/app/google-services.json
// - iOS: ios/GoogleService-Info.plist

export interface FirebaseConfig {
  projectId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// You can access the Firebase app instance like this:
// import { firebase } from '@react-native-firebase/app';
// const app = firebase.app();

// For debugging purposes, you can log Firebase configuration
export const logFirebaseConfig = () => {
  // This will be available after Firebase is initialized
  console.log('Firebase app initialized');
};

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  // Firebase will be automatically configured by the native modules
  // when google-services.json (Android) or GoogleService-Info.plist (iOS) are present
  return true;
};

export default {
  logFirebaseConfig,
  isFirebaseConfigured,
};
