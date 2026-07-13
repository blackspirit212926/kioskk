import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, ArrowUpDown, Wallet, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/soldes")({
  component: AdminSoldesPage,
});

const OPEN_STATUSES = ["pending_payment", "payment_confirmed", "sourcing", "purchased", "in_transit", "arrived", "out_for_delivery"] as const;

function AdminSoldesPage() {
  const { currency, rates } = useCurrency();
  const [q, setQ] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-balances"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, order_number, user_id, status, subtotal_xof, discount_xof, created_at, order_payments(amount_xof, status)")
        .in("status", OPEN_STATUSES);
      if (error) throw error;

      const userIds = Array.from(new Set((orders ?? []).map((o) => o.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const byUser = new Map<string, {
        userId: string;
        fullName: string;
        phone: string | null;
        orders: number;
        paid: number;
        due: number;
        lastActivity: string;
      }>();

      for (const o of orders ?? []) {
        const total = Number(o.subtotal_xof) - Number(o.discount_xof ?? 0);
        const confirmed = (o.order_payments ?? []).filter((p: { status: string }) => p.status === "confirmed").reduce((s: number, p: { amount_xof: number }) => s + Number(p.amount_xof), 0);
        const pending = (o.order_payments ?? []).filter((p: { status: string }) => p.status === "pending").reduce((s: number, p: { amount_xof: number }) => s + Number(p.amount_xof), 0);
        const remaining = Math.max(0, total - confirmed - pending);
        const prof = profileMap.get(o.user_id);
        const key = o.user_id;
        const existing = byUser.get(key);
        if (existing) {
          existing.orders += 1;
          existing.paid += confirmed;
          existing.due += remaining;
          if (o.created_at > existing.lastActivity) existing.lastActivity = o.created_at;
        } else {
          byUser.set(key, {
            userId: o.user_id,
            fullName: prof?.full_name ?? "Client sans nom",
            phone: prof?.phone ?? null,
            orders: 1,
            paid: confirmed,
            due: remaining,
            lastActivity: o.created_at,
          });
        }
      }
      return Array.from(byUser.values());
    },
  });

  const rows = useMemo(() => {
    const filtered = (data ?? []).filter(
      (r) => !q || r.fullName.toLowerCase().includes(q.toLowerCase()) || (r.phone ?? "").includes(q),
    );
    return filtered.sort((a, b) => (sortDesc ? b.due - a.due : a.due - b.due));
  }, [data, q, sortDesc]);

  const totalDue = rows.reduce((s, r) => s + r.due, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Soldes clients</h1>
          <p className="text-muted-foreground mt-1">Suivi des montants restants dus, toutes commandes en cours confondues.</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total dû (tous clients)</div>
          <div className="font-display text-xl font-bold text-primary">{formatPrice(totalDue, currency, rates)}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un client…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-11 rounded-xl" />
        </div>
        <button
          onClick={() => setSortDesc((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 h-11 text-sm hover:bg-surface"
        >
          <ArrowUpDown className="w-4 h-4" /> Reste dû {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      <div className="mt-4 bg-card border border-border/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-3" />
            <div className="font-semibold">Aucun solde en attente</div>
            <div className="text-sm text-muted-foreground mt-1">Tous les clients sont à jour.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium">Contact</th>
                  <th className="text-right px-5 py-3 font-medium">Commandes</th>
                  <th className="text-right px-5 py-3 font-medium">Payé</th>
                  <th className="text-right px-5 py-3 font-medium">Reste dû</th>
                  <th className="text-left px-5 py-3 font-medium">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.userId} className="hover:bg-surface/40 transition-colors">
                    <td className="px-5 py-3 font-medium">{r.fullName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-right">{r.orders}</td>
                    <td className="px-5 py-3 text-right">{formatPrice(r.paid, currency, rates)}</td>
                    <td className="px-5 py-3 text-right font-display font-bold text-primary">{formatPrice(r.due, currency, rates)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(r.lastActivity).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
