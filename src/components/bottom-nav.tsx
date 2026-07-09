import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, Sparkles, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/catalogue", label: "Catalogue", icon: LayoutGrid },
    { to: "/demander-un-produit", label: "Sourcing", icon: Sparkles },
    { to: user ? "/compte" : "/connexion", label: "Compte", icon: User },
  ] as const;

  const isActive = (to: string) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full bg-sidebar px-1.5 py-1.5 shadow-xl border border-sidebar-foreground/10">
      {links.map((link) => {
        const active = isActive(link.to);
        return (
          <Link
            key={link.label}
            to={link.to}
            aria-label={link.label}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-sidebar-foreground/60"
            }`}
          >
            <link.icon className="w-5 h-5" />
          </Link>
        );
      })}
    </nav>
  );
}
