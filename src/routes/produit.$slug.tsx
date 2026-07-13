import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, ShoppingBag, Zap, Sparkles, Share2, Truck, ShieldCheck, ArrowLeft, Star, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { useFavorites } from "@/contexts/favorites-context";
import { formatPrice, originLabel, deliveryLabel } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { toast } from "sonner";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export const Route = createFileRoute("/produit/$slug")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ")} — Kiosk` }],
  }),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(url, alt, sort_order), product_variants(id, name, option_type, option_value, price_adjustment_xof, is_available, sort_order), categories(id, name, slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openDrawer } = useCart();
  const { currency, rates } = useCurrency();
  const { isFavorite, toggle } = useFavorites();

  if (isLoading) {
    return (
      <div className="container-kiosk py-8 grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl kiosk-skeleton" />
        <div className="space-y-4">
          <div className="h-8 rounded-lg kiosk-skeleton w-3/4" />
          <div className="h-6 rounded-lg kiosk-skeleton w-1/2" />
          <div className="h-32 rounded-lg kiosk-skeleton" />
        </div>
      </div>
    );
  }
  if (error || !product) return null;

  const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const variants = (product.product_variants ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const origin = originLabel(product.origin_country);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const finalPrice = product.price_xof + (selectedVariant?.price_adjustment_xof ?? 0);
  const fav = isFavorite(product.id);

  const heroImage = resolveImage(images[activeImageIdx]?.url ?? images[0]?.url);

  const thumbnailButtons = images.slice(0, 5).map((img, i) => (
    <button
      key={img.url + i}
      onClick={() => setActiveImageIdx(i)}
      className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
        activeImageIdx === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
      }`}
    >
      <img src={resolveImage(img.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
    </button>
  ));

  const handleAdd = () => {
    if (variants.length > 0 && !selectedVariantId) {
      toast.error("Veuillez sélectionner une option");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: images[0]?.url ?? "",
      unitPriceXof: finalPrice,
      quantity,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.option_value,
    });
  };

  const handleBuyNow = () => {
    handleAdd();
    openDrawer();
  };

  const actionButtons = (
    <>
      <Button onClick={handleAdd} size="lg" variant="outline" className="rounded-full h-13 px-6 flex-1">
        <ShoppingBag className="w-4 h-4 mr-2" /> Ajouter au panier
      </Button>
      <Button onClick={handleBuyNow} size="lg" className="rounded-full h-13 px-6 flex-1 btn-glow">
        <Zap className="w-4 h-4 mr-2" /> Commander maintenant
      </Button>
    </>
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  return (
    <div className="container-kiosk py-6 md:py-10 pb-24 md:pb-0">
      <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="flex flex-col md:flex-row gap-3">
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-16 md:w-20 flex-shrink-0">{thumbnailButtons}</div>
            )}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface border border-border/60 flex-1">
              <img
                src={heroImage}
                alt={product.name}
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/95 backdrop-blur text-xs font-medium">
                  <span>{origin.flag}</span> {origin.label}
                </span>
              </div>
              <button
                onClick={() => toggle(product.id, product.name)}
                aria-label="Favori"
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-background/95 backdrop-blur hover:bg-background flex items-center justify-center transition-transform hover:scale-110"
              >
                <Heart className={`w-5 h-5 ${fav ? "fill-destructive text-destructive" : ""}`} />
              </button>
            </div>
          </div>
          {images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2 md:hidden">{thumbnailButtons}</div>}
        </div>

        {/* Details */}
        <div>
          {product.categories && (
            <Link
              to="/catalogue"
              search={{ categorie: product.categories.slug }}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              {product.categories.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight text-balance-fix">
            {product.name}
          </h1>

          {product.rating_count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating_avg) ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating_avg.toFixed(1)} · {product.rating_count} avis
              </span>
            </div>
          )}

          <p className="mt-4 text-muted-foreground leading-relaxed">{product.short_description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{formatPrice(finalPrice, currency, rates)}</span>
            {product.compare_at_price_xof && product.compare_at_price_xof > product.price_xof && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compare_at_price_xof, currency, rates)}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Prix hors frais de transit et livraison</div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-semibold mb-3">
                {variants[0].option_type.charAt(0).toUpperCase() + variants[0].option_type.slice(1)}
                {selectedVariant && <span className="text-muted-foreground font-normal ml-2">: {selectedVariant.option_value}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const active = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      disabled={!v.is_available}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"
                      }`}
                    >
                      {v.option_value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-semibold">Quantité</span>
            <div className="inline-flex items-center border border-border rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:bg-surface rounded-l-full"
                aria-label="Diminuer"
              >
                −
              </button>
              <span className="min-w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-surface rounded-r-full"
                aria-label="Augmenter"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 hidden md:flex flex-row gap-3">{actionButtons}</div>
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel-strong flex flex-row gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {actionButtons}
          </div>

          <div className="mt-3 flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-1.5" /> Partager
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
              <Link to="/demander-un-produit" search={{ produit: product.name }}>
                <Sparkles className="w-4 h-4 mr-1.5" /> Demander une variante
              </Link>
            </Button>
          </div>

          {/* Info strip */}
          <div className="mt-8 rounded-3xl bg-surface/60 border border-border/60 p-5 grid gap-4">
            <InfoRow icon={Truck} title={`Délai estimé : ${deliveryLabel(product.estimated_delivery_days_min, product.estimated_delivery_days_max, product.shipping_mode)}`} desc="Frais de transit et livraison réglés à l'arrivée du colis." />
            <InfoRow icon={ShieldCheck} title={product.payment_split_allowed ? "Paiement en deux fois disponible" : "Paiement à la commande"} desc={product.payment_split_allowed ? "50 % à la commande, 50 % à l'arrivée." : "Le montant du produit est réglé au moment de la précommande."} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-10">
            <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3">
                Description
              </TabsTrigger>
              <TabsTrigger value="livraison" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3">
                Livraison & Frais
              </TabsTrigger>
              <TabsTrigger value="avis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3">
                Avis
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6 text-muted-foreground leading-relaxed">
              {product.description ?? product.short_description ?? "Description à venir."}
            </TabsContent>
            <TabsContent value="livraison" className="pt-6 space-y-4 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">Délai estimé :</strong> {deliveryLabel(product.estimated_delivery_days_min, product.estimated_delivery_days_max, product.shipping_mode)}</p>
              <p><strong className="text-foreground">Mode de transport :</strong> {product.shipping_mode === "air" ? "Fret aérien depuis " + origin.label : "Fret maritime depuis " + origin.label}</p>
              <p><strong className="text-foreground">Frais de transit :</strong> ils sont calculés selon le volume et le poids final du colis. Ils vous seront communiqués à l'arrivée à Dakar et payés à la livraison.</p>
              <p><strong className="text-foreground">Livraison locale :</strong> à domicile ou en point relais dans Dakar et sa banlieue. Livraison régionale possible avec supplément.</p>
            </TabsContent>
            <TabsContent value="avis" className="pt-6">
              {product.rating_count === 0 ? (
                <p className="text-muted-foreground">Aucun avis pour l'instant. Seuls les clients ayant reçu ce produit peuvent laisser un avis.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {product.rating_count} avis · Note moyenne {product.rating_avg.toFixed(1)}/5
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RelatedProducts categoryId={product.category_id} excludeId={product.id} />
    </div>
  );
}

function InfoRow({ icon: Icon, title, desc }: { icon: typeof Truck; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-accent/15 text-primary flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function RelatedProducts({ categoryId, excludeId }: { categoryId: string | null; excludeId: string }) {
  const { data } = useQuery({
    queryKey: ["related", categoryId, excludeId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price_xof, compare_at_price_xof, origin_country, estimated_delivery_days_min, estimated_delivery_days_max, rating_avg, rating_count, product_images(url, sort_order)")
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", excludeId)
        .limit(4);
      return (data ?? []).map((p) => ({ ...p, image_url: p.product_images?.[0]?.url ?? null })) as unknown as ProductCardData[];
    },
  });
  if (!data || data.length === 0) return null;
  return (
    <section className="mt-20">
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Produits similaires</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
