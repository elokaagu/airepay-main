"use client";
import { Route as RouteDef } from "@/routes/m.goals";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={RouteDef as any} pathname="/m/goals" />; }
