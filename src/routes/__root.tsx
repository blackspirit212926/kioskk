import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/plus-jakarta-sans";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CurrencyProvider } from "@/contexts/currency-context";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AuthProvider } from "@/hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl md:text-8xl font-display font-bold text-primary">404</div>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-light"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Cette page n'a pas pu être chargée</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur s'est produite. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kiosk — Importé pour vous. Livré chez vous." },
      {
        name: "description",
        content:
          "Kiosk vous permet de précommander depuis le Sénégal des produits importés directement de Chine et de Dubaï. Sourcing, transport et livraison, tout inclus.",
      },
      { name: "author", content: "Kiosk" },
      { property: "og:title", content: "Kiosk — Importé pour vous. Livré chez vous." },
      {
        property: "og:description",
        content: "Kiosk vous permet de précommander depuis le Sénégal des produits importés directement de Chine et de Dubaï. Sourcing, transport et livraison, tout inclus.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_SN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Kiosk — Importé pour vous. Livré chez vous." },
      { name: "twitter:description", content: "Kiosk vous permet de précommander depuis le Sénégal des produits importés directement de Chine et de Dubaï. Sourcing, transport et livraison, tout inclus." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/115e324e-13f9-400e-871f-e7d28e932662/id-preview-77979226--6bc34103-b3c2-4400-9b4c-a9c09e8af8f7.lovable.app-1783555676390.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/115e324e-13f9-400e-871f-e7d28e932662/id-preview-77979226--6bc34103-b3c2-4400-9b4c-a9c09e8af8f7.lovable.app-1783555676390.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <FavoritesProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1">
                  <Outlet />
                </main>
                <Footer />
                <CartDrawer />
              </div>
              <Toaster position="bottom-right" richColors closeButton />
            </CartProvider>
          </FavoritesProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
