import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";

export const Route = createFileRoute("/panier")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Panier — Kiosk" }] }),
});

function CartPage() {
  const { items, subtotalXof, updateQuantity, removeItem } = useCart();
  const { currency, rates } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="container-kiosk py-16 md:py-24 max-w-md mx-auto text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl md:text-3xl font-display font-bold">Votre panier est vide</h1>
        <p className="mt-3 text-muted-foreground">
          Ajoutez des produits pour lancer votre première précommande.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full h-12 px-7">
          <Link to="/catalogue">Découvrir nos produits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-kiosk py-8 md:py-12">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">Panier</span>
      <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold">Vos articles à précommander</h1>

      <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-4 rounded-3xl bg-card border border-border/60 p-4">
              <img
                src={resolveImage(item.imageUrl)}
                alt={item.name}
                width={112}
                height={112}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover bg-surface"
              />
              <div className="flex-1 min-w-0">
                <Link to="/produit/$slug" params={{ slug: item.slug }} className="font-semibold hover:text-primary line-clamp-2">
                  {item.name}
                </Link>
                {item.variantLabel && <div className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</div>}
                <div className="mt-2 font-display font-bold">{formatPrice(item.unitPriceXof, currency, rates)}</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center border border-border rounded-full">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Diminuer la quantité de ${item.name}`}
                      className="w-10 h-10 disabled:opacity-40 hover:bg-surface rounded-l-full flex items-center justify-center"
                    ><Minus className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      aria-label={`Augmenter la quantité de ${item.name}`}
                      className="w-10 h-10 hover:bg-surface rounded-r-full flex items-center justify-center"
                    ><Plus className="w-3.5 h-3.5" aria-hidden="true" /></button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    aria-label={`Retirer ${item.name} du panier`}
                    className="ml-auto text-sm text-muted-foreground hover:text-destructive inline-flex items-center gap-1 min-h-[40px] px-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> <span className="hidden sm:inline">Retirer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
            <h2 className="font-display text-xl font-bold">Récapitulatif</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total produits</span>
              <span className="font-medium">{formatPrice(subtotalXof, currency, rates)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frais de transit</span>
              <span className="text-muted-foreground">À l'arrivée</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span className="text-muted-foreground">À l'arrivée</span>
            </div>
            <div className="border-t border-border pt-4 flex items-baseline justify-between">
              <span className="font-semibold">À payer maintenant</span>
              <span className="font-display text-2xl font-bold">{formatPrice(subtotalXof, currency, rates)}</span>
            </div>
            <div className="rounded-2xl bg-surface/70 p-3 text-xs text-muted-foreground leading-relaxed">
              Vous payez uniquement le prix des produits à la commande. Les frais de transit et de livraison vous seront communiqués à l'arrivée du colis à Dakar.
            </div>
            <Button asChild size="lg" className="w-full rounded-full h-13 btn-glow">
              <Link to="/checkout">
                Passer commande <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              Paiement 100 % sécurisé — Wave, Orange Money, Free Money
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
