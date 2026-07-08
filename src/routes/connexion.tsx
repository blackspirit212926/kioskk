import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/connexion")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Connexion — Kiosk" },
      { name: "description", content: "Connectez-vous à votre compte Kiosk pour suivre vos commandes et gérer vos favoris." },
    ],
  }),
});

function LoginPage() {
  return (
    <div className="container-kiosk py-16 md:py-28">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 text-primary flex items-center justify-center mx-auto">
          <LogIn className="w-7 h-7" />
        </div>
        <h1 className="mt-6 text-3xl md:text-4xl font-display font-bold">Connexion & inscription</h1>
        <p className="mt-4 text-muted-foreground">
          L'authentification (email, téléphone et Google) sera activée dans la prochaine étape. En attendant, vous pouvez explorer le catalogue et remplir votre panier — vos favoris et articles sont sauvegardés localement.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg" className="rounded-full h-12">
            <Link to="/catalogue">Explorer le catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12">
            <Link to="/demander-un-produit"><Sparkles className="w-4 h-4 mr-1.5" /> Demander un produit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
