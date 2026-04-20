"use client";

import NextLink from "next/link";
import { usePathname, useRouter as useNextRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ComponentType, type ReactNode } from "react";

type AnyRecord = Record<string, unknown>;
type RouteOptions = {
  component?: ComponentType<any>;
  loader?: (args: any) => unknown;
  head?: (args?: any) => unknown;
  validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
  notFoundComponent?: ComponentType<any>;
  errorComponent?: ComponentType<any>;
  [key: string]: unknown;
};

type RouteContextValue = {
  pathname: string;
  params: Record<string, string>;
  search: AnyRecord;
  loaderData?: unknown;
  outlet?: ReactNode;
};

const RouteContext = createContext<RouteContextValue>({
  pathname: "/",
  params: {},
  search: {},
});

export function RouteContextProvider({
  value,
  children,
}: {
  value: RouteContextValue;
  children: ReactNode;
}) {
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

type NavigateArgs = {
  to: string;
  params?: Record<string, string>;
  search?: AnyRecord;
  replace?: boolean;
};

function withParams(path: string, params?: Record<string, string>) {
  if (!params) return path;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`$${key}`, encodeURIComponent(value)),
    path,
  );
}

function withSearch(path: string, search?: AnyRecord) {
  if (!search) return path;
  const entries = Object.entries(search).filter(([, value]) => value != null && value !== "");
  if (entries.length === 0) return path;
  const q = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${path}?${q.toString()}`;
}

export function createFileRoute(path: string) {
  return (options: RouteOptions) => ({
    path,
    options,
    useParams: () => useContext(RouteContext).params,
    useSearch: () => useContext(RouteContext).search as any,
    useLoaderData: () => useContext(RouteContext).loaderData as any,
  });
}

export function createRootRoute(options: AnyRecord) {
  return {
    path: "__root__",
    options,
  };
}

export function Outlet() {
  return useContext(RouteContext).outlet ?? null;
}

export function HeadContent() {
  return null;
}

export function Scripts() {
  return null;
}

export function notFound() {
  const err = new Error("Not found");
  (err as Error & { __notFound?: boolean }).__notFound = true;
  return err;
}

export function redirect() {
  return null;
}

export function useNavigate() {
  const router = useNextRouter();
  return ({ to, params, search, replace }: NavigateArgs) => {
    const href = withSearch(withParams(to, params), search);
    if (replace) router.replace(href);
    else router.push(href);
  };
}

export function useSearch<T = AnyRecord>(_args?: { from?: string }) {
  return useContext(RouteContext).search as T;
}

export function useRouter() {
  const router = useNextRouter();
  return {
    invalidate: () => router.refresh(),
  };
}

export function useRouterState<T>({
  select,
}: {
  select: (state: { location: { pathname: string } }) => T;
}) {
  const pathname = usePathname() ?? "/";
  return useMemo(() => select({ location: { pathname } }), [pathname, select]);
}

export function createRouter(_args?: unknown) {
  return {};
}

type LinkProps = {
  to: string;
  params?: Record<string, string>;
  search?: AnyRecord;
  activeProps?: AnyRecord;
  inactiveProps?: AnyRecord;
  activeOptions?: AnyRecord;
  preload?: unknown;
  preloadDelay?: unknown;
  resetScroll?: boolean;
  hashScrollIntoView?: boolean;
  viewTransition?: boolean;
  replace?: boolean;
  state?: unknown;
  mask?: unknown;
  from?: string;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
};

export function Link({
  to,
  params,
  search,
  children,
  activeProps: _activeProps,
  inactiveProps: _inactiveProps,
  activeOptions: _activeOptions,
  preload: _preload,
  preloadDelay: _preloadDelay,
  resetScroll: _resetScroll,
  hashScrollIntoView: _hashScrollIntoView,
  viewTransition: _viewTransition,
  replace: _replace,
  state: _state,
  mask: _mask,
  from: _from,
  ...props
}: LinkProps) {
  const href = withSearch(withParams(to, params), search);
  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
}
