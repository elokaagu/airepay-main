import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { listGoals, logRipple } from "./src/goals-api";
import { rippleDays, seedGoals, type Goal } from "./src/simulator";
import { hasSupabaseConfig, supabase } from "./src/supabase";
import { tabs, theme, type TabKey } from "./src/theme";

const BASE_URL = process.env.EXPO_PUBLIC_AIREPAY_WEB_URL ?? "http://localhost:3000";

function resolveUrl(path: string) {
  return new URL(path, BASE_URL).toString();
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [screen, setScreen] = useState<"main" | "settings" | "webEngine">("main");
  const [webReady, setWebReady] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [amountInput, setAmountInput] = useState("200");
  const [targetId, setTargetId] = useState<string | null>(() => {
    const northStar = seedGoals.find((g) => g.isNorthStar) ?? seedGoals.find((g) => g.priority === "P1");
    return northStar?.id ?? null;
  });
  const [sourceId, setSourceId] = useState<string | null>(() => {
    const northStar = seedGoals.find((g) => g.isNorthStar) ?? seedGoals.find((g) => g.priority === "P1");
    const src = seedGoals.find((g) => g.priority === "P2") ?? seedGoals.find((g) => g.id !== northStar?.id);
    return src?.id ?? null;
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const selectedTab = useMemo(() => tabs.find((tab) => tab.key === activeTab) ?? tabs[0], [activeTab]);
  const webPath = selectedTab.path;
  const isSecondaryScreen = screen !== "main";
  const amount = useMemo(() => {
    const n = Number(amountInput);
    if (!Number.isFinite(n)) return 0;
    return Math.max(20, Math.min(2000, Math.round(n / 20) * 20));
  }, [amountInput]);
  const target = goals.find((g) => g.id === targetId) ?? null;
  const source = goals.find((g) => g.id === sourceId) ?? null;
  const targetDays = rippleDays(amount, Number(target?.monthly ?? 0));
  const sourceDays = rippleDays(amount, Number(source?.monthly ?? 0));

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      if (!supabase || !hasSupabaseConfig) return;
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
    }
    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadLiveGoals() {
      if (!userId) return;
      setGoalsLoading(true);
      setGoalsError(null);
      try {
        const fetched = await listGoals();
        if (!mounted) return;
        if (fetched.length > 0) {
          setGoals(fetched);
          const ns = fetched.find((x) => x.isNorthStar) ?? fetched.find((x) => x.priority === "P1");
          setTargetId((curr) => curr ?? ns?.id ?? fetched[0]?.id ?? null);
          setSourceId((curr) => {
            if (curr) return curr;
            const src = fetched.find((x) => x.priority === "P2") ?? fetched.find((x) => x.id !== ns?.id);
            return src?.id ?? null;
          });
        }
      } catch (error) {
        if (!mounted) return;
        setGoalsError(error instanceof Error ? error.message : "Failed to load goals");
      } finally {
        if (mounted) setGoalsLoading(false);
      }
    }
    void loadLiveGoals();
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function sendMagicLink() {
    if (!supabase) return;
    setAuthMsg(null);
    const email = authEmail.trim();
    if (!email) {
      setAuthMsg("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setAuthMsg(error.message);
      return;
    }
    setAuthMsg("Magic link sent. Open it on this device, then tap Refresh session.");
  }

  async function refreshSession() {
    if (!supabase) return;
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setAuthMsg(error.message);
      return;
    }
    setUserId(data.user?.id ?? null);
    setAuthMsg(data.user ? "Signed in." : "No active session found yet.");
  }

  async function applySwap() {
    if (!target) return;
    if (!userId) {
      setSavedMsg("Sign in from Settings to save this swap.");
      return;
    }
    setBusy(true);
    try {
      await logRipple(userId, {
        goalId: target.id,
        action: source ? `Moved $${amount} from ${source.label} into ${target.label}` : `Added $${amount} to ${target.label}`,
        amount,
        daysDelta: -targetDays,
        tag: "SWAP",
      });
      setSavedMsg(
        `Saved - ${target.label} is ${targetDays}d closer${source ? ` and ${source.label} moves ${sourceDays}d back` : ""}.`,
      );
    } catch (error) {
      setSavedMsg(error instanceof Error ? error.message : "Could not save swap.");
    } finally {
      setBusy(false);
    }
  }

  function ScreenCard(props: { title: string; subtitle: string; amount: string }) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{props.title}</Text>
        <Text style={styles.cardSubtitle}>{props.subtitle}</Text>
        <Text style={styles.cardAmount}>{props.amount}</Text>
      </View>
    );
  }

  function MainContent() {
    if (activeTab === "home") {
      return (
        <ScrollView contentContainerStyle={styles.contentWrap}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <ScreenCard title="Total balance" subtitle="All wallets + accounts" amount="$12,842.10" />
          <ScreenCard title="Spending this month" subtitle="Compared to last month" amount="$1,904.72" />
          <ScreenCard title="Scheduled payouts" subtitle="Due in next 7 days" amount="$620.00" />
        </ScrollView>
      );
    }
    if (activeTab === "accounts") {
      return (
        <ScrollView contentContainerStyle={styles.contentWrap}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <ScreenCard title="Primary wallet" subtitle="USD" amount="$8,320.55" />
          <ScreenCard title="Savings vault" subtitle="Auto-save enabled" amount="$3,902.40" />
          <ScreenCard title="Virtual card balance" subtitle="Spending card" amount="$619.15" />
        </ScrollView>
      );
    }
    if (activeTab === "simulator") {
      const sourceChoices = goals.filter((g) => g.id !== targetId);
      return (
        <ScrollView contentContainerStyle={styles.contentWrap}>
          <Text style={styles.sectionTitle}>Simulator</Text>
          {!hasSupabaseConfig ? (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>
                Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env`.
              </Text>
            </View>
          ) : null}
          {goalsError ? (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>{goalsError}</Text>
            </View>
          ) : null}
          {goalsLoading ? (
            <View style={styles.card}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : null}
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Compare amount</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="number-pad"
              style={styles.amountInput}
              placeholder="200"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={styles.cardSubtitle}>Rounded to nearest $20 between $20 and $2,000.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Add to</Text>
            <View style={styles.optionRow}>
              {goals.map((g) => (
                <Pressable
                  key={g.id}
                  style={[styles.optionPill, targetId === g.id && styles.optionPillActive]}
                  onPress={() => {
                    setTargetId(g.id);
                    if (sourceId === g.id) {
                      setSourceId(null);
                    }
                  }}
                >
                  <Text style={[styles.optionText, targetId === g.id && styles.optionTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Take from (optional)</Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.optionPill, sourceId === null && styles.optionPillActive]}
                onPress={() => setSourceId(null)}
              >
                <Text style={[styles.optionText, sourceId === null && styles.optionTextActive]}>None</Text>
              </Pressable>
              {sourceChoices.map((g) => (
                <Pressable
                  key={g.id}
                  style={[styles.optionPill, sourceId === g.id && styles.optionPillActive]}
                  onPress={() => setSourceId(g.id)}
                >
                  <Text style={[styles.optionText, sourceId === g.id && styles.optionTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.card, styles.tradeCard]}>
            <Text style={styles.tradeTitle}>The trade-off</Text>
            <Text style={styles.tradeMetric}>
              {target?.label ?? "Target"}: -{targetDays}d closer
            </Text>
            {source ? <Text style={styles.tradeMetric}>{source.label}: +{sourceDays}d further</Text> : null}
            <Text style={styles.tradeBody}>
              {target
                ? `Adding $${amount} to ${target.label} brings it ${targetDays}d closer${
                    source ? `. It pushes ${source.label} back ${sourceDays}d.` : "."
                  }`
                : "Pick a goal to see the trade-off."}
            </Text>
          </View>

          <Pressable
            style={[styles.primaryBtn, (!target || busy) && styles.primaryBtnDisabled]}
            disabled={!target || busy}
            onPress={() => void applySwap()}
          >
            <Text style={styles.primaryBtnText}>{busy ? "Saving..." : "Make the swap"}</Text>
          </Pressable>
          {savedMsg ? (
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>{savedMsg}</Text>
            </View>
          ) : null}
        </ScrollView>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.contentWrap}>
        <Text style={styles.sectionTitle}>Plans</Text>
        <ScreenCard title="Growth plan" subtitle="Active" amount="Renews May 12" />
        <ScreenCard title="Team seats" subtitle="4 of 10 used" amount="$39/month" />
        <ScreenCard title="Next billing" subtitle="Auto debit" amount="$59.00" />
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.topChrome, { paddingTop: insets.top + 10 }]}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => setScreen((current) => (current === "main" ? "settings" : "main"))}
        >
          <Text style={styles.userInitial}>{isSecondaryScreen ? "Back" : "A"}</Text>
        </Pressable>
        <Pressable style={styles.searchBtn} onPress={() => setActiveTab("simulator")}>
          <Text style={styles.searchText}>{isSecondaryScreen ? "Return to app" : "Search"}</Text>
        </Pressable>
        <Pressable
          style={styles.circleBtn}
          onPress={() => {
            setWebReady(false);
            setScreen("webEngine");
          }}
        >
          <Text style={styles.iconText}>Web</Text>
        </Pressable>
      </View>

      <View style={styles.webWrap}>
        {screen === "settings" ? (
          <ScrollView contentContainerStyle={styles.contentWrap}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Auth</Text>
              <Text style={styles.cardSubtitle}>
                {userId ? `Signed in user: ${userId.slice(0, 8)}...` : "No active session"}
              </Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@email.com"
                placeholderTextColor={theme.textMuted}
                style={styles.authInput}
              />
              <View style={styles.authRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => void sendMagicLink()}>
                  <Text style={styles.secondaryBtnText}>Send magic link</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={() => void refreshSession()}>
                  <Text style={styles.secondaryBtnText}>Refresh session</Text>
                </Pressable>
              </View>
              {authMsg ? <Text style={styles.cardSubtitle}>{authMsg}</Text> : null}
            </View>
            <ScreenCard title="Profile" subtitle="AirePay user" amount="Edit" />
            <ScreenCard title="Notifications" subtitle="Push + email" amount="Customize" />
          </ScrollView>
        ) : screen === "webEngine" ? (
          <View style={styles.webWrap}>
            {!webReady && (
              <View style={styles.loader}>
                <ActivityIndicator color={theme.accent} />
              </View>
            )}
            <WebView
              source={{ uri: resolveUrl(webPath) }}
              style={styles.webView}
              onLoadEnd={() => setWebReady(true)}
              setSupportMultipleWindows={false}
              javaScriptEnabled
              originWhitelist={["*"]}
            />
          </View>
        ) : (
          <MainContent />
        )}
      </View>

      <View style={[styles.bottomWrap, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = selectedTab.key === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => {
                  setScreen("main");
                  setActiveTab(tab.key);
                }}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  topChrome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#0c0f14",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surfaceGlassStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: {
    color: theme.textPrimary,
    fontWeight: "700",
    fontSize: 11,
  },
  iconText: {
    color: theme.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  searchBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceGlass,
  },
  searchText: {
    color: theme.textMuted,
    fontWeight: "500",
  },
  webWrap: {
    flex: 1,
    position: "relative",
  },
  contentWrap: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  card: {
    backgroundColor: theme.surfaceGlass,
    borderColor: theme.tabBarBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: theme.textMuted,
    fontSize: 13,
  },
  cardAmount: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  amountInput: {
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
    color: theme.textPrimary,
    fontSize: 30,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
  },
  optionPillActive: {
    backgroundColor: theme.surfaceGlassStrong,
  },
  optionText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  optionTextActive: {
    color: theme.textPrimary,
  },
  tradeCard: {
    backgroundColor: "#f4f7ff",
  },
  tradeTitle: {
    color: "#1a2233",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  tradeMetric: {
    marginTop: 4,
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  tradeBody: {
    marginTop: 8,
    color: "#334155",
    fontSize: 13,
    lineHeight: 19,
  },
  primaryBtn: {
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  authInput: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
    color: theme.textPrimary,
  },
  authRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: theme.surfaceGlassStrong,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: theme.textPrimary,
    fontWeight: "600",
    fontSize: 12,
  },
  webView: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    backgroundColor: theme.canvas,
  },
  bottomWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "#0c0f14",
  },
  tabBar: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.tabBarBorder,
    backgroundColor: theme.tabBarBackground,
    padding: 6,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: theme.surfaceGlassStrong,
  },
  tabLabel: {
    color: theme.textTab,
    fontSize: 12,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: theme.textPrimary,
  },
});
