import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Filter, SlidersHorizontal, X, PackageX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  categorie: z.string().optional().catch(undefined),
  origine: z.enum(["CN", "AE"]).optional().catch(undefined),
  tri: z.enum(["nouveaute", "prix_asc", "prix_desc"]).optional().catch(undefined),
});

export const Route = createFileRoute("/catalogue")({
  validateSearch: searchSchema,
  component: CataloguePage,
  head: () => ({
    meta: [
      { title: "Catalogue Kiosk — Produits importés de Chine et Dubaï" },
      { name: "description", content: "Découvrez notre sélection de produits à précommander depuis la Chine et Dubaï. Filtrez par origine, catégorie et prix." },
    ],
  }),
});

function CataloguePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [localQ, setLocalQ] = useState(search.q ?? "");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, slug, name").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["catalog", search],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select(
          "id, slug, name, short_description, price_xof, compare_at_price_xof, origin_country, estimated_delivery_days_min, estimated_delivery_days_max, rating_avg, rating_count, category_id, categories(slug), product_images(url, sort_order)"
        )
        .eq("status", "published");

      if (search.origine) q = q.eq("origin_country", search.origine);
      if (search.q) q = q.ilike("name", `%${search.q}%`);
      if (search.tri === "prix_asc") q = q.order("price_xof", { ascending: true });
      else if (search.tri === "prix_desc") q = q.order("price_xof", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      const { data } = await q;
      let items = (data ?? []).map((p: unknown) => {
        const row = p as { categories: { slug: string } | null; product_images: { url: string; sort_order: number }[] };
        return { ...(p as object), image_url: row.product_images?.[0]?.url ?? null, category_slug: row.categories?.slug ?? null };
      }) as unknown as (ProductCardData & { category_slug: string | null })[];

      if (search.categorie) items = items.filter((i) => i.category_slug === search.categorie);
      return items;
    },
  });

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];
    if (search.origine) {
      list.push({
        key: "origine",
        label: search.origine === "CN" ? "🇨🇳 Chine" : "🇦🇪 Dubaï",
        onRemove: () => navigate({ search: (s: any) => ({ ...s, origine: undefined }) }),
      });
    }
    if (search.categorie) {
      const cat = categories?.find((c) => c.slug === search.categorie);
      list.push({
        key: "categorie",
        label: cat?.name ?? search.categorie,
        onRemove: () => navigate({ search: (s: any) => ({ ...s, categorie: undefined }) }),
      });
    }
    if (search.q) {
      list.push({ key: "q", label: `« ${search.q} »`, onRemove: () => { setLocalQ(""); navigate({ search: (s: any) => ({ ...s, q: undefined }) }); } });
    }
    return list;
  }, [search, categories, navigate]);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (s: any) => ({ ...s, q: localQ.trim() || undefined }) });
  };

  const resetAll = () => {
    setLocalQ("");
    navigate({ search: {} });
  };

  return (
    <div className="container-kiosk py-8 md:py-12">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Catalogue</span>
        <h1 className="mt-2 text-3xl md:text-5xl font-display font-bold">Précommandez ce que vous voulez</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Tous les produits ci-dessous peuvent être importés à votre demande depuis la Chine ou Dubaï. Les frais de transit et livraison seront communiqués à l'arrivée.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <form onSubmit={handleSubmitSearch} className="flex-1 relative">
          <Input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Rechercher un produit…"
            className="h-12 rounded-full pl-5 pr-24 bg-card border-border"
          />
          <Button type="submit" size="sm" className="absolute right-1.5 top-1.5 h-9 rounded-full px-4">
            Chercher
          </Button>
        </form>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden h-12 rounded-full">
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filtres
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[380px] bg-background">
            <FiltersPanel search={search} navigate={navigate} categories={categories ?? []} />
          </SheetContent>
        </Sheet>

        <select
          value={search.tri ?? "nouveaute"}
          onChange={(e) => navigate({ search: (s: any) => ({ ...s, tri: e.target.value === "nouveaute" ? undefined : (e.target.value as "prix_asc" | "prix_desc") }) })}
          className="h-12 px-5 rounded-full border border-border bg-card text-sm font-medium cursor-pointer hover:bg-surface"
        >
          <option value="nouveaute">Nouveautés</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-6">
            <FiltersPanel search={search} navigate={navigate} categories={categories ?? []} />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Chargement…" : `${products?.length ?? 0} résultat${(products?.length ?? 0) > 1 ? "s" : ""}`}
            </span>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.onRemove}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-light transition-colors"
              >
                {f.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button onClick={resetAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                Tout effacer
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl kiosk-skeleton" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-card border border-border p-10 md:p-16 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-surface flex items-center justify-center">
                <PackageX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-xl font-display font-semibold">Aucun produit ne correspond à votre recherche</h3>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                Essayez d'ajuster vos filtres, ou faites une demande de sourcing sur mesure.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={resetAll} variant="outline" className="rounded-full">
                  Réinitialiser les filtres
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/demander-un-produit">Demander un produit</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating sourcing CTA */}
      <Link
        to="/demander-un-produit"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-accent text-accent-foreground font-medium shadow-elevated hover:bg-accent-hover hover:scale-105 transition-all btn-glow"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Demander un produit</span>
        <span className="sm:hidden">Sourcing</span>
      </Link>
    </div>
  );
}

function FiltersPanel({
  search,
  navigate,
  categories,
}: {
  search: z.infer<typeof searchSchema>;
  navigate: (o: { search: (s: z.infer<typeof searchSchema>) => z.infer<typeof searchSchema> }) => void;
  categories: { id: string; slug: string; name: string }[];
}) {
  return (
    <div className="space-y-6 pt-4 md:pt-0">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Origine</h3>
        <div className="space-y-2">
          {[
            { code: "CN", label: "Chine", flag: "🇨🇳" },
            { code: "AE", label: "Dubaï", flag: "🇦🇪" },
          ].map((o) => {
            const active = search.origine === o.code;
            return (
              <button
                key={o.code}
                onClick={() => navigate({ search: (s: any) => ({ ...s, origine: active ? undefined : (o.code as "CN" | "AE") }) })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-surface"
                }`}
              >
                <span className="text-base">{o.flag}</span>
                <span className="flex-1 text-left">{o.label}</span>
                {active && <X className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Catégorie</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = search.categorie === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => navigate({ search: (s: any) => ({ ...s, categorie: active ? undefined : c.slug }) })}
                className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-surface"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
