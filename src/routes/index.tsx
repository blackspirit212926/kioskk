import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, ShieldCheck, Ship, Search, Package, CreditCard, Truck, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
      <SourcingBanner />
      <Testimonials />
    </>
  );
}

/* ============ HERO ============ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-20 md:pb-28">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.14 75 / 0.35), oklch(0.22 0.10 275 / 0.25) 55%, transparent 75%)" }}
      />

      <div className="container-kiosk relative text-center max-w-5xl mx-auto kiosk-fade-up">
        <span
          className="inline-flex items-center pl-5 pr-4 py-1.5 text-accent text-[11px] font-semibold uppercase tracking-wider"
          style={{
            clipPath: "polygon(0 50%, 8% 0, 100% 0, 100% 100%, 8% 100%)",
            background: "oklch(0.82 0.14 75 / 0.15)",
          }}
        >
          Précommandes ouvertes — Chine & Dubaï
        </span>

        <h1 className="mt-6 font-display font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance-fix">
          Précommandez.
          <br />
          Recevez, <span className="italic font-medium text-accent">sans stress.</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Précommandez vos produits préférés directement depuis Guangzhou et Dubaï. Nous les sourçons, les importons et les livrons à votre porte à Dakar.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="default" className="rounded-full h-13 px-7 text-base bg-primary text-primary-foreground hover:bg-primary-light btn-glow">
            <Link to="/catalogue">
              Explorer le catalogue <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-13 px-7 text-base border-2 bg-transparent">
            <Link to="/demander-un-produit">Demander un produit</Link>
          </Button>
        </div>

        <HeroPhoneMockup />
      </div>
    </section>
  );
}

function HeroPhoneMockup() {
  return (
    <div className="relative mt-16 md:mt-20 max-w-md mx-auto">
      <div
        className="relative mx-auto w-64 rounded-[2.5rem] bg-sidebar border-[6px] border-primary shadow-2xl overflow-hidden kiosk-fade-up"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="p-5 pt-8">
          <div className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-widest">Kiosk</div>
          <div className="mt-1 text-sm font-semibold text-sidebar-foreground">Suivi de commande</div>
          <div className="mt-6 h-2 rounded-full bg-sidebar-foreground/15 overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: "65%" }} />
          </div>
          <div className="mt-3 text-xs text-sidebar-foreground/70">En transit — Chine → Dakar</div>
        </div>
      </div>

      <div
        className="hidden md:flex absolute -left-16 top-4 glass-panel rounded-2xl p-4 max-w-[200px] items-start gap-3 kiosk-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="w-9 h-9 rounded-full bg-success/15 text-success flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="text-xs font-semibold">Paiement confirmé</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Wave · 45 000 FCFA</div>
        </div>
      </div>

      <div
        className="hidden md:block absolute -right-16 top-1/3 glass-panel rounded-2xl p-4 max-w-[180px] kiosk-fade-up"
        style={{ animationDelay: "0.45s" }}
      >
        <div className="flex gap-0.5 text-accent">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
        <div className="text-xs font-semibold mt-1">4.9 · 2 400+ avis</div>
      </div>

      <div
        className="hidden md:flex absolute -right-10 bottom-0 glass-panel rounded-2xl p-4 max-w-[190px] items-start gap-3 kiosk-fade-up"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="w-9 h-9 rounded-full bg-accent/20 text-primary flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4.5 h-4.5" />
        </div>
        <div>
          <div className="text-xs font-semibold">98% à l'heure</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Livraisons Kiosk</div>
        </div>
      </div>
    </div>
  );
}

/* ============ STATS BAR ============ */
const STATS = [
  { value: "12 000+", label: "Clients satisfaits" },
  { value: "2", label: "Pays sourcés" },
  { value: "98%", label: "Livraisons à l'heure" },
  { value: "100%", label: "Paiement sécurisé" },
];

