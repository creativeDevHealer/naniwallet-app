import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { Web3AuthProvider } from './src/context/Web3AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// App initialization

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <Web3AuthProvider>
              <AppNavigator />
            </Web3AuthProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;