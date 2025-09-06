# Nani Wallet Setup Guide

## 🔥 Firebase Configuration

### Step 1: Set up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "Nani Wallet" or select an existing one
3. Enable Authentication and Firestore in your project

### Step 2: Add Android App
1. In Project Settings, click "Add app" → Android
2. Use package name: `com.naniwallet`
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### Step 3: Add iOS App (Future)
1. In Project Settings, click "Add app" → iOS  
2. Use bundle ID: `com.naniwallet`
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/naniwallet/GoogleService-Info.plist`

### Step 4: Enable Authentication Methods
In Firebase Console → Authentication → Sign-in method:
- ✅ Email/Password
- ✅ Phone (for OTP login)

## 📱 Installation & Setup

### Install Dependencies
```bash
npm install @react-native-async-storage/async-storage
```

### Android Setup
For AsyncStorage, add to `android/app/src/main/java/.../MainApplication.kt`:
```kotlin
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage
```

### Run the App
```bash
# Make sure google-services.json is in place first!
npx react-native run-android
```

## 🎨 Features Implemented

### ✅ Authentication System
- Email/Password sign in and sign up
- Phone number authentication with OTP
- Password reset functionality
- Form validation
- Modern UI with Islamic design principles

### ✅ Theme System
- Light/Dark mode toggle
- Islamic green color palette with gold accents
- Persistent theme preferences
- Changeable accent colors
- Responsive design

### ✅ Navigation
- Stack navigation with auth flow
- Automatic route protection
- Smooth transitions

### ✅ Components
- Reusable Button component with variants
- Input component with icons and validation
- Theme-aware styling
- Islamic color scheme

## 🏗️ Project Structure

```
src/
├── components/
│   └── common/
│       ├── Button.tsx
│       └── Input.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── auth/
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   └── main/
│       └── HomeScreen.tsx
└── config/
    └── firebase.ts
```

## 🔧 Next Steps

1. **Add google-services.json** - Download from Firebase Console
2. **Test Authentication** - Try signing up with email/phone
3. **Customize Theme** - Modify colors in ThemeContext.tsx
4. **Add More Screens** - Wallet, transactions, Zakat calculator, etc.

## 🎯 MVP Features to Add

Based on your scope:
- [ ] Wallet setup (Web3Auth integration)
- [ ] Send/receive/top-up flows  
- [ ] KYC/AML onboarding
- [ ] Multi-currency support (GBP, USD, SOS)
- [ ] Transaction management
- [ ] Zakat calculator with AI
- [ ] Ayuto group savings
- [ ] Halal investment dashboard
- [ ] Admin dashboard
- [ ] Multi-language support (EN, SO, AR, SW)

## 🐛 Troubleshooting

### Build Errors
- Ensure `google-services.json` is in `android/app/`
- Run `cd android && ./gradlew clean`
- Check Firebase project configuration

### Theme Issues
- AsyncStorage permissions on Android
- Clear app data if theme not persisting

### Authentication Issues
- Check Firebase Authentication is enabled
- Verify phone auth provider is configured
- Check network connectivity
