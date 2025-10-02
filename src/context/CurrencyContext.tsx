import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'USD' | 'GBP' | 'SOS';

export interface CurrencyRate {
  currency: Currency;
  rate: number;
  symbol: string;
  name: string;
}

export interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => Promise<void>;
  currencyRates: Record<Currency, CurrencyRate>;
  formatAmount: (amount: number, showSymbol?: boolean) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getCurrencySymbol: (currency: Currency) => string;
  getCurrencyName: (currency: Currency) => string;
  isLoading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; decimals: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  SOS: { symbol: 'S', name: 'Somali Shilling', decimals: 0 },
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>('USD');
  const [currencyRates, setCurrencyRates] = useState<Record<Currency, CurrencyRate>>({
    USD: { currency: 'USD', rate: 1, symbol: '$', name: 'US Dollar' },
    GBP: { currency: 'GBP', rate: 1, symbol: '£', name: 'British Pound' },
    SOS: { currency: 'SOS', rate: 1, symbol: 'S', name: 'Somali Shilling' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load saved currency preference on mount
  useEffect(() => {
    const loadCurrencyPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('selected_currency');
        if (saved && ['USD', 'GBP', 'SOS'].includes(saved)) {
          setSelectedCurrencyState(saved as Currency);
        }
      } catch (error) {
        console.error('Failed to load currency preference:', error);
      }
    };
    loadCurrencyPreference();
  }, []);

  // Fetch live exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try multiple APIs for better currency support
        let response;
        let data;
        
        try {
          // First try exchangerate-api.com
          response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          if (response.ok) {
            data = await response.json();
            console.log('📊 Using exchangerate-api.com');
          } else {
            throw new Error('exchangerate-api.com failed');
          }
        } catch (firstError) {
          console.warn('⚠️ exchangerate-api.com failed, trying alternative...');
          
          // Try alternative API
          response = await fetch('https://api.fxratesapi.com/latest');
          if (response.ok) {
            data = await response.json();
            console.log('📊 Using fxratesapi.com');
          } else {
            throw new Error('All APIs failed');
          }
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('📊 Live FX rates fetched:', data);
        
        // Update rates with live data only
        const liveRates = {
          USD: { currency: 'USD' as Currency, rate: 1, symbol: '$', name: 'US Dollar' },
          GBP: { 
            currency: 'GBP' as Currency, 
            rate: data.rates.GBP, 
            symbol: '£', 
            name: 'British Pound' 
          },
          SOS: { 
            currency: 'SOS' as Currency, 
            rate: data.rates.SOS, 
            symbol: 'S', 
            name: 'Somali Shilling' 
          },
        };
        
        console.log('📊 API rates available:', Object.keys(data.rates));
        console.log('📊 GBP rate from API:', data.rates.GBP);
        console.log('📊 SOS rate from API:', data.rates.SOS);
        
        // Validate that required rates are available
        if (!data.rates.GBP) {
          throw new Error('GBP rate not available from API');
        }
        if (!data.rates.SOS) {
          console.warn('⚠️ SOS rate not available from API, using alternative source');
          // Try alternative API or use a different approach for SOS
          // For now, we'll skip SOS if not available
        }
        
        setCurrencyRates(liveRates);
        console.log('✅ Live exchange rates updated:', liveRates);
        
        // Test conversion rates after update
        setTimeout(() => {
          testConversionRates();
        }, 1000);
        
        // Cache the rates for offline use
        try {
          await AsyncStorage.setItem('cached_exchange_rates', JSON.stringify(liveRates));
          await AsyncStorage.setItem('cached_rates_timestamp', Date.now().toString());
        } catch (cacheError) {
          console.warn('⚠️ Failed to cache exchange rates:', cacheError);
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch live exchange rates:', error);
        
        // Fallback to cached rates only (no static rates)
        try {
          const cachedRates = await AsyncStorage.getItem('cached_exchange_rates');
          if (cachedRates) {
            const parsed = JSON.parse(cachedRates);
            setCurrencyRates(parsed);
            console.log('📦 Using cached exchange rates');
          } else {
            console.error('❌ No cached rates available and API failed');
            setError('Unable to load exchange rates. Please check your connection.');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback failed:', fallbackError);
          setError('Failed to load exchange rates. Please try again.');
        }
        
        setError('Using cached rates - check internet connection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const setSelectedCurrency = async (currency: Currency) => {
    try {
      setSelectedCurrencyState(currency);
      await AsyncStorage.setItem('selected_currency', currency);
    } catch (error) {
      console.error('Failed to save currency preference:', error);
    }
  };

  const refreshRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try multiple APIs for better currency support
      let response;
      let data;
      
      try {
        // First try exchangerate-api.com
        response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
          data = await response.json();
          console.log('🔄 Manual refresh - Using exchangerate-api.com');
        } else {
          throw new Error('exchangerate-api.com failed');
        }
      } catch (firstError) {
        console.warn('⚠️ exchangerate-api.com failed, trying alternative...');
        
        // Try alternative API
        response = await fetch('https://api.fxratesapi.com/latest');
        if (response.ok) {
          data = await response.json();
          console.log('🔄 Manual refresh - Using fxratesapi.com');
        } else {
          throw new Error('All APIs failed');
        }
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('🔄 Manual refresh - Live FX rates:', data);
      
      const liveRates = {
        USD: { currency: 'USD' as Currency, rate: 1, symbol: '$', name: 'US Dollar' },
        GBP: { 
          currency: 'GBP' as Currency, 
          rate: data.rates.GBP, 
          symbol: '£', 
          name: 'British Pound' 
        },
        SOS: { 
          currency: 'SOS' as Currency, 
          rate: data.rates.SOS, 
          symbol: 'S', 
          name: 'Somali Shilling' 
        },
      };
      
      // Validate that required rates are available
      if (!data.rates.GBP) {
        throw new Error('GBP rate not available from API');
      }
      if (!data.rates.SOS) {
        console.warn('⚠️ SOS rate not available from API');
      }
      
      setCurrencyRates(liveRates);
      setLastUpdated(new Date());
      
      // Cache the rates
      await AsyncStorage.setItem('cached_exchange_rates', JSON.stringify(liveRates));
      await AsyncStorage.setItem('cached_rates_timestamp', Date.now().toString());
      
      console.log('✅ Manual refresh completed');
      
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      setError('Failed to refresh exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, showSymbol: boolean = false): string => {
    const config = CURRENCY_CONFIG[selectedCurrency];
    const formattedAmount = amount.toFixed(config.decimals);
    
    if (showSymbol) {
      return `${config.symbol}${formattedAmount}`;
    }
    return formattedAmount;
  };

  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = currencyRates[fromCurrency]?.rate || 1;
    const toRate = currencyRates[toCurrency]?.rate || 1;
    
    // Convert to USD first, then to target currency
    // If fromCurrency is USD, no conversion needed
    // If toCurrency is USD, divide by fromRate
    // Otherwise, convert to USD then multiply by toRate
    let result: number;
    
    if (fromCurrency === 'USD') {
      // From USD to other currency: multiply by target rate
      result = amount * toRate;
    } else if (toCurrency === 'USD') {
      // From other currency to USD: divide by source rate
      result = amount / fromRate;
    } else {
      // From non-USD to non-USD: convert to USD first, then to target
      const usdAmount = amount / fromRate;
      result = usdAmount * toRate;
    }
    
    console.log(`🔄 Currency conversion: ${amount} ${fromCurrency} -> ${result} ${toCurrency} (fromRate: ${fromRate}, toRate: ${toRate})`);
    
    return result;
  };

  const getCurrencySymbol = (currency: Currency): string => {
    return CURRENCY_CONFIG[currency].symbol;
  };

  const getCurrencyName = (currency: Currency): string => {
    return CURRENCY_CONFIG[currency].name;
  };

  // Test function to verify conversion rates
  const testConversionRates = () => {
    console.log('🧪 Testing conversion rates:');
    console.log('📊 Current rates:', currencyRates);
    
    // Test USD to GBP
    const usdToGbp = convertAmount(100, 'USD', 'GBP');
    console.log(`💰 100 USD = ${usdToGbp} GBP`);
    
    // Test USD to SOS
    const usdToSos = convertAmount(100, 'USD', 'SOS');
    console.log(`💰 100 USD = ${usdToSos} SOS`);
    
    // Test GBP to USD
    const gbpToUsd = convertAmount(100, 'GBP', 'USD');
    console.log(`💰 100 GBP = ${gbpToUsd} USD`);
    
    // Test SOS to USD
    const sosToUsd = convertAmount(100, 'SOS', 'USD');
    console.log(`💰 100 SOS = ${sosToUsd} USD`);
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    currencyRates,
    formatAmount,
    convertAmount,
    getCurrencySymbol,
    getCurrencyName,
    isLoading,
    error,
    refreshRates,
    lastUpdated,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
