import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { KioskLogo } from "./kiosk-logo";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { CURRENCY_META, type Currency } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/catalogue", label: "Catalogue" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/realisations", label: "Réalisations" },
  { to: "/demander-un-produit", label: "Sourcing" },
] as const;

export function Navbar() {
  const { count, openDrawer } = useCart();
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to: string) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-background/80 border-b border-border/60 shadow-[0_2px_20px_-8px_oklch(0.15_0.05_265/0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-kiosk flex h-16 md:h-20 items-center gap-4">
        <KioskLogo />

        <nav className="hidden lg:flex items-center gap-1 ml-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                isActive(link.to)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Currency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground hover:bg-surface transition-colors"
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

        <Link
          to="/catalogue"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-surface transition-colors"
          aria-label="Recherche"
        >
          <Search className="w-4.5 h-4.5" />
        </Link>

        <Link
          to="/connexion"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-surface transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
        </Link>

        <Link
          to="/connexion"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-surface transition-colors"
          aria-label="Mon compte"
        >
          <User className="w-4.5 h-4.5" />
        </Link>

        <button
          onClick={openDrawer}
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-surface transition-colors"
          aria-label={`Panier (${count} article${count > 1 ? "s" : ""})`}
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </button>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-surface transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[400px] bg-background border-l">
            <div className="flex flex-col h-full pt-4">
              <div className="flex items-center justify-between mb-8">
                <KioskLogo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3.5 rounded-2xl text-lg font-medium transition-colors ${
                      isActive(link.to) ? "bg-primary text-primary-foreground" : "hover:bg-surface"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 rounded-2xl text-lg font-medium hover:bg-surface flex items-center gap-3"
                >
                  <User className="w-5 h-5" /> Mon compte
                </Link>
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 rounded-2xl text-lg font-medium hover:bg-surface flex items-center gap-3"
                >
                  <Heart className="w-5 h-5" /> Mes favoris
                </Link>
              </nav>
              <div className="mt-auto pb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Devise</div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CURRENCY_META) as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        currency === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent border-border hover:bg-surface"
                      }`}
                    >
                      {CURRENCY_META[c].flag} {CURRENCY_META[c].symbol}
                    </button>
                  ))}
                </div>
                <Button asChild variant="default" className="w-full mt-4 rounded-full h-12" onClick={() => setMobileOpen(false)}>
                  <Link to="/demander-un-produit">Demander un produit</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
