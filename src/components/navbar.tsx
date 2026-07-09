import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X, LogOut, Package } from "lucide-react";
import { KioskLogo } from "./kiosk-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCY_META, type Currency } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/realisations", label: "Réalisations" },
  { to: "/demander-un-produit", label: "Sourcing" },
] as const;

const PILL_ICON_BUTTON =
  "inline-flex items-center justify-center w-10 h-10 rounded-full text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground transition-colors";

export function Navbar() {
  const { count, openDrawer } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");

  const isActive = (to: string) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  const submitMobileSearch = () => {
    navigate({ to: "/catalogue", search: { q: mobileQuery.trim() || undefined } });
    setMobileOpen(false);
  };

  return (
    <div className="sticky top-4 z-50 px-4">
      <header className="max-w-4xl mx-auto flex items-center gap-4 rounded-full bg-sidebar shadow-2xl pl-5 pr-2 py-2">
        <KioskLogo variant="dark" />

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                isActive(link.to) ? "text-sidebar-foreground" : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <ThemeToggle tone="pill" className="hidden md:inline-flex" />

        {/* Currency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground transition-colors`}
              aria-label="Changer de devise"
            >
              <span className="text-base leading-none">{CURRENCY_META[currency].flag}</span>
              <span>{CURRENCY_META[currency].symbol}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {(Object.keys(CURRENCY_META) as Currency[]).map((c) => (
              <DropdownMenuItem key={c} onClick={() => setCurrency(c)}>
                <span className="mr-2">{CURRENCY_META[c].flag}</span>
                <span className="flex-1">{CURRENCY_META[c].label}</span>
                <span className="text-muted-foreground text-xs">{CURRENCY_META[c].symbol}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/catalogue" className={`hidden md:inline-flex ${PILL_ICON_BUTTON}`} aria-label="Recherche">
          <Search className="w-4.5 h-4.5" />
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition"
                aria-label="Mon compte"
              >
                {(user.user_metadata?.full_name || user.email || "?").charAt(0).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px]">
              <DropdownMenuLabel className="truncate">{user.user_metadata?.full_name || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/compte"><User className="w-4 h-4 mr-2" /> Mon compte</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/compte/commandes"><Package className="w-4 h-4 mr-2" /> Mes commandes</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/compte/favoris"><Heart className="w-4 h-4 mr-2" /> Favoris</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive"><LogOut className="w-4 h-4 mr-2" /> Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/connexion" className={`hidden md:inline-flex ${PILL_ICON_BUTTON}`} aria-label="Mon compte">
            <User className="w-4.5 h-4.5" />
          </Link>
        )}

        <button onClick={openDrawer} className={`relative ${PILL_ICON_BUTTON}`} aria-label={`Panier (${count} article${count > 1 ? "s" : ""})`}>
          <ShoppingBag className="w-4.5 h-4.5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>

        <Button
          asChild
          size="sm"
          className="hidden sm:inline-flex rounded-full bg-accent text-accent-foreground hover:bg-accent-hover px-5 h-9"
        >
          <Link to="/catalogue">Précommander</Link>
        </Button>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={`md:hidden ${PILL_ICON_BUTTON}`}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden max-w-4xl mx-auto mt-2 rounded-3xl bg-sidebar shadow-2xl p-3 kiosk-fade-up">
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/60 pointer-events-none" />
            <input
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitMobileSearch()}
              placeholder="Rechercher un produit..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-sidebar-foreground/10 text-sidebar-foreground placeholder:text-sidebar-foreground/50 outline-none"
            />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={user ? "/compte" : "/connexion"}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-2xl text-base font-medium text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground flex items-center gap-3"
            >
              <User className="w-5 h-5" /> {user ? "Mon compte" : "Connexion"}
            </Link>
            <Link
              to={user ? "/compte/favoris" : "/connexion"}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-2xl text-base font-medium text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground flex items-center gap-3"
            >
              <Heart className="w-5 h-5" /> Mes favoris
            </Link>
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="px-4 py-3 rounded-2xl text-base font-medium text-destructive text-left hover:bg-sidebar-foreground/10 flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" /> Se déconnecter
              </button>
            )}
          </nav>
          <div className="mt-3 pt-3 border-t border-sidebar-foreground/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-sidebar-foreground/50">Apparence</span>
              <ThemeToggle tone="pill" />
            </div>
            <div className="text-xs uppercase tracking-widest text-sidebar-foreground/50 mb-2">Devise</div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CURRENCY_META) as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`py-2.5 rounded-full text-sm font-medium border transition-colors ${
                    currency === c
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-transparent border-sidebar-foreground/15 text-sidebar-foreground/80 hover:bg-sidebar-foreground/10"
                  }`}
                >
                  {CURRENCY_META[c].flag} {CURRENCY_META[c].symbol}
                </button>
              ))}
            </div>
            <Button
              asChild
              className="w-full mt-4 rounded-full h-12 bg-accent text-accent-foreground hover:bg-accent-hover"
              onClick={() => setMobileOpen(false)}
            >
              <Link to="/demander-un-produit">Demander un produit</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
