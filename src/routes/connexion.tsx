import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Phone, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/connexion")({
  component: LoginPage,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Connexion — Kiosk" },
      { name: "description", content: "Connectez-vous à votre compte Kiosk pour suivre vos précommandes et gérer vos favoris." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/connexion" });
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect || "/compte", replace: true });
    }
  }, [user, loading, redirect, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleGoogle() {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/connexion`,
      });
      if (res.error) toast.error("Connexion Google impossible", { description: res.error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/compte`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("Compte créé", { description: "Vérifiez votre email pour confirmer." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
      }
    } catch (err) {
      const e = err as Error;
      toast.error(mode === "signup" ? "Inscription impossible" : "Connexion impossible", { description: e.message });
    } finally {
      setBusy(false);
    }
  }

  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: otpPhone });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code envoyé", { description: `SMS envoyé au ${otpPhone}` });
    } catch (err) {
      toast.error("Envoi impossible", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: otpPhone, token: otpCode, type: "sms" });
      if (error) throw error;
      toast.success("Bienvenue !");
    } catch (err) {
      toast.error("Code invalide", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-kiosk py-12 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Bienvenue chez Kiosk</h1>
          <p className="mt-3 text-muted-foreground">
            Connectez-vous pour précommander depuis la Chine et Dubaï.
          </p>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-30px_oklch(0.15_0.05_265/0.2)]">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full gap-2"
            onClick={handleGoogle}
            disabled={busy}
          >
            <GoogleIcon /> Continuer avec Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
          </div>

          <Tabs defaultValue="email">
            <TabsList className="grid grid-cols-2 w-full rounded-full">
              <TabsTrigger value="email" className="rounded-full">Email</TabsTrigger>
              <TabsTrigger value="phone" className="rounded-full">Téléphone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-6">
              <div className="flex gap-2 mb-5 p-1 bg-surface rounded-full">
                <button
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  Inscription
                </button>
              </div>

              <form onSubmit={handleEmail} className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div>
                      <Label htmlFor="fullName">Nom complet</Label>
                      <div className="relative mt-1.5">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="Aïcha Diop" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="+221 77 000 00 00" />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="vous@email.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full h-12 rounded-full">
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "signup" ? "Créer mon compte" : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-6">
              {!otpSent ? (
                <form onSubmit={sendOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="otpPhone">Numéro de téléphone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="otpPhone" required value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="+221 77 000 00 00" />
                    </div>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full h-12 rounded-full">
                    {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Recevoir un code SMS
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="otpCode">Code reçu par SMS</Label>
                    <Input id="otpCode" required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="h-11 rounded-xl text-center tracking-[0.4em] font-mono text-lg" placeholder="000000" maxLength={6} />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full h-12 rounded-full">
                    {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Vérifier
                  </Button>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                    Modifier le numéro
                  </button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          En continuant, vous acceptez nos <Link to="/comment-ca-marche" className="underline">conditions</Link>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41.4 34.7 44 29.7 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
