import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  unitPriceXof: number;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalXof: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "kiosk.cart";

function keyOf(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = useCallback((incoming) => {
    setItems((prev) => {
      const qty = incoming.quantity ?? 1;
      const k = keyOf(incoming.productId, incoming.variantId);
      const idx = prev.findIndex((i) => keyOf(i.productId, i.variantId) === k);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...incoming, quantity: qty }];
    });
    toast.success("Ajouté au panier", { description: incoming.name });
  }, []);

  const removeItem: CartContextValue["removeItem"] = useCallback((productId, variantId) => {
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.variantId) !== keyOf(productId, variantId)));
  }, []);

  const updateQuantity: CartContextValue["updateQuantity"] = useCallback((productId, variantId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        keyOf(i.productId, i.variantId) === keyOf(productId, variantId)
          ? { ...i, quantity: Math.max(1, quantity) }
          : i,
      ),
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotalXof = items.reduce((s, i) => s + i.unitPriceXof * i.quantity, 0);
    return {
      items,
      count,
      subtotalXof,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      removeItem,
      updateQuantity,
      clear: () => setItems([]),
    };
  }, [items, isDrawerOpen, addItem, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
