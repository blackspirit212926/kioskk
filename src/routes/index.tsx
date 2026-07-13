import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  RotateCcw,
  Sparkles,
  Package,
  X,
  Check,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
// price rendering uses inline FCFA formatting

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <WhyKiosk />
      <ThreeSteps />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

/* ============================================================
   HERO — Eazyy-inspired: big serif-italic headline + mockup
   ============================================================ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary pt-16 md:pt-20 pb-24 md:pb-32">
      {/* subtle grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.14 75 / 0.35), oklch(0.22 0.10 275 / 0.15) 55%, transparent 75%)",
        }}
      />

      <div className="container-kiosk relative max-w-4xl mx-auto text-center kiosk-fade-up">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light/60 border border-white/15 text-[11px] font-semibold uppercase tracking-wider text-background">
          <Star className="w-3 h-3 fill-accent text-accent" />
          Précommandes ouvertes — Chine & Dubaï
        </span>

        <h1 className="mt-6 font-display font-bold tracking-tight leading-[1.02] text-balance-fix text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] text-background">
          La{" "}
          <span
            className="italic font-normal text-background/90"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Chine
          </span>{" "}
          et{" "}
          <span
            className="italic font-normal text-background/90"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Dubaï
          </span>
          , à portée de{" "}
          <span
            className="italic font-normal text-background/90"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            clic
          </span>
          <span className="text-accent">.</span>
        </h1>


        <p className="mt-7 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Précommandez vos produits préférés, réglez par Wave, Orange Money ou Free Money.
          Kiosk source, importe et livre à votre porte — de Guangzhou et Dubaï jusqu'à Dakar.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full h-13 px-7 text-base bg-primary text-primary-foreground hover:bg-primary-light btn-glow"
          >
            <Link to="/catalogue">
              Découvrir le catalogue <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full h-13 px-7 text-base border-2 border-primary bg-primary text-primary-foreground hover:bg-primary-light"
          >
            <Link to="/compte/commandes">
              <Package className="w-4 h-4 mr-1" /> Mes commandes
            </Link>
          </Button>
        </div>

        {/* social proof row */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["#FFBC56", "#11114B", "#78BFA5", "#E56A54", "#8A6DE1"].map((c) => (
              <div
                key={c}
                className="w-8 h-8 rounded-full border-2 border-background"
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">+100 clients satisfaits</span>
          </div>
        </div>
      </div>

      {/* Big browser mockup */}
      <div className="container-kiosk relative mt-16 md:mt-20 max-w-5xl mx-auto">
        <BrowserMockup />
      </div>
    </section>
  );
}

