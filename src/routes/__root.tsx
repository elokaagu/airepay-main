import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/plomo/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { PageTransition } from "@/components/plomo/PageTransition";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline script: apply theme class before first paint to avoid flash.
const themeBootstrap = `
(function(){try{var t=localStorage.getItem('aire-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aire — Goal-Native Financial Engine" },
      { name: "description", content: "The first goal-native financial agent — orchestrating your house, your family and your yield as a single optimization." },
      { name: "author", content: "Aire" },
      { property: "og:title", content: "Aire — Goal-Native Financial Engine" },
      { property: "og:description", content: "The first goal-native financial agent — orchestrating your house, your family and your yield as a single optimization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Aire — Goal-Native Financial Engine" },
      { name: "twitter:description", content: "The first goal-native financial agent — orchestrating your house, your family and your yield as a single optimization." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48cf8743-7a9a-43c9-9e8f-f09c85b2cb29/id-preview-557e0277--d11b7008-def1-4d2e-b338-a13c68202554.lovable.app-1776464180508.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48cf8743-7a9a-43c9-9e8f-f09c85b2cb29/id-preview-557e0277--d11b7008-def1-4d2e-b338-a13c68202554.lovable.app-1776464180508.png" },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
    scripts: [{ children: themeBootstrap }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </AuthProvider>
    </ThemeProvider>
  );
}
