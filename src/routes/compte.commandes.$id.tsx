import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, MapPin, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { STATUS_LABELS, STATUS_TIMELINE } from "@/lib/order-status";

export const Route = createFileRoute("/compte/commandes/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { currency, rates } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!data) return <div className="bg-card border border-border/60 rounded-3xl p-10 text-center">Commande introuvable.</div>;

  const currentIndex = STATUS_TIMELINE.indexOf(data.status as typeof STATUS_TIMELINE[number]);
  const cancelled = data.status === "cancelled" || data.status === "refunded";
  const addr = (data.address_snapshot ?? {}) as Record<string, string>;

  return (
    <div>
      <Link to="/compte/commandes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Toutes mes commandes
      </Link>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{data.order_number}</h1>
          <p className="text-muted-foreground text-sm mt-1">Créée le {new Date(data.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${cancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {STATUS_LABELS[data.status] ?? data.status}
        </span>
      </div>

      {!cancelled && (
        <div className="mt-6 bg-card border border-border/60 rounded-3xl p-6">
          <h2 className="font-display font-bold mb-5">Suivi</h2>
          <ol className="relative">
            {STATUS_TIMELINE.map((s, i) => {
              const done = i <= currentIndex;
              const current = i === currentIndex;
              return (
                <li key={s} className="flex gap-4 pb-6 last:pb-0 relative">
                  {i < STATUS_TIMELINE.length - 1 && (
                    <span className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${done ? "bg-primary" : "bg-border"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"} ${current ? "ring-4 ring-primary/20" : ""}`}>
                    {done ? <Check className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className="pt-1">
                    <div className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{STATUS_LABELS[s]}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border/60 rounded-3xl p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Articles</h2>
          <ul className="space-y-4">
            {data.order_items?.map((it) => (
              <li key={it.id} className="flex gap-3">
                <img src={resolveImage(it.image_url)} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-2">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground">× {it.quantity} · {formatPrice(Number(it.unit_price_xof), currency, rates)}</div>
                </div>
                <div className="text-sm font-semibold">{formatPrice(Number(it.unit_price_xof) * it.quantity, currency, rates)}</div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border mt-5 pt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total payé</span>
            <span className="font-display text-xl font-bold">{formatPrice(Number(data.total_paid_xof), currency, rates)}</span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Livraison</h2>
          <div className="text-sm space-y-1">
            <div className="font-medium">{addr.recipient}</div>
            <div className="text-muted-foreground">{addr.phone}</div>
            <div className="pt-2">{addr.street}</div>
            {addr.neighborhood && <div>{addr.neighborhood}</div>}
            <div>{addr.city}</div>
            {addr.details && <div className="text-muted-foreground pt-2 italic">{addr.details}</div>}
          </div>
          {data.customer_note && (
            <div className="mt-4 rounded-2xl bg-surface p-3 text-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Votre note</div>
              {data.customer_note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
