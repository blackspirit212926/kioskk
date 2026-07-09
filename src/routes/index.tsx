import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Plane, Ship, Search, Package, CreditCard, Truck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCompact } from "@/lib/format";
import heroImg from "@/assets/hero-products.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
      <SourcingBanner />
      <Testimonials />
    </>
  );
}

/* ============ HERO ============ */
const TRUST_RIBBONS = ["12 000+ clients satisfaits", "Livraison partout au Sénégal", "Paiement 100% sécurisé"];

const HERO_REVIEWERS = ["AD", "IS", "FN", "MK"];

function Hero() {
  return (
    <section className="pb-16 md:pb-20" style={{ background: "var(--gradient-hero)" }}>
      <div className="container-kiosk pt-8 md:pt-12">
        <div
          className="relative rounded-3xl overflow-hidden min-h-[600px] md:min-h-[720px] kiosk-fade-up"
          style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, oklch(0.14 0.09 265 / 0.85), oklch(0.14 0.09 265 / 0.35))" }}
          />

          <div className="relative h-full flex items-center px-6 md:px-12 lg:px-16 py-16">
            <div className="max-w-xl text-sidebar-foreground">
              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance-fix">
                Importé pour vous.
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 italic font-medium text-accent">Livré chez vous.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 8 Q 50 2, 100 6 T 198 4" stroke="oklch(0.82 0.14 75)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-sidebar-foreground/80 max-w-md leading-relaxed">
                Précommandez vos produits préférés directement depuis Guangzhou et Dubaï. Nous les sourçons, les importons et les livrons à votre porte à Dakar.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" variant="default" className="rounded-full h-13 px-7 text-base bg-accent text-accent-foreground hover:bg-accent-hover btn-glow">
                  <Link to="/catalogue">
                    Explorer le catalogue <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-13 px-7 text-base bg-transparent border-sidebar-foreground/25 text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground">
                  <Link to="/demander-un-produit">Demander un produit</Link>
                </Button>
              </div>
              <CounterRow />
            </div>
          </div>

          <div className="hidden md:flex absolute left-6 lg:left-16 bottom-28 flex-col gap-2 kiosk-fade-up" style={{ animationDelay: "0.4s" }}>
            {TRUST_RIBBONS.map((label) => (
              <div
                key={label}
                className="inline-flex items-center pl-5 pr-4 py-2 text-xs font-medium text-sidebar-foreground bg-sidebar-foreground/10 backdrop-blur w-fit"
                style={{ clipPath: "polygon(0 50%, 8% 0, 100% 0, 100% 100%, 8% 100%)" }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="hidden md:flex absolute top-6 right-6 items-center gap-3 kiosk-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex -space-x-3">
              {HERO_REVIEWERS.map((initials) => (
                <Avatar key={initials} className="w-9 h-9 border-2 border-sidebar-foreground/20">
                  <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <div className="text-xs text-sidebar-foreground/80 mt-0.5">4.9 · Basé sur 2 400+ avis</div>
            </div>
          </div>

          <HeroSearchBar variant="desktop" />
        </div>

        <HeroSearchBar variant="mobile" />
      </div>
    </section>
  );
}

function HeroSearchBar({ variant }: { variant: "desktop" | "mobile" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<"CN" | "AE" | undefined>(undefined);

  const handleSearch = () => {
    navigate({ to: "/catalogue", search: { q: query.trim() || undefined, origine: origin } });
  };

  const wrapperClassName =
    variant === "desktop"
      ? "hidden md:flex md:items-center absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 w-full max-w-2xl rounded-full bg-card shadow-elevated border border-border overflow-hidden"
      : "flex md:hidden flex-col mt-6 rounded-3xl bg-card shadow-elevated border border-border overflow-hidden";

  return (
    <div className={wrapperClassName}>
      <div className="flex-1 flex items-center gap-2 px-6 py-4 w-full">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Rechercher un produit..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className={variant === "desktop" ? "w-px h-8 bg-border self-center" : "border-t border-border"} />
      <div className="flex items-center gap-4 px-6 py-3 md:py-4 text-sm">
        {(["CN", "AE"] as const).map((code) => (
          <button
            key={code}
            onClick={() => setOrigin(origin === code ? undefined : code)}
            className={`font-medium transition-colors ${origin === code ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {code === "CN" ? "Chine" : "Dubaï"}
          </button>
        ))}
      </div>
      <button
        onClick={handleSearch}
        className={
          variant === "desktop"
            ? "m-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-light transition-colors flex-shrink-0"
            : "mx-4 mb-4 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-light transition-colors"
        }
      >
        Rechercher
      </button>
    </div>
  );
}

function CounterRow() {
  const stats = [
    { end: 12400, suffix: "+", label: "Clients satisfaits" },
    { end: 3200, suffix: "+", label: "Produits importés" },
    { end: 98, suffix: "%", label: "Livraisons à l'heure" },
  ];
  return (
    <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
      {stats.map((s) => (
        <AnimatedStat key={s.label} end={s.end} suffix={s.suffix} label={s.label} />
      ))}
    </div>
  );
}

function AnimatedStat({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1400;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return (
    <div ref={ref}>
      <div className="font-display text-2xl md:text-3xl font-bold text-sidebar-foreground">
        {formatCompact(value)}
        <span className="text-accent">{suffix}</span>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60 mt-1">{label}</div>
    </div>
  );
}

/* ============ TRUST STRIP ============ */
function TrustStrip() {
  const items = [
    { icon: Ship, label: "Fret maritime", desc: "30–60 j · économique" },
    { icon: Plane, label: "Fret aérien", desc: "10–20 j · rapide" },
    { icon: ShieldCheck, label: "Paiement sécurisé", desc: "Wave, OM, Free Money" },
    { icon: Truck, label: "Livraison à Dakar", desc: "À domicile ou point relais" },
  ];
  return (
    <section className="container-kiosk -mt-8 md:-mt-12 relative z-10">
      <div className="rounded-3xl bg-card border border-border shadow-soft p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent/15 text-primary flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
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
