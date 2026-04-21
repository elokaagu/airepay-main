export const theme = {
  canvas: "#08090b",
  surfaceGlass: "#1b1f2799",
  surfaceGlassStrong: "#2a303dcc",
  textPrimary: "#f5f7fb",
  textMuted: "#9ba3b5",
  textTab: "#7d8699",
  tabBarBackground: "#0e121ae6",
  tabBarBorder: "#ffffff1a",
  accent: "#60a5fa",
};

export type TabKey = "home" | "accounts" | "simulator" | "plans";

export const tabs = [
  { key: "home", label: "Home", path: "/m" },
  { key: "accounts", label: "Accounts", path: "/m/accounts" },
  { key: "simulator", label: "Simulate", path: "/m/simulator" },
  { key: "plans", label: "Plans", path: "/m/plans" },
] as const;
