// Currency & number formatting for Kiosk (French locale)

export type Currency = "XOF" | "EUR" | "USD";

export const CURRENCY_META: Record<Currency, { symbol: string; code: string; label: string; flag: string }> = {
  XOF: { symbol: "FCFA", code: "XOF", label: "Franc CFA", flag: "SN" },
  EUR: { symbol: "€", code: "EUR", label: "Euro", flag: "EU" },
  USD: { symbol: "$", code: "USD", label: "Dollar US", flag: "US" },
};

// Fallback rates if DB unavailable
export const DEFAULT_RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 0.001524,
  USD: 0.001654,
};

export function convertFromXof(amountXof: number, currency: Currency, rates: Record<string, number>): number {
  const rate = rates[currency] ?? DEFAULT_RATES[currency];
  return amountXof * rate;
}

export function formatPrice(amountXof: number, currency: Currency, rates: Record<string, number>): string {
  const value = convertFromXof(amountXof, currency, rates);
  if (currency === "XOF") {
    const rounded = Math.round(value);
    return `${new Intl.NumberFormat("fr-FR").format(rounded)} FCFA`;
  }
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function originLabel(code: "CN" | "AE"): { label: string; flag: string } {
  return code === "CN" ? { label: "Chine", flag: "🇨🇳" } : { label: "Dubaï", flag: "🇦🇪" };
}

export function deliveryLabel(minDays: number, maxDays: number, mode: "sea" | "air"): string {
  const modeLabel = mode === "air" ? "aérien" : "maritime";
  return `${minDays}–${maxDays} jours (fret ${modeLabel})`;
}
