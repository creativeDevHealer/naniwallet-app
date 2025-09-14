import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border and divider colors
  border: string;
  borderLight: string;
  borderDark: string;
  divider: string;
  
  // Semantic colors
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Action colors
  accent: string;
  accentLight: string;
  danger: string;
  dangerLight: string;
  
  // Neutral colors
  white: string;
  black: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  
  // Shadow and overlay
  shadow: string;
  overlay: string;
  
  // Special UI colors
  placeholder: string;
  disabled: string;
  disabledText: string;
}

export interface Theme {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
}

// Nani Wallet Modern Light Color Palette
const lightTheme: ThemeColors = {
  // Primary colors - Islamic Green theme
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#FF8F00',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB300',
  
  // Background colors
  background: '#F8F9FA',
  backgroundSecondary: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Border and divider colors
  border: '#E1E5E9',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  divider: '#E0E0E0',
  
  // Semantic colors
  error: '#DC3545',
  errorLight: '#F8D7DA',
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  info: '#007BFF',
  infoLight: '#CCE7FF',
  
  // Action colors
  accent: '#2E7D32', // Use primary green for consistency
  accentLight: '#E8F5E8',
  danger: '#FF5A5F', // For delete/close actions
  dangerLight: '#FFEBEE',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Shadow and overlay
  shadow: 'rgba(0, 0, 0, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.35)',
  
  // Special UI colors
  placeholder: '#BDBDBD',
  disabled: '#F5F5F5',
  disabledText: '#BDBDBD',
};

const darkTheme: ThemeColors = {
  // Primary colors - Islamic Green theme for dark mode
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  primaryLight: '#66BB6A',
  secondary: '#FFB300',
  secondaryDark: '#FF8F00',
  secondaryLight: '#FFC107',
  
  // Background colors
  background: '#121212',
  backgroundSecondary: '#1A1A1A',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#888888',
  textInverse: '#1A1A1A',
  
  // Border and divider colors
  border: '#333333',
  borderLight: '#404040',
  borderDark: '#262626',
  divider: '#2A2A2A',
  
  // Semantic colors
  error: '#F44336',
  errorLight: '#3D1B1B',
  success: '#4CAF50',
  successLight: '#1B3D1B',
  warning: '#FF9800',
  warningLight: '#3D2B1B',
  info: '#2196F3',
  infoLight: '#1B2B3D',
  
  // Action colors
  accent: '#4CAF50', // Use primary green for dark mode consistency
  accentLight: '#1B3D1B',
  danger: '#FF6B6B', // Slightly lighter red for dark mode
  dangerLight: '#3D1B1B',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#2A2A2A',
  gray100: '#333333',
  gray200: '#404040',
  gray300: '#4A4A4A',
  gray400: '#666666',
  gray500: '#888888',
  gray600: '#B0B0B0',
  gray700: '#CCCCCC',
  gray800: '#E0E0E0',
  gray900: '#F5F5F5',
  
  // Shadow and overlay
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Special UI colors
  placeholder: '#666666',
  disabled: '#2A2A2A',
  disabledText: '#666666',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  changeAccentColor: (color: string) => void;
  changePrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [customAccentColor, setCustomAccentColor] = useState<string | null>(null);
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string | null>(null);
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
      const savedPrimaryColor = await AsyncStorage.getItem('primaryColor');
      
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
      if (savedAccentColor) {
        setCustomAccentColor(savedAccentColor);
      }
      if (savedPrimaryColor) {
        setCustomPrimaryColor(savedPrimaryColor);
      }
    } catch (error) {
      console.log('Error loading theme preferences:', error);
    }
  };

  const saveThemePreferences = async (mode: ThemeMode, accentColor?: string, primaryColor?: string) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      if (accentColor) {
        await AsyncStorage.setItem('accentColor', accentColor);
      }
      if (primaryColor) {
        await AsyncStorage.setItem('primaryColor', primaryColor);
      }
    } catch (error) {
      console.log('Error saving theme preferences:', error);
    }
  };

  const getCurrentTheme = useMemo((): Theme => {
    const baseColors = isDarkMode ? darkTheme : lightTheme;
    
    // Apply custom colors if set
    let colors = baseColors;
    
    if (customPrimaryColor) {
      colors = { ...colors, primary: customPrimaryColor, accent: customPrimaryColor };
    }
    
    if (customAccentColor) {
      colors = { ...colors, accent: customAccentColor };
    }

    return {
      colors,
      mode: themeMode,
      isDark: isDarkMode,
    };
  }, [isDarkMode, customPrimaryColor, customAccentColor, themeMode]);

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(newMode);
    saveThemePreferences(newMode, customAccentColor || undefined, customPrimaryColor || undefined);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreferences(mode, customAccentColor || undefined, customPrimaryColor || undefined);
  };

  const changeAccentColor = (color: string) => {
    setCustomAccentColor(color);
    saveThemePreferences(themeMode, color, customPrimaryColor || undefined);
  };

  const changePrimaryColor = (color: string) => {
    setCustomPrimaryColor(color);
    saveThemePreferences(themeMode, customAccentColor || undefined, color);
  };

  const value: ThemeContextType = {
    theme: getCurrentTheme,
    toggleTheme,
    setThemeMode,
    changeAccentColor,
    changePrimaryColor,
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
