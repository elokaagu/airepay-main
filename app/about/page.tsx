"use client";
import { Route as AboutRoute } from "@/routes/about";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={AboutRoute as any} pathname="/about" />; }
