'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Currency = 'USD' | 'CLP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amount: number) => string;
  /** Raw converted value (not formatted) */
  convert: (amount: number) => number;
}

// Fixed exchange rate: 1 USD = 940 CLP (update this constant to adjust the rate)
const USD_TO_CLP = 940;

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('currency') as Currency | null;
    if (saved === 'USD' || saved === 'CLP') setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  }, []);

  const convert = useCallback(
    (amount: number) => currency === 'CLP' ? Math.round(amount * USD_TO_CLP) : amount,
    [currency]
  );

  const format = useCallback(
    (amount: number) => {
      const value = convert(amount);
      if (currency === 'CLP') {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    },
    [currency, convert]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
};
