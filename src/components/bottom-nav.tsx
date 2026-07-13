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

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  if (location.pathname.startsWith("/produit/")) return null;

  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 rounded-full bg-sidebar px-1.5 py-1.5 shadow-2xl border border-sidebar-foreground/10 backdrop-blur-lg"
      style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {links.map((link) => {
        const active = isActive(link.to);
        return (
          <Link
            key={link.label}
            to={link.to}
            aria-label={link.label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[52px] px-2 rounded-full transition-all ${
              active
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5"
            }`}
          >
            <link.icon className="w-5 h-5" aria-hidden="true" />
            <span className={`text-[10px] font-medium mt-0.5 leading-none ${active ? "opacity-100" : "opacity-80"}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
