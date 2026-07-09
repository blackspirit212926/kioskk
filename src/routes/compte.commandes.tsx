import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/compte/commandes")({
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const { currency, rates } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total_paid_xof, created_at, order_items(quantity, image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Mes commandes</h1>
      <p className="text-muted-foreground mt-1">Suivez l'état de vos précommandes en temps réel.</p>

      <div className="mt-6 space-y-3">
        {isLoading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {!isLoading && (!data || data.length === 0) && (
          <div className="bg-card border border-border/60 rounded-3xl p-10 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
            <h2 className="font-display font-bold text-lg">Aucune commande</h2>
            <p className="text-muted-foreground mt-1">Vos futures commandes s'afficheront ici.</p>
            <Link to="/catalogue" className="inline-block mt-4 text-primary font-medium hover:underline">Explorer le catalogue →</Link>
          </div>
        )}
        {data?.map((o) => {
          const itemsCount = o.order_items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0;
          return (
            <Link
              key={o.id}
              to="/compte/commandes/$id"
              params={{ id: o.id }}
              className="group flex items-center gap-4 bg-card border border-border/60 rounded-3xl p-4 md:p-5 hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold">{o.order_number}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface text-xs">{STATUS_LABELS[o.status] ?? o.status}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {itemsCount} article{itemsCount > 1 ? "s" : ""} · {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display font-bold">{formatPrice(Number(o.total_paid_xof), currency, rates)}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