function StatsBar() {
  return (
    <section className="container-kiosk -mt-8 md:-mt-12 relative z-10">
      <div className="rounded-3xl border border-border shadow-elevated grid grid-cols-2 md:grid-cols-4 gap-px bg-border overflow-hidden">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card p-6 text-center">
            <div className="font-display font-bold text-2xl md:text-3xl text-primary">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ CATEGORIES ============ */
function Categories() {
  const { data } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, slug, name, icon")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  return (
    <section className="container-kiosk py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Explorer</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">Toutes les catégories</h2>
        </div>
        <Link to="/catalogue" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:text-primary group">
          Tout voir <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {(data ?? []).map((cat) => (
          <Link
            key={cat.id}
            to="/catalogue"
            search={{ categorie: cat.slug }}
            className="group relative aspect-square rounded-3xl bg-card border border-border/60 p-4 md:p-5 flex flex-col justify-between overflow-hidden hover:border-transparent hover:shadow-elevated hover:-translate-y-1 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-2xl bg-accent/15 text-primary flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="relative">
              <div className="text-sm md:text-base font-semibold">{cat.name}</div>
              <div className="mt-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all">
                Découvrir →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ============ FEATURED ============ */
function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price_xof, compare_at_price_xof, origin_country, estimated_delivery_days_min, estimated_delivery_days_max, rating_avg, rating_count, product_images(url, sort_order)")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      return (data ?? []).map((p) => ({
        ...p,
        image_url: p.product_images?.[0]?.url ?? null,
      })) as unknown as ProductCardData[];
    },
  });

  return (
    <section className="bg-surface/60 py-16 md:py-24 border-y border-border/60">
      <div className="container-kiosk">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Sélection Kiosk</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">Produits en vedette</h2>
          </div>
          <Link to="/catalogue" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:text-primary group">
            Tout voir <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl kiosk-skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(data ?? []).map((p, i) => (
              <ProductCard key={p.id} product={p} badge={i === 0 ? "Top vente" : undefined} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ HOW IT WORKS ============ */
function HowItWorks() {
  const steps = [
    { icon: Search, title: "Trouvez ou demandez", desc: "Parcourez le catalogue ou faites une demande de sourcing sur mesure." },
    { icon: CreditCard, title: "Précommandez", desc: "Payez le prix du produit via Wave, Orange Money ou Free Money." },
    { icon: Ship, title: "Import et transit", desc: "Nous importons depuis la Chine ou Dubaï en 10 à 60 jours selon le mode." },
    { icon: Truck, title: "Livraison à votre porte", desc: "Frais de transit et livraison réglés à l'arrivée du colis." },
  ];
  return (
    <section className="container-kiosk py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Comment ça marche</span>
        <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">Quatre étapes, aucun tracas</h2>
        <p className="mt-4 text-muted-foreground">
          De la découverte à la livraison, nous nous occupons de tout. Vous payez uniquement à la commande, puis les frais de transit à l'arrivée.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-3xl bg-card border border-border/60 p-6 hover:shadow-elevated hover:-translate-y-1 transition-all">
            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold flex items-center justify-center">
              {i + 1}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-primary flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ SOURCING BANNER ============ */
function SourcingBanner() {
  return (
    <section className="container-kiosk py-8">
      <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 text-sidebar-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Sourcing à la demande
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
            Un produit introuvable ?<br />
            <span className="text-accent">Nous le trouvons pour vous.</span>
          </h2>
          <p className="mt-4 text-sidebar-foreground/75 max-w-lg">
            Décrivez ce que vous cherchez. Notre équipe le source directement chez nos fournisseurs à Guangzhou ou Dubaï et vous propose un devis sous 24h.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full h-13 px-7 bg-accent text-accent-foreground hover:bg-accent-hover btn-glow">
            <Link to="/demander-un-produit">Faire une demande <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ============ TESTIMONIALS ============ */
function Testimonials() {
  const reviews = [
    { name: "Aminata D.", city: "Dakar", quote: "J'ai précommandé un casque de Chine. Livré en 15 jours par avion, exactement comme promis. Service impeccable.", rating: 5 },
    { name: "Ibrahima S.", city: "Thiès", quote: "Le sourcing sur mesure est génial. J'ai reçu un devis en moins de 24h pour un article introuvable au Sénégal.", rating: 5 },
    { name: "Fatou N.", city: "Saint-Louis", quote: "Le paiement en deux fois m'a permis de commander une montre premium sans me priver. Merci Kiosk !", rating: 5 },
  ];
  return (
    <section className="container-kiosk py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Ils nous font confiance</span>
        <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">Ce que nos clients disent</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {reviews.map((r) => (
          <div key={r.name} className="rounded-3xl bg-card border border-border/60 p-6 md:p-7 hover:shadow-elevated hover:-translate-y-1 transition-all">
            <div className="flex gap-0.5 text-accent">
              {Array.from({ length: r.rating }).map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.5L10 13.7 4.2 17.5l2-6.5L1 7h6.4z" /></svg>
              ))}
            </div>
            <p className="mt-4 text-foreground leading-relaxed">"{r.quote}"</p>
            <div className="mt-5 pt-5 border-t border-border">
              <div className="text-sm font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
