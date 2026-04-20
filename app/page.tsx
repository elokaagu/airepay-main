"use client";

import { Route as IndexRoute } from "@/routes/index";
import { RoutePage } from "@/next/route-adapter";

export default function Page() {
  return <RoutePage route={IndexRoute as any} pathname="/" />;
}
