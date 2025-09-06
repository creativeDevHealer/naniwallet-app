import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  white: string;
  black: string;
  shadow: string;
}

export interface Theme {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
}

// Nani Wallet Modern Light Color Palette
const lightTheme: ThemeColors = {
  primary: '#2E7D32', // Islamic Green
  primaryDark: '#1B5E20',
  secondary: '#FF8F00', // Gold accent
  background: '#F0F2F5', // Modern gray background with better contrast
  surface: '#FFFFFF',
  text: '#1A1A1A', // Deeper text for better readability
  textSecondary: '#666666', // Better contrast for secondary text
  border: '#E1E5E9', // Softer, more modern border
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#007BFF',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.15)', // Stronger shadow for better depth
};

const darkTheme: ThemeColors = {
  primary: '#4CAF50', // Lighter green for dark mode
  primaryDark: '#2E7D32',
  secondary: '#FFB300', // Brighter gold for dark mode
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  changeAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [customAccentColor, setCustomAccentColor] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preferences
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Auto theme detection based on system
  useEffect(() => {
    if (themeMode === 'auto') {
      // In a real app, you'd use Appearance.getColorScheme() from react-native
      // For now, defaulting to light mode
      setIsDarkMode(false);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode]);

  const loadThemePreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const savedAccentColor = await AsyncStorage.getItem('accentColor');
      
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
      if (savedAccentColor) {
        setCustomAccentColor(savedAccentColor);
      }
    } catch (error) {
      console.log('Error loading theme preferences:', error);
    }
  };

  const saveThemePreferences = async (mode: ThemeMode, accentColor?: string) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      if (accentColor) {
        await AsyncStorage.setItem('accentColor', accentColor);
      }
    } catch (error) {
      console.log('Error saving theme preferences:', error);
    }
  };

  const getCurrentTheme = (): Theme => {
    const baseColors = isDarkMode ? darkTheme : lightTheme;
    
    // Apply custom accent color if set
    const colors = customAccentColor 
      ? { ...baseColors, primary: customAccentColor }
      : baseColors;

    return {
      colors,
      mode: themeMode,
      isDark: isDarkMode,
    };
  };

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(newMode);
    saveThemePreferences(newMode, customAccentColor || undefined);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreferences(mode, customAccentColor || undefined);
  };

  const changeAccentColor = (color: string) => {
    setCustomAccentColor(color);
    saveThemePreferences(themeMode, color);
  };

  const value: ThemeContextType = {
    theme: getCurrentTheme(),
    toggleTheme,
    setThemeMode,
    changeAccentColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
