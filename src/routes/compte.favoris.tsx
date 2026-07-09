import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/contexts/favorites-context";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export const Route = createFileRoute("/compte/favoris")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { ids } = useFavorites();
  const idArray = [...ids];

  const { data } = useQuery({
    queryKey: ["fav-products", idArray.sort().join(",")],
    enabled: idArray.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price_xof, compare_at_price_xof, origin_country, estimated_delivery_days_min, estimated_delivery_days_max, rating_avg, rating_count, image_url")
        .in("id", idArray);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Mes favoris</h1>
      <p className="text-muted-foreground mt-1">Vos coups de cœur, prêts à être précommandés.</p>

      {idArray.length === 0 || !data || data.length === 0 ? (
        <div className="mt-6 bg-card border border-border/60 rounded-3xl p-10 text-center">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
          <h2 className="font-display font-bold text-lg">Aucun favori</h2>
          <p className="text-muted-foreground mt-1">Ajoutez des produits à vos favoris pour les retrouver ici.</p>
          <Link to="/catalogue" className="inline-block mt-4 text-primary font-medium hover:underline">Explorer le catalogue →</Link>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
