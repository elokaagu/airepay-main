import type { ReactNode } from "react";
import { headers } from "next/headers";
import { NativeEmbedShellProvider } from "@/lib/native-embed-context";
import { MobileLayoutRoute } from "./mobile-layout-route";

export default async function MLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const nativeEmbedShell = h.get("x-aire-native-embed") === "1";

  return (
    <NativeEmbedShellProvider value={nativeEmbedShell}>
      <MobileLayoutRoute>{children}</MobileLayoutRoute>
    </NativeEmbedShellProvider>
  );
}
