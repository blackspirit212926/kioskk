import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, PackageCheck, Ship, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/realisations")({
  component: RealisationsPage,
  head: () => ({
    meta: [
      { title: "Réalisations Kiosk — Colis livrés au Sénégal" },
      { name: "description", content: "Découvrez les commandes réussies de nos clients : produits importés de Chine et Dubaï et livrés au Sénégal." },
    ],
  }),
});

const SHOWCASE = [
  { name: "Aminata D.", city: "Dakar", product: "Casque Bluetooth Premium", origin: "Chine", mode: "air", days: 15, rating: 5, quote: "Livré exactement comme promis, en parfait état." },
  { name: "Ibrahima S.", city: "Thiès", product: "Montre connectée Titan Pro", origin: "Chine", mode: "sea", days: 42, rating: 5, quote: "Prix imbattable comparé aux boutiques locales." },
  { name: "Fatou N.", city: "Saint-Louis", product: "Parfum Oud Oriental", origin: "Dubaï", mode: "air", days: 12, rating: 5, quote: "Un parfum introuvable ici, un rêve devenu réel." },
  { name: "Mamadou C.", city: "Rufisque", product: "Sneakers Minimal Blanches", origin: "Dubaï", mode: "air", days: 14, rating: 5, quote: "Cuir premium, exactement la taille attendue." },
  { name: "Aïcha B.", city: "Dakar", product: "Sac cabas Milano tan", origin: "Dubaï", mode: "air", days: 16, rating: 5, quote: "Emballage soigné, finition impeccable." },
  { name: "Ousmane D.", city: "Kaolack", product: "Enceinte portable Boom", origin: "Chine", mode: "sea", days: 38, rating: 4, quote: "Livraison un peu longue mais son incroyable." },
];

function RealisationsPage() {
  return (
    <div className="container-kiosk py-12 md:py-20">
      <div className="max-w-3xl">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Réalisations</span>
        <h1 className="mt-2 text-4xl md:text-6xl font-display font-bold leading-tight">Ils ont précommandé. Ils ont reçu.</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          Chaque semaine, des dizaines de colis arrivent à Dakar depuis la Chine et Dubaï. Voici quelques-unes de nos livraisons récentes.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {SHOWCASE.map((c, i) => (
          <div key={i} className="rounded-3xl bg-card border border-border/60 overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all">
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: c.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">"{c.quote}"</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-surface px-3 py-2">
                  <div className="text-muted-foreground">Produit</div>
                  <div className="font-medium truncate">{c.product}</div>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                  <div className="text-muted-foreground">Livré en</div>
                  <div className="font-medium flex items-center gap-1">
                    {c.mode === "air" ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />} {c.days} j
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-success">
                <PackageCheck className="w-3.5 h-3.5" /> Livraison confirmée · {c.origin}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] p-8 md:p-12 text-primary-foreground text-center" style={{ background: "var(--gradient-hero)" }}>
        <h2 className="text-2xl md:text-4xl font-display font-bold">La prochaine livraison sera la vôtre.</h2>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full h-12 px-7 bg-accent text-accent-foreground hover:bg-accent-hover">
            <Link to="/catalogue">Voir le catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-7 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/demander-un-produit">Demander un produit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
