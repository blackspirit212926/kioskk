import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, subtotalXof, updateQuantity, removeItem, count } = useCart();
  const { currency, rates } = useCurrency();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(o) => !o && closeDrawer()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Panier
            {count > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({count} article{count > 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold">Votre panier est vide</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Découvrez notre sélection de produits importés de Chine et Dubaï.
            </p>
            <Button asChild variant="default" className="mt-6 rounded-full h-11 px-6" onClick={closeDrawer}>
              <Link to="/catalogue">Explorer le catalogue</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-3">
                  <Link
                    to="/produit/$slug"
                    params={{ slug: item.slug }}
                    onClick={closeDrawer}
                    className="flex-shrink-0"
                  >
                    <img
                      src={resolveImage(item.imageUrl)}
                      alt={item.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-20 h-20 rounded-2xl object-cover bg-surface"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/produit/$slug"
                      params={{ slug: item.slug }}
                      onClick={closeDrawer}
                      className="text-sm font-semibold line-clamp-2 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <div className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</div>
                    )}
                    <div className="mt-1 text-sm font-bold">{formatPrice(item.unitPriceXof, currency, rates)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center border border-border rounded-full">
                        <button
                          aria-label="Diminuer"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center disabled:opacity-40 hover:bg-surface rounded-full"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          aria-label="Augmenter"
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-surface rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        aria-label="Retirer"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 px-6 py-5 space-y-4 bg-surface/50">
              <div className="rounded-2xl bg-background border border-border/60 p-3 text-xs text-muted-foreground leading-relaxed">
                Les frais de transit et de livraison ne sont pas inclus. Ils vous seront communiqués à l'arrivée du colis.
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Sous-total</span>
                <span className="font-display text-2xl font-bold">{formatPrice(subtotalXof, currency, rates)}</span>
              </div>
              <Button asChild size="lg" className="w-full rounded-full h-12 text-base" onClick={closeDrawer}>
                <Link to="/checkout" onClick={closeDrawer}>Passer commande</Link>
              </Button>
              <button
                onClick={closeDrawer}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
