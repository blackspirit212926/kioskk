import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Sparkles, Upload, ArrowRight, LinkIcon, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const searchSchema = z.object({ produit: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/demander-un-produit")({
  validateSearch: searchSchema,
  component: SourcingPage,
  head: () => ({
    meta: [
      { title: "Sourcing sur mesure — Kiosk" },
      { name: "description", content: "Décrivez le produit que vous cherchez. Nous le sourçons à Guangzhou ou Dubaï et vous proposons un devis sous 24h." },
      { property: "og:title", content: "Sourcing sur mesure — Kiosk" },
    ],
  }),
});

const MAX_DESC = 500;

function SourcingPage() {
  const search = Route.useSearch();
  const [description, setDescription] = useState(search.produit ? `Je cherche : ${search.produit}` : "");
  const [refUrl, setRefUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRefine = () => {
    if (!description.trim()) {
      toast.error("Veuillez d'abord décrire votre besoin");
      return;
    }
    setIsRefining(true);
    // Placeholder AI refinement — real Lovable AI call comes in iteration 4
    setTimeout(() => {
      const refined = `Je recherche : ${description.trim()}. Idéalement de bonne qualité, avec un rapport qualité-prix compétitif. Merci de me proposer les meilleures options disponibles chez vos fournisseurs à Guangzhou ou Dubaï, en précisant le délai estimé et les modes de transport possibles.`;
      setDescription(refined.slice(0, MAX_DESC));
      setIsRefining(false);
      toast.success("Description améliorée avec l'IA");
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Description obligatoire");
      return;
    }
    setIsSubmitting(true);
    // Real submission wired in iteration 4 when auth exists
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Demande envoyée !", {
        description: "Nous vous répondrons avec un devis sous 24h.",
      });
      setDescription("");
      setRefUrl("");
      setBudget("");
      setPhotoPreview(null);
    }, 700);
  };

  return (
    <div className="container-kiosk py-12 md:py-20">
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
        <div className="md:sticky md:top-24">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Sourcing à la demande
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
            Vous décrivez.<br />
            <span className="text-primary">Nous trouvons.</span>
          </h1>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Un produit spécifique, une variante introuvable, un besoin unique ? Décrivez-le nous. Notre équipe le source directement auprès de nos partenaires vérifiés et vous propose un devis sous 24 heures.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Devis personnalisé sous 24h",
              "Fournisseurs vérifiés à Guangzhou et Dubaï",
              "Aucun engagement avant validation du devis",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/15 text-success flex-shrink-0 flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-card border border-border p-6 md:p-9 shadow-soft space-y-6">
          <div>
            <label className="flex items-center justify-between text-sm font-semibold mb-2">
              <span>Décrivez le produit *</span>
              <span className={`text-xs ${description.length > MAX_DESC * 0.9 ? "text-destructive" : "text-muted-foreground"}`}>
                {description.length}/{MAX_DESC}
              </span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
              placeholder="Ex : je cherche une machine expresso automatique avec broyeur intégré, budget autour de 250 000 FCFA…"
              rows={5}
              className="resize-none rounded-2xl bg-background"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-full"
              onClick={handleRefine}
              disabled={isRefining || !description.trim()}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isRefining ? "Amélioration…" : "Améliorer avec l'IA"}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Lien de référence <span className="text-muted-foreground font-normal">(facultatif)</span>
            </label>
            <Input
              type="url"
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder="https://…"
              className="h-12 rounded-2xl bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Budget estimé (FCFA) <span className="text-muted-foreground font-normal">(facultatif)</span>
            </label>
            <Input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="100 000"
              className="h-12 rounded-2xl bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Photo de référence <span className="text-muted-foreground font-normal">(facultatif)</span>
            </label>
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img src={photoPreview} alt="Aperçu" className="w-full max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/95 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 cursor-pointer hover:bg-surface transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Glissez une image ici ou cliquez pour parcourir</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!description.trim() || isSubmitting}
            className="w-full rounded-full h-13 text-base btn-glow"
          >
            {isSubmitting ? "Envoi…" : (<>Envoyer la demande <ArrowRight className="w-4 h-4 ml-1" /></>)}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            En envoyant, vous recevrez un devis par email. Aucun paiement n'est requis à ce stade.
          </p>
        </form>
      </div>

      <div className="mt-16 rounded-3xl bg-surface/60 border border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">Vous préférez parcourir notre sélection ?</p>
        <Link to="/catalogue" className="mt-2 inline-flex items-center gap-1 font-semibold hover:text-primary">
          Voir le catalogue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
