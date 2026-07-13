import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { useFavorites } from "@/contexts/favorites-context";
import { useCart } from "@/contexts/cart-context";
import { formatPrice, originLabel } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { Button } from "@/components/ui/button";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price_xof: number;
  compare_at_price_xof: number | null;
  origin_country: "CN" | "AE";
  estimated_delivery_days_min: number;
  estimated_delivery_days_max: number;
  rating_avg: number;
  rating_count: number;
  image_url?: string | null;
  shipping_mode?: "sea" | "air";
}

export function ProductCard({ product, badge }: { product: ProductCardData; badge?: string }) {
  const { currency, rates } = useCurrency();
  const { isFavorite, toggle } = useFavorites();
  const { addItem } = useCart();
  const origin = originLabel(product.origin_country);
  const fav = isFavorite(product.id);
  const image = resolveImage(product.image_url);
  const hasDiscount =
    product.compare_at_price_xof != null && product.compare_at_price_xof > product.price_xof;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price_xof! - product.price_xof) / product.compare_at_price_xof!) * 100)
    : 0;

  return (
    <div className="group relative glass-panel rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      {badge && (
        <div className="hidden md:flex absolute -top-3 -right-3 z-10 w-16 h-16 rounded-full bg-accent text-accent-foreground items-center justify-center text-center text-[10px] font-bold leading-tight px-1.5">
          {badge}
        </div>
      )}
      <Link to="/produit/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[11px] font-medium">
              <span>{origin.flag}</span>
              <span>{origin.label}</span>
            </span>
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold">
                −{discountPct}%
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id, product.name);
        }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur hover:bg-background hover:scale-110 transition-all flex items-center justify-center"
      >
        <Heart
          className={`w-4 h-4 transition-all ${fav ? "fill-destructive text-destructive scale-110" : "text-foreground"}`}
        />
      </button>

      <div className="p-4 md:p-5">
        <Link to="/produit/$slug" params={{ slug: product.slug }}>
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.short_description}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display font-bold text-lg text-foreground">
            {formatPrice(product.price_xof, currency, rates)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compare_at_price_xof!, currency, rates)}
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {product.shipping_mode === "air" ? "Fret aérien" : "Fret maritime"} · {product.estimated_delivery_days_min}–{product.estimated_delivery_days_max} jours
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="w-full mt-4 rounded-full h-10 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.image_url ?? "",
              unitPriceXof: product.price_xof,
            });
          }}
        >
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
}
