"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Route as RouteDef } from "@/routes/app";
import { RouteLayout } from "@/next/route-adapter";
export default function Layout({ children }: { children: ReactNode }) { const pathname = usePathname() || "/app"; return <RouteLayout route={RouteDef as any} pathname={pathname}>{children}</RouteLayout>; }
