import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_RATES, type Currency } from "@/lib/format";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = "kiosk.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("XOF");
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "XOF" || saved === "EUR" || saved === "USD") setCurrencyState(saved);
  }, []);

  useEffect(() => {
    supabase
      .from("exchange_rates")
      .select("currency, rate_from_xof")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number> = { ...DEFAULT_RATES };
        for (const row of data) map[row.currency] = Number(row.rate_from_xof);
        setRates(map);
      });
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const value = useMemo(() => ({ currency, setCurrency, rates }), [currency, setCurrency, rates]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
