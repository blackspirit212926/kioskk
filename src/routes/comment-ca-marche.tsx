import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, CreditCard, Ship, Plane, Truck, PackageCheck, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comment-ca-marche")({
  component: HowItWorksPage,
  head: () => ({
    meta: [
      { title: "Comment ça marche — Kiosk" },
      { name: "description", content: "Découvrez le fonctionnement de Kiosk : précommande, sourcing, transport et livraison depuis la Chine et Dubaï." },
      { property: "og:title", content: "Comment ça marche — Kiosk" },
      { property: "og:description", content: "Précommande, import, livraison : le guide complet Kiosk." },
    ],
  }),
});

function HowItWorksPage() {
  return (
    <div className="container-kiosk py-12 md:py-20">
      <div className="max-w-3xl">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Le fonctionnement</span>
        <h1 className="mt-2 text-4xl md:text-6xl font-display font-bold leading-tight">Précommander à l'international, sans stress.</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          Kiosk est une plateforme de précommandes. Nous ne stockons rien : chaque article visible sur le catalogue est importé à votre demande, directement de Chine ou de Dubaï, puis livré à votre porte au Sénégal.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Search, n: 1, title: "Vous choisissez", desc: "Parcourez le catalogue ou faites une demande de sourcing sur mesure via notre formulaire." },
          { icon: CreditCard, n: 2, title: "Vous précommandez", desc: "Payez le prix du produit via Wave, Orange Money ou Free Money. Sur certains produits, un paiement 50/50 est possible." },
          { icon: Ship, n: 3, title: "Nous importons", desc: "Nous sourçons le produit chez nos partenaires vérifiés à Guangzhou ou Dubaï, puis l'envoyons en fret." },
          { icon: Truck, n: 4, title: "Vous recevez", desc: "Frais de transit et livraison réglés à l'arrivée. Vous êtes prévenu à chaque étape via votre espace." },
        ].map((s) => (
          <div key={s.n} className="relative rounded-3xl bg-card border border-border/60 p-7">
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-lg flex items-center justify-center shadow-elevated">
              {s.n}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-primary flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Freight modes */}
      <div className="mt-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Deux modes de transport</h2>
        <p className="mt-3 text-muted-foreground">Choisissez selon votre budget et votre urgence.</p>
        <div className="mt-8 grid md:grid-cols-2 gap-4 md:gap-6">
          <ModeCard
            icon={Ship}
            title="Fret maritime"
            duration="30 à 60 jours"
            best="Idéal pour les commandes volumineuses ou peu urgentes."
            pros={["Frais de transit économiques", "Pas de limite de poids", "Empreinte carbone plus faible"]}
          />
          <ModeCard
            icon={Plane}
            title="Fret aérien"
            duration="10 à 20 jours"
            best="Parfait pour les produits urgents ou de petite taille."
            pros={["Rapide et sécurisé", "Idéal pour l'électronique", "Suivi précis"]}
            accent
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 rounded-3xl bg-surface/60 border border-border/60 p-8 md:p-14">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Questions fréquentes</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">Les questions que vous vous posez.</h2>
            <p className="mt-4 text-muted-foreground">
              Une autre question ? Notre équipe est disponible via WhatsApp et par email.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full h-12">
              <Link to="/demander-un-produit"><MessageCircle className="w-4 h-4 mr-2" /> Nous écrire</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { q: "Pourquoi le prix affiché n'inclut-il pas la livraison ?", a: "Les frais de transit dépendent du poids et du volume final du colis. Ils sont calculés à l'arrivée et payés à la livraison, pour être toujours justes." },
              { q: "Puis-je payer en deux fois ?", a: "Oui, sur les produits éligibles. Vous verrez la mention « Paiement en deux fois disponible » sur la fiche produit." },
              { q: "Que se passe-t-il si le produit ne me plaît pas ?", a: "Nous vérifions la conformité de chaque produit avant expédition. En cas de défaut, un remboursement ou remplacement est proposé." },
              { q: "Livrez-vous en dehors de Dakar ?", a: "Oui, dans toutes les régions du Sénégal via nos partenaires logistiques. Un supplément s'applique selon la destination." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl bg-card border border-border/60 p-5 cursor-pointer">
                <summary className="font-semibold text-sm marker:hidden list-none flex justify-between items-center">
                  {f.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 rounded-[2rem] p-8 md:p-12 text-primary-foreground text-center" style={{ background: "var(--gradient-hero)" }}>
        <Sparkles className="w-8 h-8 text-accent mx-auto" />
        <h2 className="mt-3 text-2xl md:text-4xl font-display font-bold">Prêt à précommander ?</h2>
        <p className="mt-3 text-primary-foreground/70">Découvrez le catalogue ou lancez une demande sur mesure.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full h-12 px-7 bg-accent text-accent-foreground hover:bg-accent-hover">
            <Link to="/catalogue">Explorer le catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-7 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/demander-un-produit">Demander un produit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, title, duration, best, pros, accent }: { icon: typeof Ship; title: string; duration: string; best: string; pros: string[]; accent?: boolean }) {
  return (
    <div className={`rounded-3xl p-8 border ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60"}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accent ? "bg-accent text-accent-foreground" : "bg-accent/15 text-primary"}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-5 text-2xl font-display font-bold">{title}</h3>
      <div className={`mt-1 text-sm ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{duration}</div>
      <p className={`mt-4 ${accent ? "text-primary-foreground/80" : "text-foreground"}`}>{best}</p>
      <ul className={`mt-5 space-y-2 text-sm ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {pros.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <PackageCheck className={`w-4 h-4 ${accent ? "text-accent" : "text-success"}`} /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
