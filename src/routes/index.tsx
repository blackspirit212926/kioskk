import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  Package,
  Check,
  Star,
  Sparkles,
  Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/* ---------- helpers ---------- */
const Serif = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`italic font-normal ${className}`} style={{ fontFamily: "var(--font-serif)" }}>
    {children}
  </span>
);

const StarBadge = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-accent ${className}`}
  >
    <Sparkles className="w-4 h-4" strokeWidth={2.2} />
  </span>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">
    {children}
  </span>
);

function HomePage() {
  return (
    <div className="bg-background">
      <Hero />
      <LogoStrip />
      <Features />
      <CaseStudies />
      <WhyKiosk />
      <ThreeSteps />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}

/* ============================================================
   HERO — editorial cream split (Viral-inspired)
   ============================================================ */
function Hero() {
  return (
    <section className="relative pt-8 md:pt-12 pb-16 md:pb-24">
      <div className="container-kiosk">
        {/* Top row : brand mini-badge + small nav chips (visual echo of ref) */}
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div className="flex items-center gap-2">
            <StarBadge />
            <span className="font-display font-bold text-primary text-lg">Kiosk</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[13px] text-primary/70">
            {["Catalogue", "Sourcing", "Comment ça marche", "Contact"].map((l) => (
              <span key={l} className="px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center">
          {/* Left column */}
          <div className="kiosk-fade-up">
            <Chip>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Précommandes ouvertes
            </Chip>

            <h1 className="mt-5 font-display font-bold tracking-tight leading-[0.98] text-primary text-[3rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] text-balance-fix">
              Importé
              <br />
              <Serif className="text-primary/85">avec soin</Serif>.
            </h1>

            <p className="mt-6 max-w-lg text-base md:text-lg text-primary/70 leading-relaxed">
              Kiosk source, transporte et livre pour vous, depuis la{" "}
              <Serif className="text-primary">Chine</Serif> et{" "}
              <Serif className="text-primary">Dubaï</Serif> jusqu'à votre porte à Dakar. Paiement en
              Mobile Money, suivi transparent.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/catalogue"
                className="group inline-flex items-center gap-2 h-12 pl-5 pr-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-light transition-all"
              >
                Découvrir le catalogue
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                </span>
              </Link>
              <Link
                to="/comment-ca-marche"
                className="inline-flex items-center h-12 px-5 rounded-full border border-primary/15 text-primary font-medium text-sm hover:bg-primary/5 transition-colors"
              >
                Comment ça marche
              </Link>
            </div>

            {/* social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["#FFBC56", "#11114B", "#78BFA5", "#E56A54"].map((c) => (
                  <div
                    key={c}
                    className="w-9 h-9 rounded-full border-2 border-background"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-primary/60 mt-0.5">
                  +100 clients servis au Sénégal
                </div>
              </div>
            </div>
          </div>

          {/* Right column — tall portrait mockup */}
          <div className="relative kiosk-fade-up" style={{ animationDelay: "0.1s" }}>
            <HeroCard />
            <span className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-accent flex items-center justify-center shadow-elevated">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Cream mockup card showing a real featured product */
function HeroCard() {
  const { data } = useQuery({
    queryKey: ["home-hero-single"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price_xof, product_images(url)")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data
        ? { ...data, image_url: data.product_images?.[0]?.url ?? null }
        : null;
    },
  });

  return (
    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface border border-border">
      {data?.image_url ? (
        <img
          src={data.image_url}
          alt={data.name}
          className="w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-primary/30">
          <Package className="w-16 h-16" />
        </div>
      )}
      {/* Bottom info pill */}
      {data && (
        <Link
          to="/produit/$slug"
          params={{ slug: data.slug }}
          className="absolute left-4 right-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-background/95 backdrop-blur px-4 py-3 border border-border shadow-soft group hover:bg-background transition-colors"
        >
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-primary/50 font-semibold">
              À la une
            </div>
            <div className="font-semibold text-sm text-primary truncate">{data.name}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-primary tabular-nums">
              {data.price_xof.toLocaleString("fr-FR")} FCFA
            </span>
            <span className="w-8 h-8 rounded-full bg-primary text-accent grid place-items-center group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

/* ============================================================
   LOGO STRIP — proof / trust bar (partenaires paiement + transit)
   ============================================================ */
function LogoStrip() {
  const items = ["Wave", "Orange Money", "Free Money", "DHL", "Guangzhou", "Dubaï"];
  return (
    <section className="border-y border-border/60 bg-surface/40 py-6">
      <div className="container-kiosk flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-primary/50 font-semibold mr-4">
          Ils facilitent Kiosk
        </span>
        {items.map((n) => (
          <span
            key={n}
            className="font-display font-bold text-primary/40 text-lg md:text-xl tracking-tight hover:text-primary/70 transition-colors"
          >
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES — "How we can help you groooow"
   ============================================================ */
function Features() {
  const items = [
    {
      icon: ShoppingBag,
      chip: "Catalogue",
      title: "Achats internationaux",
      desc: "Des centaines de produits déjà sourcés en Chine et à Dubaï, prêts à précommander en un clic.",
    },
    {
      icon: Truck,
      chip: "Logistique",
      title: "Transit géré de bout en bout",
      desc: "Aérien 10–30 j ou maritime 45–60 j. Le mode et le prix sont affichés avant paiement.",
    },
    {
      icon: ShieldCheck,
      chip: "Paiement",
      title: "Mobile Money FCFA",
      desc: "Réglez avec Wave, Orange Money ou Free Money. Aucune carte bancaire internationale requise.",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="container-kiosk">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Chip>Services</Chip>
          <h2 className="mt-5 font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.02]">
            Comment Kiosk vous <Serif>simplifie</Serif> l'import.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {items.map((it, i) => (
            <article
              key={it.title}
              className="group relative rounded-[1.75rem] bg-card border border-border/70 p-7 md:p-8 hover:shadow-elevated hover:-translate-y-1 transition-all overflow-hidden"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Decorative visual on top */}
              <div className="relative h-40 -mx-3 -mt-3 mb-6 rounded-2xl bg-surface flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-40" style={{
                  background: "radial-gradient(circle at 30% 30%, oklch(0.82 0.14 75 / 0.35), transparent 60%)",
                }} />
                <it.icon className="w-14 h-14 text-primary relative" strokeWidth={1.4} />
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary text-accent grid place-items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <Chip>{it.chip}</Chip>
              <h3 className="mt-3 font-display font-bold text-xl md:text-2xl text-primary">
                {it.title}
              </h3>
              <p className="mt-2 text-sm md:text-[15px] text-primary/65 leading-relaxed">
                {it.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CASE STUDIES — warm tan editorial cards (Viral "Glowhaus" style)
   ============================================================ */
function CaseStudies() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="container-kiosk max-w-6xl">
        <div className="space-y-6 md:space-y-8">
          <CaseCard
            tone="sand"
            chip="Étude de cas"
            title={<>Précommande <Serif>éclair</Serif> depuis Guangzhou</>}
            desc="Aminata a précommandé un lot de sacs, expédié en aérien avec suivi photo à chaque étape. Livraison à Dakar en 17 jours."
            stats={[
              { k: "17 j", v: "délai réel" },
              { k: "100 %", v: "en Mobile Money" },
            ]}
            reverse={false}
          />
          <CaseCard
            tone="cream"
            chip="Sourcing sur mesure"
            title={<>Trouver <Serif>l'introuvable</Serif> à Dubaï</>}
            desc="Jean-Marc cherchait un modèle discontinué. Devis Kiosk en 24 h, produit vérifié, précommandé, reçu 3 semaines plus tard."
            stats={[
              { k: "24 h", v: "délai devis" },
              { k: "3 sem.", v: "livraison porte" },
            ]}
            reverse
          />
        </div>
      </div>
    </section>
  );
}

function CaseCard({
  tone,
  chip,
  title,
  desc,
  stats,
  reverse,
}: {
  tone: "sand" | "cream";
  chip: string;
  title: React.ReactNode;
  desc: string;
  stats: { k: string; v: string }[];
  reverse: boolean;
}) {
  const bg =
    tone === "sand"
      ? "bg-[oklch(0.88_0.05_75)]"
      : "bg-[oklch(0.95_0.02_75)]";
  return (
    <article
      className={`${bg} rounded-[2rem] p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center border border-border/60`}
    >
      <div className={`${reverse ? "md:order-2" : ""} min-h-[240px] md:min-h-[300px] rounded-2xl bg-primary/[0.06] border border-primary/10 grid place-items-center overflow-hidden relative`}>
        <span className="w-20 h-20 rounded-full bg-primary text-accent grid place-items-center">
          <Sparkles className="w-8 h-8" />
        </span>
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          background: "radial-gradient(600px 300px at 70% 30%, oklch(0.82 0.14 75 / 0.4), transparent 60%)",
        }} />
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <Chip>{chip}</Chip>
        <h3 className="mt-4 font-display font-bold tracking-tight text-3xl md:text-4xl text-primary leading-[1.05]">
          {title}
        </h3>
        <p className="mt-4 text-primary/70 leading-relaxed max-w-lg">{desc}</p>
        <div className="mt-7 flex gap-10">
          {stats.map((s) => (
            <div key={s.k}>
              <div className="font-display font-bold text-3xl md:text-4xl text-primary tabular-nums">
                {s.k}
              </div>
              <div className="text-xs uppercase tracking-widest text-primary/55 mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   WHY KIOSK — "keep things nice and simple" 3-column list
   ============================================================ */
function WhyKiosk() {
  const points = [
    {
      title: "Prix transparent",
      desc: "Le prix produit et le transit sont affichés avant que vous ne payiez.",
    },
    {
      title: "Suivi temps réel",
      desc: "Chaque étape est notifiée : sourcing, embarquement, transit, livraison.",
    },
    {
      title: "Livraison porte à porte",
      desc: "Notre livreur vous appelle dès l'arrivée à Dakar et dépose chez vous.",
    },
  ];

  return (
    <section className="py-24 md:py-32 border-t border-border/60">
      <div className="container-kiosk max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Chip>Notre approche</Chip>
          <h2 className="mt-5 font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.02]">
            On garde ça <Serif>simple</Serif> et sans stress.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-14 relative">
          {/* dashed separators between columns (md+) */}
          <div aria-hidden className="hidden md:block absolute top-0 left-1/3 -translate-x-1/2 h-full border-l border-dashed border-border" />
          <div aria-hidden className="hidden md:block absolute top-0 left-2/3 -translate-x-1/2 h-full border-l border-dashed border-border" />
          {points.map((p) => (
            <div key={p.title} className="text-center md:text-left">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-accent">
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <h3 className="mt-4 font-display font-bold text-xl text-primary">{p.title}</h3>
              <p className="mt-2 text-sm text-primary/65 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   THREE STEPS — light editorial timeline
   ============================================================ */
function ThreeSteps() {
  const steps = [
    {
      n: "01",
      eyebrow: "1ère étape",
      title: "Parcourez le catalogue",
      desc: "Produits Chine & Dubaï, prix et délai affichés avant précommande. Choisissez, ajoutez au panier.",
    },
    {
      n: "02",
      eyebrow: "2ème étape",
      title: "Payez par Mobile Money",
      desc: "Wave, Orange Money ou Free Money. Vous réglez le prix produit maintenant, le transit à l'arrivée.",
    },
    {
      n: "03",
      eyebrow: "3ème étape",
      title: "Recevez chez vous",
      desc: "Suivi temps réel jusqu'à votre porte. Notre livreur vous appelle dès l'arrivée du colis.",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-surface/50 border-y border-border/60">
      <div className="container-kiosk max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Chip>Comment ça marche</Chip>
          <h2 className="mt-5 font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.02]">
            3 étapes, <Serif>c'est tout</Serif>.
          </h2>
          <p className="mt-4 text-primary/65">
            Précommande à l'international, sans stress. Vous choisissez, vous précommandez, nous
            importons, vous recevez.
          </p>
        </div>

        <div className="space-y-4 md:space-y-5">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 rounded-[1.75rem] bg-card border border-border/70 p-5 md:p-7 hover:shadow-soft transition-shadow kiosk-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="font-display font-bold text-4xl md:text-6xl text-primary/15 tabular-nums leading-none">
                {s.n}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary/50">
                  {s.eyebrow}
                </span>
                <h3 className="mt-1 font-display font-bold text-xl md:text-2xl text-primary">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm md:text-[15px] text-primary/65 leading-relaxed max-w-2xl">
                  {s.desc}
                </p>
              </div>
              <span className="hidden md:inline-flex w-11 h-11 rounded-full bg-primary text-accent items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS — single editorial quote card
   ============================================================ */
function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-kiosk max-w-4xl">
        <div className="rounded-[2rem] bg-[oklch(0.92_0.04_75)] border border-border/60 p-8 md:p-14 relative overflow-hidden">
          <Quote className="w-10 h-10 text-primary/25 mb-4" />
          <blockquote className="font-display font-bold tracking-tight text-2xl md:text-4xl leading-[1.15] text-primary text-balance-fix">
            "Précommande envoyée le matin, livrée en 15 jours par avion. Le suivi était{" "}
            <Serif>clair</Serif>, exactement comme promis."
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-accent grid place-items-center font-display font-bold text-lg">
              A
            </div>
            <div>
              <div className="font-semibold text-primary">Aminata D.</div>
              <div className="text-sm text-primary/60">Cliente — Dakar</div>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA — cream card with dark pill button
   ============================================================ */
function FinalCTA() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="container-kiosk max-w-5xl">
        <div className="relative rounded-[2rem] md:rounded-[2.5rem] bg-card border border-border/60 p-10 md:p-16 text-center overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.82 0.14 75 / 0.45), transparent 65%)",
            }}
          />
          <div className="relative">
            <StarBadge className="mx-auto" />
            <h2 className="mt-6 font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.02] max-w-2xl mx-auto">
              Votre prochaine commande commence <Serif>ici</Serif>.
            </h2>
            <p className="mt-5 text-primary/65 max-w-lg mx-auto">
              Rejoignez +100 sénégalais qui commandent ce qu'ils veulent depuis la Chine et Dubaï,
              payé en Mobile Money.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/catalogue"
                className="group inline-flex items-center gap-2 h-12 pl-5 pr-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-light transition-all"
              >
                Voir les produits
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                </span>
              </Link>
              <Link
                to="/demander-un-produit"
                className="inline-flex items-center h-12 px-5 rounded-full border border-primary/15 text-primary font-medium text-sm hover:bg-primary/5 transition-colors"
              >
                Créer une demande sur mesure
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
