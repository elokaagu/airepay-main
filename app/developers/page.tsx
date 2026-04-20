"use client";
import { Route as RouteDef } from "@/routes/developers";
import { RoutePage } from "@/next/route-adapter";
export default function Page() { return <RoutePage route={RouteDef as any} pathname="/developers" />; }
