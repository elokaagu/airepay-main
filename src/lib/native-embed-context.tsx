"use client";

import { createContext, useContext, type ReactNode } from "react";

const NativeEmbedShellContext = createContext(false);

export function NativeEmbedShellProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return <NativeEmbedShellContext.Provider value={value}>{children}</NativeEmbedShellContext.Provider>;
}

export function useNativeEmbedShell(): boolean {
  return useContext(NativeEmbedShellContext);
}
