import { LocaleCode, formatDateTime, formatRelativeTime, formatCurrency, formatNumber, t } from '../i18n';

/**
 * Comprehensive i18n helper functions for common use cases
 */

// Transaction status formatting with proper localization
export const formatTransactionStatus = (status: string, locale: LocaleCode): string => {
  return t(status, locale);
};

// Token name formatting (some tokens might need localization)
export const formatTokenName = (tokenSymbol: string, locale: LocaleCode): string => {
  const tokenNames: Record<string, Record<LocaleCode, string>> = {
    'BTC': {
      'en': 'Bitcoin',
      'so': 'Bitcoin',
      'ar': 'بيتكوين',
      'sw': 'Bitcoin'
    },
    'ETH': {
      'en': 'Ethereum',
      'so': 'Ethereum',
      'ar': 'إيثريوم',
      'sw': 'Ethereum'
    },
    'SOL': {
      'en': 'Solana',
      'so': 'Solana',
      'ar': 'سولانا',
      'sw': 'Solana'
    },
    'USDT': {
      'en': 'Tether USD',
      'so': 'Tether USD',
      'ar': 'تيذر USD',
      'sw': 'Tether USD'
    }
  };

  return tokenNames[tokenSymbol]?.[locale] || tokenSymbol;
};

// Network name formatting
export const formatNetworkName = (network: string, locale: LocaleCode): string => {
  const networkNames: Record<string, Record<LocaleCode, string>> = {
    'bitcoin': {
      'en': 'Bitcoin',
      'so': 'Bitcoin',
      'ar': 'بيتكوين',
      'sw': 'Bitcoin'
    },
    'ethereum': {
      'en': 'Ethereum',
      'so': 'Ethereum',
      'ar': 'إيثريوم',
      'sw': 'Ethereum'
    },
    'solana': {
      'en': 'Solana',
      'so': 'Solana',
      'ar': 'سولانا',
      'sw': 'Solana'
    }
  };

  return networkNames[network]?.[locale] || network;
};

// Amount formatting with proper decimal places for different tokens
export const formatTokenAmount = (amount: string | number, tokenSymbol: string, locale: LocaleCode): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Different tokens have different decimal precision
  const precisionMap: Record<string, number> = {
    'BTC': 8,
    'ETH': 6,
    'SOL': 4,
    'USDT': 2
  };
  
  const precision = precisionMap[tokenSymbol] || 6;
  const formattedNumber = formatNumber(numAmount, locale);
  
  return `${formattedNumber} ${tokenSymbol}`;
};

// Transaction type formatting
export const formatTransactionType = (type: string, locale: LocaleCode): string => {
  return t(type, locale);
};

// Create a comprehensive transaction display object
export const createTransactionDisplay = (
  transaction: any,
  locale: LocaleCode
) => {
  const timestamp = new Date(transaction.timestamp);
  
  return {
    type: formatTransactionType(transaction.type, locale),
    token: formatTokenName(transaction.token, locale),
    amount: formatTokenAmount(transaction.amount, transaction.token, locale),
    status: formatTransactionStatus(transaction.status, locale),
    network: formatNetworkName(transaction.network, locale),
    formattedDate: formatDateTime(timestamp, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    relativeTime: formatRelativeTime(timestamp, locale),
    usdValue: formatCurrency(transaction.amountUSD, 'USD', locale)
  };
};

// Address formatting with proper truncation
export const formatAddress = (address: string, locale: LocaleCode, length: number = 6): string => {
  if (!address || address.length <= length * 2) {
    return address;
  }
  
  const start = address.substring(0, length);
  const end = address.substring(address.length - length);
  
  return `${start}...${end}`;
};

// Error message formatting with context
export const formatErrorMessage = (errorKey: string, context: Record<string, any>, locale: LocaleCode): string => {
  return t(errorKey, locale, context);
};

// Validation message formatting
export const formatValidationMessage = (field: string, rule: string, locale: LocaleCode): string => {
  const key = `${field}_${rule}`;
  return t(key, locale);
};

// Time-based formatting helpers
export const getTimeContext = (date: Date, locale: LocaleCode): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return t('just_now', locale);
  } else if (diffInMinutes < 60) {
    return t('minutes_ago', locale, { count: diffInMinutes });
  } else if (diffInHours < 24) {
    return t('hours_ago', locale, { count: diffInHours });
  } else if (diffInDays < 7) {
    return t('days_ago', locale, { count: diffInDays });
  } else {
    return formatDateTime(date, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Currency conversion display
export const formatCurrencyConversion = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  locale: LocaleCode
): string => {
  const convertedAmount = amount * rate;
  const fromFormatted = formatCurrency(amount, fromCurrency, locale);
  const toFormatted = formatCurrency(convertedAmount, toCurrency, locale);
  
  return t('currency_conversion_display', locale, {
    from: fromFormatted,
    to: toFormatted,
    rate: rate.toFixed(4)
  });
};

// Pluralization helper (basic implementation)
export const getPluralizedText = (
  count: number,
  singularKey: string,
  pluralKey: string,
  locale: LocaleCode
): string => {
  const key = count === 1 ? singularKey : pluralKey;
  return t(key, locale, { count });
};

// Direction-aware text alignment helper
export const getDirectionalAlignment = (locale: LocaleCode, defaultAlign: 'left' | 'center' | 'right' = 'left') => {
  const isRTL = locale === 'ar';
  
  if (defaultAlign === 'center') return 'center';
  if (isRTL) {
    return defaultAlign === 'left' ? 'right' : 'left';
  }
  return defaultAlign;
};

// Export all helpers as a single object for easy importing
export const i18nHelpers = {
  formatTransactionStatus,
  formatTokenName,
  formatNetworkName,
  formatTokenAmount,
  formatTransactionType,
  createTransactionDisplay,
  formatAddress,
  formatErrorMessage,
  formatValidationMessage,
  getTimeContext,
  formatCurrencyConversion,
  getPluralizedText,
  getDirectionalAlignment,
};
