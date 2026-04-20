"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/plomo/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { PageTransition } from "@/components/plomo/PageTransition";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageTransition>{children}</PageTransition>
      </AuthProvider>
    </ThemeProvider>
  );
}
