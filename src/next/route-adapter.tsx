"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { RouteContextProvider } from "@/lib/router-shim";

type RouteLike = {
  options?: {
    component?: React.ComponentType<any>;
    notFoundComponent?: React.ComponentType<any>;
    loader?: (args: { params: Record<string, string> }) => unknown;
    validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
  };
};

function isNotFoundError(e: unknown): boolean {
  return e instanceof Error && (e as Error & { __notFound?: boolean }).__notFound === true;
}

function searchObject(searchParams: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of searchParams.entries()) obj[k] = v;
  return obj;
}

export function RoutePage({
  route,
  pathname,
  params = {},
}: {
  route: RouteLike;
  pathname: string;
  params?: Record<string, string>;
}) {
  const rawSearch = useMemo(() => {
    if (typeof window === "undefined") return {};
    return searchObject(new URLSearchParams(window.location.search));
  }, [pathname]);
  const validateSearch = route.options?.validateSearch;
  const search = validateSearch ? validateSearch(rawSearch) : rawSearch;

  const loader = route.options?.loader;
  let loaderData: unknown;
  if (loader) {
    try {
      loaderData = loader({ params });
    } catch (e) {
      if (isNotFoundError(e)) {
        const NotFound = route.options?.notFoundComponent;
        if (NotFound) {
          return (
            <RouteContextProvider value={{ pathname, params, search, loaderData: undefined }}>
              <NotFound />
            </RouteContextProvider>
          );
        }
      }
      throw e;
    }
  }
  const Component = route.options?.component;
  if (!Component) return null;

  return (
    <RouteContextProvider value={{ pathname, params, search, loaderData }}>
      <Component />
    </RouteContextProvider>
  );
}

export function RouteLayout({
  route,
  pathname,
  children,
}: {
  route: RouteLike;
  pathname: string;
  children: ReactNode;
}) {
  const rawSearch = useMemo(() => {
    if (typeof window === "undefined") return {};
    return searchObject(new URLSearchParams(window.location.search));
  }, [pathname]);
  const validateSearch = route.options?.validateSearch;
  const search = validateSearch ? validateSearch(rawSearch) : rawSearch;

  const LayoutComponent = route.options?.component;
  if (!LayoutComponent) return <>{children}</>;

  return (
    <RouteContextProvider value={{ pathname, params: {}, search, outlet: children }}>
      <LayoutComponent />
    </RouteContextProvider>
  );
}
