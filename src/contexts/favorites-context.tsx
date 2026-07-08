import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface FavoritesContextValue {
  ids: Set<string>;
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string, name?: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
const STORAGE_KEY = "kiosk.favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }, [ids]);

  const toggle = useCallback((productId: string, name?: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        toast("Retiré des favoris", { description: name });
      } else {
        next.add(productId);
        toast.success("Ajouté à vos favoris", { description: name });
      }
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(() => ({
    ids,
    isFavorite: (id) => ids.has(id),
    toggle,
  }), [ids, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
