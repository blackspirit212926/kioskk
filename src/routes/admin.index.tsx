import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, ArrowUpDown, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/currency-context";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Tableau de bord</h1>
      <p className="text-muted-foreground mt-1">Espace administration Kiosk.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <AdminCard to="/admin/soldes" title="Soldes clients" desc="Suivre les montants restants dus par commande en cours." icon={Wallet} />
      </div>
    </div>
  );
}

function AdminCard({ to, title, desc, icon: Icon }: { to: "/admin/soldes"; title: string; desc: string; icon: typeof Wallet }) {
  return (
    <Link to={to} className="group bg-card border border-border/60 rounded-3xl p-5 hover:border-primary/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent/15 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div className="font-display font-bold mt-3">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}

export { AdminHome };
