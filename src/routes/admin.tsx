import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Wallet, LayoutDashboard, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — Kiosk" }, { name: "robots", content: "noindex" }] }),
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/soldes", label: "Soldes clients", icon: Wallet },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["my-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return data?.map((r) => r.role) ?? [];
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion", search: { redirect: location.pathname }, replace: true });
  }, [user, loading, navigate, location.pathname]);

  if (loading || roleLoading || !user) {
    return <div className="container-kiosk py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isAdmin = role?.includes("admin") || role?.includes("staff");

  if (!isAdmin) {
    return (
      <div className="container-kiosk py-24">
        <div className="max-w-md mx-auto bg-card border border-border/60 rounded-3xl p-8 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h1 className="font-display text-xl font-bold">Accès restreint</h1>
          <p className="text-muted-foreground mt-2 text-sm">Cette zone est réservée à l'équipe Kiosk.</p>
          <Link to="/" className="inline-block mt-6 text-primary font-medium hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-kiosk py-8 md:py-12">
      <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-card border border-border/60 rounded-3xl p-4">
            <div className="px-3 py-3 border-b border-border mb-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Espace</div>
              <div className="font-display font-bold mt-0.5">Admin Kiosk</div>
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
            </nav>
          </div>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
