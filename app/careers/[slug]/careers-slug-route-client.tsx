"use client";

import { Route as RouteDef } from "@/routes/careers.$slug";
import { RoutePage } from "@/next/route-adapter";

export function CareersSlugRouteClient({ slug }: { slug: string }) {
  return (
    <RoutePage route={RouteDef as any} pathname={`/careers/${slug}`} params={{ slug }} />
  );
}
