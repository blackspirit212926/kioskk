import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, Heart, MapPin, User, LogOut, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/compte")({
  component: AccountLayout,
  head: () => ({ meta: [{ title: "Mon compte — Kiosk" }, { name: "robots", content: "noindex" }] }),
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/compte", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/compte/commandes", label: "Mes commandes", icon: Package },
  { to: "/compte/solde", label: "Mon solde", icon: Wallet },
  { to: "/compte/favoris", label: "Favoris", icon: Heart },
  { to: "/compte/adresses", label: "Adresses", icon: MapPin },
  { to: "/compte/profil", label: "Profil", icon: User },
];

function AccountLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion", search: { redirect: location.pathname }, replace: true });
  }, [user, loading, navigate, location.pathname]);

  if (loading || !user) {
    return <div className="container-kiosk py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container-kiosk py-8 md:py-12">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-card border border-border/60 rounded-3xl p-4">
            <div className="px-3 py-3 border-b border-border mb-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Bonjour</div>
              <div className="font-semibold truncate mt-0.5">{user.user_metadata?.full_name || user.email}</div>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-surface"}`}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
              <button
                onClick={async () => { await signOut(); toast.success("Déconnecté"); navigate({ to: "/" }); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 text-destructive text-left mt-1"
              >
                <LogOut className="w-4 h-4" /> Se déconnecter
              </button>
            </nav>
          </div>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
