"use client";
import { Route as RouteDef } from "@/routes/resources";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={RouteDef as any} pathname="/resources" />; }
