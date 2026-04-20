"use client";

import { Route as RouteDef } from "@/routes/blog.$slug";
import { RoutePage } from "@/next/route-adapter";

export function BlogSlugRouteClient({ slug }: { slug: string }) {
  return (
    <RoutePage route={RouteDef as any} pathname={`/blog/${slug}`} params={{ slug }} />
  );
}
