import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Heart, MapPin, ArrowRight, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/compte/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { currency, rates } = useCurrency();

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total_paid_xof, subtotal_xof, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const active = orders?.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length ?? 0;
  const delivered = orders?.filter((o) => o.status === "delivered").length ?? 0;
  const totalSpent = orders?.reduce((s, o) => s + Number(o.total_paid_xof || 0), 0) ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Bienvenue 👋</h1>
      <p className="text-muted-foreground mt-1">Voici un aperçu de votre activité Kiosk.</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <StatCard icon={Clock} label="Commandes en cours" value={String(active)} tone="primary" />
        <StatCard icon={CheckCircle2} label="Commandes livrées" value={String(delivered)} tone="success" />
        <StatCard icon={ShoppingBag} label="Total dépensé" value={formatPrice(totalSpent, currency, rates)} tone="accent" />
      </div>

      <div className="mt-8 bg-card border border-border/60 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Dernières commandes</h2>
          <Link to="/compte/commandes" className="text-sm text-primary hover:underline flex items-center gap-1">Tout voir <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <div>Aucune commande pour l'instant.</div>
            <Link to="/catalogue" className="inline-block mt-3 text-primary font-medium hover:underline">Découvrir le catalogue →</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(Number(o.total_paid_xof), currency, rates)}</div>
                  <div className="text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full bg-surface">{STATUS_LABELS[o.status] ?? o.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <QuickLink to="/compte/favoris" icon={Heart} title="Mes favoris" desc="Retrouvez vos produits sauvegardés." />
        <QuickLink to="/compte/adresses" icon={MapPin} title="Mes adresses" desc="Gérez vos points de livraison." />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "primary" | "success" | "accent" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent/15 text-accent-foreground",
  } as const;
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon className="w-5 h-5" /></div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: "/compte/favoris" | "/compte/adresses"; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Link to={to} className="group bg-card border border-border/60 rounded-3xl p-5 hover:border-primary/50 transition-colors flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
