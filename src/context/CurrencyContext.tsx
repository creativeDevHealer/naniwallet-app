import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'GBP' | 'SOS';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencyInfo: CurrencyInfo;
  formatCurrency: (amount: number) => string;
  formatPrice: (amount: number, originalCurrency?: string) => string;
  formatAmount: (amount: number) => string;
  selectedCurrency: CurrencyCode;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const currencyMap: Record<CurrencyCode, CurrencyInfo> = {
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      flag: '🇺🇸'
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      flag: '🇬🇧'
    },
    SOS: {
      code: 'SOS',
      symbol: 'S',
      name: 'Somali Shilling',
      flag: '🇸🇴'
    }
  };

  const currencyInfo = currencyMap[currency];

  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
  };

  const formatPrice = (amount: number, originalCurrency: string = 'USD'): string => {
    if (originalCurrency === 'USDT' || originalCurrency === 'USD') {
      // Convert USDT/USD to selected currency
      if (currency === 'GBP') {
        // Simple conversion rate - in production this should come from an API
        const gbpRate = 0.78; // 1 USD = 0.78 GBP (example rate)
        const convertedAmount = amount * gbpRate;
        return formatCurrency(convertedAmount);
      } else if (currency === 'SOS') {
        // Simple conversion rate - in production this should come from an API
        const sosRate = 570; // 1 USD = 570 SOS (example rate)
        const convertedAmount = amount * sosRate;
        return formatCurrency(convertedAmount);
      }
      return formatCurrency(amount);
    }
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  };

  const formatAmount = (amount: number): string => {
    if (currency === 'SOS') {
      // For SOS, format with no decimal places as it's typically used as whole numbers
      return new Intl.NumberFormat('en-US').format(Math.round(amount));
    }
    // For USD and GBP, use standard currency formatting
    return formatCurrency(amount);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencyInfo,
      formatCurrency,
      formatPrice,
      formatAmount,
      selectedCurrency: currency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

export default CurrencyContext;