import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'NGN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', decimals: 0 },
};

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  NGN: 1600.0,
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  symbol: string;
  config: CurrencyConfig;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  isLoadingRates: boolean;
  lastUpdated: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'myfitstore_selected_currency';
const LOCAL_STORAGE_RATES_KEY = 'myfitstore_exchange_rates';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved && saved in CURRENCIES) {
        return saved as CurrencyCode;
      }
    } catch (e) {
      console.warn('Could not read saved currency from localStorage', e);
    }
    return 'USD';
  });

  const [rates, setRates] = useState<Record<CurrencyCode, number>>(() => {
    try {
      const savedRates = localStorage.getItem(LOCAL_STORAGE_RATES_KEY);
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        if (parsed.USD && parsed.EUR && parsed.GBP && parsed.NGN) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved rates from localStorage', e);
    }
    return DEFAULT_RATES;
  });

  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchExchangeRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      // Free open-access API for USD exchange rates
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) {
        throw new Error(`Exchange rate API responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data && data.rates) {
        const newRates: Record<CurrencyCode, number> = {
          USD: 1.0,
          EUR: data.rates.EUR || DEFAULT_RATES.EUR,
          GBP: data.rates.GBP || DEFAULT_RATES.GBP,
          NGN: data.rates.NGN || DEFAULT_RATES.NGN,
        };
        setRates(newRates);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        try {
          localStorage.setItem(LOCAL_STORAGE_RATES_KEY, JSON.stringify(newRates));
        } catch (e) {
          console.warn('Failed to save exchange rates to localStorage', e);
        }
      }
    } catch (error) {
      console.warn('Falling back to static default exchange rates:', error);
      setRates(DEFAULT_RATES);
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, code);
    } catch (e) {
      console.warn('Failed to save selected currency', e);
    }
  };

  const convertPrice = useCallback((amountInUSD: number): number => {
    const rate = rates[currency] || 1.0;
    return amountInUSD * rate;
  }, [currency, rates]);

  const formatPrice = useCallback((amountInUSD: number): string => {
    if (isNaN(amountInUSD) || amountInUSD === null || amountInUSD === undefined) {
      return `${CURRENCIES[currency].symbol}0`;
    }
    const converted = convertPrice(amountInUSD);
    const config = CURRENCIES[currency];

    const formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });

    return `${config.symbol}${formattedNumber}`;
  }, [currency, convertPrice]);

  const config = CURRENCIES[currency];
  const symbol = config.symbol;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        symbol,
        config,
        formatPrice,
        convertPrice,
        isLoadingRates,
        lastUpdated,
        refreshRates: fetchExchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
