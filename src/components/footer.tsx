import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { KioskLogo } from "./kiosk-logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-kiosk py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <KioskLogo variant="dark" />
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Importé pour vous. Livré chez vous. La nouvelle façon d'acheter à l'international depuis le Sénégal.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
                  aria-label="Réseau social"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Boutique"
            links={[
              { to: "/catalogue", label: "Tout le catalogue" },
              { to: "/catalogue?origine=CN", label: "Produits de Chine" },
              { to: "/catalogue?origine=AE", label: "Produits de Dubaï" },
              { to: "/demander-un-produit", label: "Sourcing à la demande" },
            ]}
          />
          <FooterCol
            title="Kiosk"
            links={[
              { to: "/comment-ca-marche", label: "Comment ça marche" },
              { to: "/realisations", label: "Réalisations" },
              { to: "/connexion", label: "Mon compte" },
              { to: "/connexion", label: "Suivre ma commande" },
            ]}
          />
          <FooterCol
            title="Assistance"
            links={[
              { to: "#", label: "Centre d'aide" },
              { to: "#", label: "Frais et délais" },
              { to: "#", label: "Modes de paiement" },
              { to: "#", label: "Nous contacter" },
            ]}
          />
        </div>

        <div className="mt-14 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <div>© {new Date().getFullYear()} Kiosk. Tous droits réservés. Dakar, Sénégal.</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-primary-foreground">Mentions légales</Link>
            <Link to="#" className="hover:text-primary-foreground">Confidentialité</Link>
            <Link to="#" className="hover:text-primary-foreground">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50 mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
