import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Upload, ShieldCheck, Wallet, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Finaliser la commande — Kiosk" }, { name: "robots", content: "noindex" }] }),
});

type PaymentMethod = "wave" | "orange_money" | "free_money";
type PaymentType = "full" | "split_50_50";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; color: string; number: string }[] = [
  { id: "wave", label: "Wave", color: "bg-[#1DC8F1] text-white", number: "+221 77 000 00 01" },
  { id: "orange_money", label: "Orange Money", color: "bg-[#FF7900] text-white", number: "+221 77 000 00 02" },
  { id: "free_money", label: "Free Money", color: "bg-[#DA291C] text-white", number: "+221 77 000 00 03" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { items, subtotalXof, clear } = useCart();
  const { currency, rates } = useCurrency();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/connexion", search: { redirect: "/checkout" }, replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (items.length === 0 && step !== 3) navigate({ to: "/catalogue", replace: true });
  }, [items.length, step, navigate]);

  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Dakar");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [details, setDetails] = useState("");
  const [note, setNote] = useState("");

  const [method, setMethod] = useState<PaymentMethod>("wave");
  const [paymentType, setPaymentType] = useState<PaymentType>("full");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const selected = useMemo(() => PAYMENT_OPTIONS.find((p) => p.id === method)!, [method]);
  const discount = promo?.discount ?? 0;
  const totalAfterDiscount = Math.max(0, subtotalXof - discount);
  const amountDueNow = paymentType === "split_50_50" ? Math.ceil(totalAfterDiscount / 2) : totalAfterDiscount;
  const amountLater = totalAfterDiscount - amountDueNow;

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    try {
      const { data, error } = await supabase.rpc("apply_promo_code", {
        _code: promoInput.trim().toUpperCase(),
        _subtotal_xof: subtotalXof,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row || !row.valid) {
        toast.error(row?.reason ?? "Code invalide");
        return;
      }
      setPromo({ code: promoInput.trim().toUpperCase(), discount: Number(row.discount_xof) });
      toast.success(`Code appliqué : −${formatPrice(Number(row.discount_xof), currency, rates)}`);
    } catch (err) {
      toast.error("Impossible de valider ce code", { description: (err as Error).message });
    } finally {
      setApplyingPromo(false);
    }
  }

  async function submitOrder() {
    if (!user) return;
    if (!proofFile) { toast.error("Ajoutez la preuve de paiement"); return; }
    setSubmitting(true);
    try {
      const path = `${user.id}/${Date.now()}-${proofFile.name}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, proofFile);
      if (up.error) throw up.error;

      const addrSnap = { recipient, phone, city, neighborhood, street, details };
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: "",
          subtotal_xof: subtotalXof,
          total_paid_xof: amountDueNow,
          payment_method: method,
          payment_type: paymentType,
          payment_proof_url: up.data.path,
          promo_code: promo?.code ?? null,
          discount_xof: discount,
          status: "pending_payment",
          customer_note: note || null,
          address_snapshot: addrSnap,
        })
        .select("id, order_number")
        .single();
      if (oErr) throw oErr;

      const rows = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: i.name,
        quantity: i.quantity,
        unit_price_xof: i.unitPriceXof,
        variant_id: i.variantId ?? null,
        variant_label: i.variantLabel ?? null,
        image_url: i.imageUrl || null,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(rows);
      if (iErr) throw iErr;

      // Record this payment as a versement
      await supabase.from("order_payments").insert({
        order_id: order.id,
        kind: paymentType === "split_50_50" ? "deposit" : "full",
        amount_xof: amountDueNow,
        method,
        proof_url: up.data.path,
        status: "pending",
      });

      // Record promo redemption
      if (promo) {
        const { data: pc } = await supabase
          .from("promo_codes")
          .select("id")
          .eq("code", promo.code)
          .maybeSingle();
        if (pc) {
          await supabase.from("promo_redemptions").insert({
            order_id: order.id,
            promo_code_id: pc.id,
            code: promo.code,
            amount_saved_xof: discount,
          });
        }
      }

      setOrderNumber(order.order_number);
      setStep(3);
      clear();
      toast.success("Commande créée", { description: order.order_number });
    } catch (err) {
      toast.error("Échec de la commande", { description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="container-kiosk py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container-kiosk py-8 md:py-14">
      <Link to="/panier" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au panier
      </Link>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div>
          <Stepper current={step} />

          {step === 1 && (
            <section className="bg-card border border-border/60 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/15 text-primary flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                <h2 className="font-display text-xl md:text-2xl font-bold">Adresse de livraison</h2>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="grid md:grid-cols-2 gap-4">
                <Field label="Nom du destinataire" required value={recipient} onChange={setRecipient} placeholder="Aïcha Diop" />
                <Field label="Téléphone" required value={phone} onChange={setPhone} placeholder="+221 77 000 00 00" />
                <Field label="Ville" required value={city} onChange={setCity} />
                <Field label="Quartier" value={neighborhood} onChange={setNeighborhood} placeholder="Point E, Mermoz…" />
                <div className="md:col-span-2">
                  <Field label="Rue / repère" required value={street} onChange={setStreet} placeholder="Rue 12, en face de la pharmacie…" />
                </div>
                <div className="md:col-span-2">
                  <Label>Précisions (optionnel)</Label>
                  <Textarea value={details} onChange={(e) => setDetails(e.target.value)} className="mt-1.5 rounded-2xl min-h-20" placeholder="Étage, code d'entrée, heure de livraison…" />
                </div>
                <div className="md:col-span-2">
                  <Label>Note pour Kiosk (optionnel)</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5 rounded-2xl min-h-20" placeholder="Une préférence particulière ?" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" size="lg" className="rounded-full h-12 px-7">
                    Continuer vers le paiement <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </form>
            </section>
          )}

          {step === 2 && (
            <section className="bg-card border border-border/60 rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/15 text-primary flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
                <h2 className="font-display text-xl md:text-2xl font-bold">Paiement</h2>
              </div>

              {/* Payment type selector */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${paymentType === "full" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                >
                  <div className="font-semibold">Paiement en une fois</div>
                  <div className="text-xs text-muted-foreground mt-1">Vous réglez le prix produit maintenant. Frais de transit et livraison à l'arrivée.</div>
                </button>
                <button
                  onClick={() => setPaymentType("split_50_50")}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${paymentType === "split_50_50" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                >
                  <div className="font-semibold">Paiement en deux fois <span className="text-accent">50 / 50</span></div>
                  <div className="text-xs text-muted-foreground mt-1">50 % à la commande, 50 % à l'arrivée du colis à Dakar.</div>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMethod(opt.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${method === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center font-bold text-xs mb-3`}>{opt.label.split(" ").map((w) => w[0]).join("")}</div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">Mobile money</div>
                  </button>
                ))}
              </div>

              {/* Promo code */}
              <div className="mb-6">
                <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Code promo</Label>
                {promo ? (
                  <div className="mt-2 flex items-center justify-between rounded-2xl bg-success/10 border border-success/30 p-3">
                    <div>
                      <div className="font-semibold text-success">{promo.code}</div>
                      <div className="text-xs text-muted-foreground">−{formatPrice(promo.discount, currency, rates)}</div>
                    </div>
                    <button onClick={() => { setPromo(null); setPromoInput(""); }} className="p-1 hover:bg-background rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="EX: BIENVENUE" className="h-11 rounded-xl uppercase" />
                    <Button type="button" variant="outline" onClick={applyPromo} disabled={applyingPromo || !promoInput.trim()} className="rounded-xl h-11">
                      {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Appliquer"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-surface p-5 mb-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Envoyez le paiement à</div>
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-display text-2xl font-bold">{selected.number}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">Kiosk SARL — {selected.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{paymentType === "split_50_50" ? "Acompte à envoyer" : "Montant à envoyer"}</div>
                    <div className="font-display text-2xl font-bold text-primary">{formatPrice(amountDueNow, currency, rates)}</div>
                  </div>
                </div>
                {paymentType === "split_50_50" && (
                  <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    Solde de <strong className="text-foreground">{formatPrice(amountLater, currency, rates)}</strong> à régler à l'arrivée du colis à Dakar.
                  </div>
                )}
              </div>

              <div>
                <Label>Preuve de paiement (capture d'écran)</Label>
                <label className="mt-2 block cursor-pointer">
                  <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                  <div className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${proofFile ? "border-success bg-success/5" : "border-border hover:border-primary/50"}`}>
                    {proofFile ? (
                      <div className="flex items-center justify-center gap-2 text-success font-medium">
                        <Check className="w-5 h-5" /> {proofFile.name}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-6 h-6" />
                        <div className="font-medium text-foreground">Téléverser la capture</div>
                        <div className="text-xs">PNG, JPG ou PDF — max 10 Mo</div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" className="rounded-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
                <Button size="lg" className="rounded-full h-12 px-7 btn-glow" disabled={submitting || !proofFile} onClick={submitOrder}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirmer ma commande
                </Button>
              </div>
            </section>
          )}

          {step === 3 && orderNumber && (
            <section className="bg-card border border-border/60 rounded-3xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="mt-6 font-display text-2xl md:text-3xl font-bold">Merci pour votre commande !</h2>
              <p className="mt-3 text-muted-foreground">Nous avons bien reçu votre paiement. Notre équipe vérifie sous 24 h.</p>
              <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-surface">
                <span className="text-sm text-muted-foreground">Numéro :</span>
                <span className="font-display font-bold text-lg">{orderNumber}</span>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="rounded-full h-12 px-7"><Link to="/compte">Voir mes commandes</Link></Button>
                <Button asChild variant="outline" size="lg" className="rounded-full h-12"><Link to="/catalogue">Continuer mes achats</Link></Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-card border border-border/60 rounded-3xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">Votre commande</h3>
            <ul className="space-y-3 mb-5">
              {items.map((i) => (
                <li key={i.productId + (i.variantId ?? "")} className="flex gap-3">
                  <img src={resolveImage(i.imageUrl)} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{i.name}</div>
                    <div className="text-xs text-muted-foreground">× {i.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatPrice(i.unitPriceXof * i.quantity, currency, rates)}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <Row label="Sous-total" value={formatPrice(subtotalXof, currency, rates)} />
              {promo && <Row label={`Remise (${promo.code})`} value={`−${formatPrice(discount, currency, rates)}`} accent />}
              <Row label="Total" value={formatPrice(totalAfterDiscount, currency, rates)} bold />
              {paymentType === "split_50_50" && (
                <>
                  <Row label="À payer maintenant" value={formatPrice(amountDueNow, currency, rates)} bold />
                  <Row label="Solde à l'arrivée" value={formatPrice(amountLater, currency, rates)} muted />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-success" /> Paiement sécurisé
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted, accent }: { label: string; value: string; bold?: boolean; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`${bold ? "font-display text-lg font-bold" : ""} ${accent ? "text-success font-semibold" : ""} ${muted ? "text-muted-foreground" : ""}`}>{value}</span>
    </div>
  );
}

function Field({ label, required, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={placeholder} />
    </div>
  );
}

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Livraison" },
    { n: 2, label: "Paiement" },
    { n: 3, label: "Confirmation" },
  ] as const;
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 flex-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${current >= s.n ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}>
            {current > s.n ? <Check className="w-4 h-4" /> : s.n}
          </div>
          <div className={`text-sm font-medium hidden sm:block ${current >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${current > s.n ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}
