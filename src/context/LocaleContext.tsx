import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocaleCode = 'en' | 'so' | 'ar' | 'sw';

interface LocaleContextType {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleCode>('en');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('pref_locale');
      if (saved === 'en' || saved === 'so' || saved === 'ar' || saved === 'sw') {
        setLocaleState(saved);
      }
    })();
  }, []);

  const setLocale = async (code: LocaleCode) => {
    setLocaleState(code);
    await AsyncStorage.setItem('pref_locale', code);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};