/* ---------- Browser mockup with real featured products ---------- */
function BrowserMockup() {
  const { data } = useQuery({
    queryKey: ["home-hero-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, slug, name, price_xof, compare_at_price_xof, product_images(url, sort_order)",
        )
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(4);
      return (data ?? []).map((p) => ({
        ...p,
        image_url: p.product_images?.[0]?.url ?? null,
      }));
    },
  });

  const products = data ?? [];

  return (
    <div
      className="relative rounded-[1.75rem] bg-card shadow-elevated border border-border overflow-hidden kiosk-fade-up"
      style={{ animationDelay: "0.15s" }}
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-surface">
        <span className="w-3 h-3 rounded-full bg-destructive/70" />
        <span className="w-3 h-3 rounded-full bg-accent" />
        <span className="w-3 h-3 rounded-full bg-success/70" />
        <div className="ml-4 flex-1 max-w-md">
          <div className="rounded-full bg-card border border-border px-4 py-1.5 text-xs text-muted-foreground text-center truncate">
            kiosk.sn / catalogue
          </div>
        </div>
      </div>

      {/* fake site navbar */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border/60">
        <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <span className="text-primary font-semibold">Kiosk</span>
          <span>Catalogue</span>
          <span>Sourcing</span>
          <span>Comment ça marche</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-accent/15 text-primary font-semibold">
            FCFA
          </span>
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
            K
          </span>
        </div>
      </div>

      {/* product grid inside mockup */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 bg-background">
        {products.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl kiosk-skeleton" />
            ))
          : products.map((p) => (
              <Link
                key={p.id}
                to="/produit/$slug"
                params={{ slug: p.slug }}
                className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-square bg-surface overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-semibold line-clamp-1">{p.name}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-primary tabular-nums whitespace-nowrap">
                      {p.price_xof.toLocaleString("fr-FR")} FCFA
                    </span>
                    {p.compare_at_price_xof && p.compare_at_price_xof > p.price_xof && (
                      <span className="text-[10px] text-muted-foreground line-through tabular-nums">
                        {p.compare_at_price_xof.toLocaleString("fr-FR")} FCFA
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
      </div>

      {/* floating chat pill */}
      <div className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center">
        <ShoppingBag className="w-4.5 h-4.5" />
      </div>
    </div>
  );
}

/* ============================================================
   FEATURES — "Tout est pensé pour vous" — 2×2 card grid
   ============================================================ */
function Features() {
  const items = [
    {
      icon: ShoppingBag,
      tags: ["Chine & Dubaï", "Sourcing"],
      title: "Catalogue international",
      desc: "Choisissez parmi des centaines de produits importés directement de Chine et de Dubaï, sans passer par un revendeur.",
    },
    {
      icon: Truck,
      tags: ["Suivi", "Notifications temps réel"],
      title: "Suivi de colis transparent",
      desc: "Chaque commande est suivie en temps réel. Vous voyez chaque étape : sourcing, embarquement, transit, livraison.",
    },
    {
      icon: ShieldCheck,
      tags: ["Mobile Money", "Wave · OM · Free"],
      title: "Paiement local & sécurisé",
      desc: "Payez en FCFA depuis votre compte Wave, Orange Money ou Free Money. Aucune carte bancaire à saisir.",
    },
    {
      icon: MapPin,
      tags: ["Dakar & régions", "Porte à porte"],
      title: "Livraison fiable chez vous",
      desc: "À l'arrivée du colis à Dakar, notre livreur vous appelle et dépose la commande à votre adresse.",
    },
  ];

  const pills = [
    { icon: RotateCcw, label: "Réponse rapide", sub: "Devis sourcing sous 24h ouvrées" },
    { icon: Sparkles, label: "Achats sur mesure", sub: "Vous décrivez, nous trouvons pour vous" },
    { icon: Truck, label: "Frais transparents", sub: "Transit affiché avant précommande" },
  ];

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container-kiosk">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            Plateforme
          </span>
          <h2 className="mt-4 font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl text-primary leading-[1.05]">
            Tout est{" "}
            <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
              pensé
            </span>{" "}
            pour vous
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Une plateforme complète qui centralise tout ce dont vous avez besoin pour importer en
            toute sérénité.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
          {items.map((it) => (
            <article
              key={it.title}
              className="rounded-3xl bg-card border border-border/70 p-7 md:p-8 hover:shadow-elevated hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 text-primary flex items-center justify-center shrink-0">
                  <it.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full bg-surface text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="mt-5 font-display font-bold text-xl md:text-2xl text-primary">
                {it.title}
              </h3>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                {it.desc}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {pills.map((p) => (
            <div
              key={p.label}
              className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-card border border-border/70 shadow-soft"
            >
              <span className="w-8 h-8 rounded-full bg-accent/15 text-primary flex items-center justify-center">
                <p.icon className="w-3.5 h-3.5" />
              </span>
              <div className="text-left leading-tight">
                <div className="text-[13px] font-semibold text-primary">{p.label}</div>
                <div className="text-[10.5px] text-muted-foreground">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WHY KIOSK — problem / solution split
   ============================================================ */
function WhyKiosk() {
  const problems = [
    "Frais de transport opaques et souvent facturés au dernier moment",
    "Délais imprévisibles, aucun suivi de bout en bout",
    "Aucun recours si le produit ne correspond pas",
    "Aucune carte bancaire internationale acceptée au Sénégal",
  ];
  const solutions = [
    { title: "Prix transport affiché avant paiement", desc: "Vous voyez le coût de transit avant même de valider votre précommande." },
    { title: "Délai selon le mode choisi", desc: "Aérien (10–30 j) ou maritime (45–60 j) : le délai est annoncé au moment de la commande." },
    { title: "Suivi en temps réel", desc: "Vous suivez chaque étape de votre commande, du fournisseur jusqu'à votre porte." },
    { title: "Paiement Mobile Money instantané", desc: "Wave, Orange Money, Free Money : vous payez en FCFA, aucune carte requise." },
  ];

  return (
    <section className="bg-surface/40 py-24 md:py-32 border-y border-border/40">
      <div className="container-kiosk">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl text-primary leading-[1.05]">
            Pourquoi choisir{" "}
            <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
              Kiosk
            </span>
            <span className="text-accent"> ?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Les plateformes internationales n'ont pas été conçues pour l'Afrique. Nous, oui.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
          {/* Problem card */}
          <div className="rounded-3xl bg-card border border-border/70 p-7 md:p-8">
            <h3 className="font-display font-bold text-xl md:text-2xl text-primary">
              Le{" "}
              <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
                problème
              </span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ce que les autres solutions vous imposent :
            </p>
            <ul className="mt-5 space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-foreground/80 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution card */}
          <div className="rounded-3xl bg-card border border-border/70 p-7 md:p-8 shadow-soft">
            <h3 className="font-display font-bold text-xl md:text-2xl text-primary">
              La solution{" "}
              <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
                Kiosk
              </span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nous avons construit chaque étape autour de vous :
            </p>
            <ul className="mt-5 space-y-4">
              {solutions.map((s) => (
                <li key={s.title} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-primary">{s.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   THREE STEPS — dark vertical timeline (Waly-inspired)
   ============================================================ */
function ThreeSteps() {
  const steps = [
    {
      n: "01",
      eyebrow: "1ère étape",
      title: "Parcourez le catalogue",
      desc: "Produits Chine & Dubaï, prix transparent et délai affiché avant précommande. Choisissez ce qui vous plaît, ajoutez au panier.",
    },
    {
      n: "02",
      eyebrow: "2ème étape",
      title: "Payez par Mobile Money",
      desc: "Wave, Orange Money ou Free Money. Vous réglez le prix produit maintenant, les frais de transit à l'arrivée du colis.",
    },
    {
      n: "03",
      eyebrow: "3ème étape",
      title: "Recevez chez vous",
      desc: "Suivi temps réel jusqu'à votre porte. Notre livreur vous appelle dès que le colis est prêt à être remis.",
    },
  ];

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(1000px 500px at 20% 10%, oklch(0.28 0.12 275) 0%, transparent 60%), radial-gradient(700px 400px at 90% 90%, oklch(0.75 0.15 75 / 0.15) 0%, transparent 55%), linear-gradient(180deg, oklch(0.10 0.05 275) 0%, oklch(0.06 0.03 275) 100%)",
      }}
    >
      {/* soft grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="container-kiosk relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] uppercase tracking-[0.25em] text-white/80 font-semibold">
            Comment ça marche
          </span>
          <h2 className="mt-6 font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05]">
            3 étapes,{" "}
            <span
              className="italic font-normal text-white/85"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              c'est tout
            </span>
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-4 text-white/60">
            Précommande à l'international, sans stress. Vous choisissez, vous précommandez, nous
            importons, vous recevez.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-14">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative grid grid-cols-[auto_1fr] gap-6 md:gap-10 items-start kiosk-fade-up"
              style={{ animationDelay: `${0.05 + i * 0.1}s` }}
            >
              {/* Number column with vertical line */}
              <div className="relative flex flex-col items-center">
                <div
                  className="font-display font-bold text-6xl md:text-8xl leading-none text-white/25 tabular-nums"
                  aria-hidden
                >
                  {s.n}
                </div>
                {i < steps.length - 1 && (
                  <div className="mt-4 w-px flex-1 min-h-[80px] md:min-h-[120px] bg-gradient-to-b from-white/25 via-white/10 to-transparent" />
                )}
              </div>

              {/* Card */}
              <div className="rounded-2xl md:rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 md:p-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-[11px] text-white/70 font-medium">
                  {s.eyebrow}
                </span>
                <h3 className="mt-4 font-display font-bold text-xl md:text-2xl lg:text-3xl text-white">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm md:text-base text-white/60 leading-relaxed max-w-lg">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full h-13 px-7 bg-accent text-accent-foreground hover:bg-accent-hover btn-glow"
          >
            <Link to="/catalogue">
              Commencer maintenant <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS — Ils nous font confiance
   ============================================================ */
function Testimonials() {
  const reviews = [
    {
      name: "Aminata D.",
      city: "Dakar",
      quote:
        "Précommande envoyée le matin, livrée en 15 jours par avion. Le suivi était clair, exactement comme promis.",
    },
    {
      name: "Kora A.",
      city: "Thiès",
      quote:
        "Le paiement Mobile Money a tout changé. Plus besoin de carte bancaire pour importer, c'est aussi simple qu'un achat local.",
    },
    {
      name: "Jean-Marc I.",
      city: "Saly",
      quote:
        "J'ai demandé un produit impossible à trouver au Sénégal. Devis en 24h, précommandé, reçu 3 semaines plus tard. Bluffant.",
    },
  ];

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container-kiosk">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
            Témoignages
          </span>
          <h2 className="mt-4 font-display font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl text-primary leading-[1.05]">
            Ils nous font{" "}
            <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
              confiance
            </span>
            <span className="text-accent">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-3xl bg-card border border-border/70 p-6 md:p-7 hover:shadow-elevated hover:-translate-y-1 transition-all"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">"{r.quote}"</p>
              <div className="mt-5 pt-5 border-t border-border/70">
                <div className="text-sm font-semibold text-primary">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA — Eazyy-style dark card
   ============================================================ */
function FinalCTA() {
  return (
    <section className="container-kiosk pb-20 md:pb-28">
      <div
        className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-16 text-center text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          aria-hidden
          className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative max-w-2xl mx-auto">
          <Sparkles className="w-6 h-6 mx-auto text-accent" aria-hidden />
          <h2 className="mt-5 font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-[1.05]">
            Votre prochaine commande commence{" "}
            <span className="italic font-normal" style={{ fontFamily: "var(--font-serif)" }}>
              ici
            </span>
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-5 text-primary-foreground/75">
            Rejoignez +100 sénégalais qui commandent ce qu'ils veulent depuis la Chine et Dubaï,
            payé en Mobile Money.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full h-13 px-7 bg-accent text-accent-foreground hover:bg-accent-hover btn-glow"
            >
              <Link to="/catalogue">
                Voir les produits <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full h-13 px-7 border-2 border-white/30 bg-white/5 text-primary-foreground hover:bg-white/10"
            >
              <Link to="/demander-un-produit">Créer ma demande</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
