"use client";
import { Route as RouteDef } from "@/routes/blog.$slug";
import { RoutePage } from "@/next/route-adapter";
export default function Page({ params }: { params: { slug: string } }) { return <RoutePage route={RouteDef as any} pathname={`/blog/${params.slug}`} params={{ slug: params.slug }} />; }
