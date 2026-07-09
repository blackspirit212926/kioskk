import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/compte/adresses")({
  component: AddressesPage,
});

function AddressesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    label: "Domicile", recipient_name: "", phone: "", city: "Dakar", neighborhood: "", street: "", details: "",
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
      if (error) throw error;
      toast.success("Adresse ajoutée");
      setShowForm(false);
      setForm({ label: "Domicile", recipient_name: "", phone: "", city: "Dakar", neighborhood: "", street: "", details: "" });
      qc.invalidateQueries({ queryKey: ["addresses"] });
    } catch (err) {
      toast.error("Erreur", { description: (err as Error).message });
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) { toast.error("Erreur", { description: error.message }); return; }
    toast.success("Adresse supprimée");
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Mes adresses</h1>
          <p className="text-muted-foreground mt-1">Enregistrez vos points de livraison pour aller plus vite.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="rounded-full h-11"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="mt-6 bg-card border border-border/60 rounded-3xl p-6 grid md:grid-cols-2 gap-4">
          <F label="Libellé" v={form.label} on={(v) => setForm({ ...form, label: v })} />
          <F label="Destinataire" required v={form.recipient_name} on={(v) => setForm({ ...form, recipient_name: v })} />
          <F label="Téléphone" required v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
          <F label="Ville" required v={form.city} on={(v) => setForm({ ...form, city: v })} />
          <F label="Quartier" v={form.neighborhood} on={(v) => setForm({ ...form, neighborhood: v })} />
          <F label="Rue" required v={form.street} on={(v) => setForm({ ...form, street: v })} />
          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enregistrer
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {!isLoading && (!data || data.length === 0) && !showForm && (
          <div className="bg-card border border-border/60 rounded-3xl p-10 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
            <div className="text-muted-foreground">Aucune adresse enregistrée.</div>
          </div>
        )}
        {data?.map((a) => (
          <div key={a.id} className="bg-card border border-border/60 rounded-3xl p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{a.label} · {a.recipient_name}</div>
              <div className="text-sm text-muted-foreground">{a.phone}</div>
              <div className="text-sm mt-1">{a.street}{a.neighborhood ? `, ${a.neighborhood}` : ""}, {a.city}</div>
            </div>
            <button onClick={() => remove(a.id)} className="w-9 h-9 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center" aria-label="Supprimer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function F({ label, required, v, on }: { label: string; required?: boolean; v: string; on: (v: string) => void }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input required={required} value={v} onChange={(e) => on(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
    </div>
  );
}
