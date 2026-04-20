"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Route as RouteDef } from "@/routes/m";
import { RouteLayout } from "@/next/route-adapter";

export function MobileLayoutRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/m";
  return (
    <RouteLayout route={RouteDef as any} pathname={pathname}>
      {children}
    </RouteLayout>
  );
}
