import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wallet, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/compte/solde")({
  component: SoldePage,
});

const OPEN_STATUSES = ["pending_payment", "payment_confirmed", "sourcing", "purchased", "in_transit", "arrived", "out_for_delivery"];

function SoldePage() {
  const { user } = useAuth();
  const { currency, rates } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["my-balances", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, order_number, status, subtotal_xof, discount_xof, payment_type, created_at, order_payments(kind, amount_xof, status)")
        .in("status", OPEN_STATUSES)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return orders;
    },
  });

  const rows = (data ?? []).map((o) => {
    const total = Number(o.subtotal_xof) - Number(o.discount_xof ?? 0);
    const confirmed = (o.order_payments ?? []).filter((p: { status: string }) => p.status === "confirmed").reduce((s: number, p: { amount_xof: number }) => s + Number(p.amount_xof), 0);
    const pending = (o.order_payments ?? []).filter((p: { status: string }) => p.status === "pending").reduce((s: number, p: { amount_xof: number }) => s + Number(p.amount_xof), 0);
    const remaining = Math.max(0, total - confirmed - pending);
    return { ...o, total, confirmed, pending, remaining };
  });

  const totalDue = rows.reduce((s, r) => s + r.remaining, 0);
  const totalPaid = rows.reduce((s, r) => s + r.confirmed, 0);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Mon solde</h1>
      <p className="text-muted-foreground mt-1">Suivi de vos versements pour chaque commande en cours.</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border/60 rounded-3xl p-5">
          <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">Total déjà payé</div>
          <div className="font-display text-2xl font-bold mt-1">{formatPrice(totalPaid, currency, rates)}</div>
        </div>
        <div className="bg-card border border-border/60 rounded-3xl p-5">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-foreground flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">Reste dû aujourd'hui</div>
          <div className="font-display text-2xl font-bold mt-1 text-primary">{formatPrice(totalDue, currency, rates)}</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {!isLoading && rows.length === 0 && (
          <div className="bg-card border border-border/60 rounded-3xl p-10 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
            <h2 className="font-display font-bold text-lg">Aucun solde en attente</h2>
            <p className="text-muted-foreground mt-1">Toutes vos commandes en cours sont à jour.</p>
          </div>
        )}
        {rows.map((r) => {
          const nextAction =
            r.remaining === 0 && r.pending > 0
              ? "En attente de confirmation admin"
              : r.remaining === 0
              ? "Tout est réglé"
              : r.payment_type === "split_50_50" && ["arrived", "out_for_delivery"].includes(r.status)
              ? "Uploader preuve du solde"
              : "Solde dû à l'arrivée";
          return (
            <Link
              key={r.id}
              to="/compte/commandes/$id"
              params={{ id: r.id }}
              className="group flex items-center gap-4 bg-card border border-border/60 rounded-3xl p-4 md:p-5 hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-primary shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold">{r.order_number}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface text-xs">{STATUS_LABELS[r.status] ?? r.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {nextAction}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">Reste dû</div>
                <div className="font-display font-bold text-primary">{formatPrice(r.remaining, currency, rates)}</div>
                <div className="text-[11px] text-muted-foreground">/ {formatPrice(r.total, currency, rates)}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
