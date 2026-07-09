import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/compte/profil")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
      setLoading(false);
    });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
      if (error) throw error;
      toast.success("Profil mis à jour");
    } catch (err) {
      toast.error("Erreur", { description: (err as Error).message });
    } finally { setSaving(false); }
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Mon profil</h1>
      <p className="text-muted-foreground mt-1">Vos informations personnelles.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <form onSubmit={save} className="mt-6 bg-card border border-border/60 rounded-3xl p-6 max-w-xl">
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="mt-1.5 h-11 rounded-xl bg-surface" />
            </div>
            <div>
              <Label>Nom complet</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder="+221 77 000 00 00" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving} className="rounded-full h-11 px-7">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enregistrer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
