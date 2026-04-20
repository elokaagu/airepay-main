"use client";
import { Route as RouteDef } from "@/routes/blog.index";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={RouteDef as any} pathname="/blog" />; }
