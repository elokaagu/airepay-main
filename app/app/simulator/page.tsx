"use client";
import { Route as RouteDef } from "@/routes/app.simulator";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={RouteDef as any} pathname="/app/simulator" />; }
