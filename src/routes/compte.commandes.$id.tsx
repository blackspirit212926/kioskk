import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Clock, Loader2, MapPin, Package, Upload, Wallet, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import {
  STATUS_LABELS,
  STATUS_TIMELINE,
  PAYMENT_KIND_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-status";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/compte/commandes/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { currency, rates } = useCurrency();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [orderRes, historyRes, paymentsRes] = await Promise.all([
        supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
        supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true }),
        supabase.from("order_payments").select("*").eq("order_id", id).order("created_at", { ascending: true }),
      ]);
      if (orderRes.error) throw orderRes.error;
      return { order: orderRes.data, history: historyRes.data ?? [], payments: paymentsRes.data ?? [] };
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!data?.order) return <div className="bg-card border border-border/60 rounded-3xl p-10 text-center">Commande introuvable.</div>;

  const order = data.order;
  const history = data.history;
  const payments = data.payments;
  const currentIndex = STATUS_TIMELINE.indexOf(order.status as typeof STATUS_TIMELINE[number]);
  const cancelled = order.status === "cancelled" || order.status === "refunded";
  const addr = (order.address_snapshot ?? {}) as Record<string, string>;

  const confirmedPaid = payments
    .filter((p) => p.status === "confirmed")
    .reduce((s, p) => s + Number(p.amount_xof), 0);
  const pendingPaid = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + Number(p.amount_xof), 0);
  const totalDue = Number(order.subtotal_xof) - Number(order.discount_xof ?? 0);
  const remaining = Math.max(0, totalDue - confirmedPaid - pendingPaid);

  const hasBalancePending = payments.some((p) => p.kind === "balance");
  const balanceUploadAvailable =
    order.payment_type === "split_50_50" &&
    !hasBalancePending &&
    ["arrived", "out_for_delivery"].includes(order.status);

  return (
    <div>
      <Link to="/compte/commandes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Toutes mes commandes
      </Link>

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground text-sm mt-1">Créée le {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${cancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {!cancelled && (
        <div className="mt-6 bg-card border border-border/60 rounded-3xl p-6">
          <h2 className="font-display font-bold mb-5">Suivi</h2>
          <ol className="relative">
            {STATUS_TIMELINE.map((s, i) => {
              const done = i <= currentIndex;
              const current = i === currentIndex;
              const historyEntry = history.find((h) => h.status === s);
              return (
                <li key={s} className="flex gap-4 pb-6 last:pb-0 relative">
                  {i < STATUS_TIMELINE.length - 1 && (
                    <span className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${done ? "bg-primary" : "bg-border"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"} ${current ? "ring-4 ring-primary/20" : ""}`}>
                    {done ? <Check className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className="pt-1 flex-1">
                    <div className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{STATUS_LABELS[s]}</div>
                    {historyEntry && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(historyEntry.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {historyEntry.note && <span className="ml-1 italic">— {historyEntry.note}</span>}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Payments card */}
      <div className="mt-6 bg-card border border-border/60 rounded-3xl p-6">
        <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Wallet className="w-4 h-4" /> Versements</h2>

        {order.payment_type === "split_50_50" && (
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            <MiniStat label="Total commande" value={formatPrice(totalDue, currency, rates)} />
            <MiniStat label="Payé" value={formatPrice(confirmedPaid, currency, rates)} tone="success" />
            <MiniStat label="Reste dû" value={formatPrice(remaining, currency, rates)} tone={remaining > 0 ? "warn" : "muted"} />
          </div>
        )}

        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface/60">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === "confirmed" ? "bg-success/15 text-success" : p.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent-foreground"}`}>
                {p.status === "confirmed" ? <Check className="w-4 h-4" /> : p.status === "rejected" ? <X className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {PAYMENT_KIND_LABELS[p.kind]} · {formatPrice(Number(p.amount_xof), currency, rates)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.method ? PAYMENT_METHOD_LABELS[p.method] : "—"} · {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === "confirmed" ? "bg-success/15 text-success" : p.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-surface"}`}>
                {PAYMENT_STATUS_LABELS[p.status]}
              </span>
            </li>
          ))}
        </ul>

        {balanceUploadAvailable && user && (
          <BalanceUploader
            orderId={order.id}
            userId={user.id}
            amount={remaining}
            defaultMethod={order.payment_method ?? "wave"}
            onDone={() => qc.invalidateQueries({ queryKey: ["order", id] })}
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border/60 rounded-3xl p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Articles</h2>
          <ul className="space-y-4">
            {order.order_items?.map((it) => (
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
          <div className="border-t border-border mt-5 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatPrice(Number(order.subtotal_xof), currency, rates)}</span></div>
            {Number(order.discount_xof) > 0 && (
              <div className="flex justify-between text-success">
                <span>Remise {order.promo_code && `(${order.promo_code})`}</span>
                <span>−{formatPrice(Number(order.discount_xof), currency, rates)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total commande</span>
              <span className="font-display text-xl font-bold">{formatPrice(totalDue, currency, rates)}</span>
            </div>
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
          {order.customer_note && (
            <div className="mt-4 rounded-2xl bg-surface p-3 text-sm">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Votre note</div>
              {order.customer_note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warn" | "muted" }) {
  const cls = tone === "success" ? "text-success" : tone === "warn" ? "text-accent-foreground" : tone === "muted" ? "text-muted-foreground" : "";
  return (
    <div className="rounded-2xl bg-surface/60 p-3">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display font-bold text-lg mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}

function BalanceUploader({ orderId, userId, amount, defaultMethod, onDone }: { orderId: string; userId: string; amount: number; defaultMethod: string; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState(defaultMethod);
  const [busy, setBusy] = useState(false);
  const { currency, rates } = useCurrency();

  async function submit() {
    if (!file) return;
    setBusy(true);
    try {
      const path = `${userId}/${Date.now()}-balance-${file.name}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file);
      if (up.error) throw up.error;
      const { error } = await supabase.from("order_payments").insert({
        order_id: orderId,
        kind: "balance",
        amount_xof: amount,
        method: method as "wave" | "orange_money" | "free_money" | "cash_on_delivery",
        proof_url: up.data.path,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Preuve du solde envoyée", { description: "Notre équipe vérifie sous 24 h." });
      setFile(null);
      onDone();
    } catch (err) {
      toast.error("Envoi impossible", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border-2 border-dashed border-primary/30 p-4">
      <div className="font-semibold text-sm">Solde à régler : {formatPrice(amount, currency, rates)}</div>
      <p className="text-xs text-muted-foreground mt-1">Envoyez le solde puis téléversez la preuve de paiement ici.</p>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        {(["wave", "orange_money", "free_money"] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`p-2 rounded-xl border text-xs font-medium transition-all ${method === m ? "border-primary bg-primary/5" : "border-border"}`}>
            {PAYMENT_METHOD_LABELS[m]}
          </button>
        ))}
      </div>
      <label className="mt-3 block cursor-pointer">
        <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className={`rounded-xl border-2 border-dashed p-4 text-center text-sm ${file ? "border-success bg-success/5 text-success" : "border-border text-muted-foreground hover:border-primary/50"}`}>
          {file ? <><Check className="w-4 h-4 inline mr-1" /> {file.name}</> : <><Upload className="w-4 h-4 inline mr-1" /> Téléverser la preuve</>}
        </div>
      </label>
      <Button className="mt-3 w-full rounded-full" disabled={!file || busy} onClick={submit}>
        {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Envoyer la preuve du solde
      </Button>
      <Label className="sr-only">Méthode</Label>
    </div>
  );
}
