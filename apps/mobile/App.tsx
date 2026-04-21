import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  acceptInviteByToken,
  createBondInvite,
  endBond,
  getActiveBond,
  listBondGoals,
  listInviteForBond,
  listSharedGoals,
  shareGoal,
  unshareGoal,
} from "./src/api/bond";
import { createGoal, listGoals, listRipples } from "./src/api/goals";
import { getProfileSettings, saveProfileSettings } from "./src/api/profile";
import {
  createWishlistItem,
  deleteWishlistItem,
  listWishlist,
  requestVerdict,
  updateWishlistItem,
} from "./src/api/wishlist";
import { hasSupabaseConfig, supabase } from "./src/supabase";
import type { Bond, BondInvite, Goal, Ripple, TrustMode, WishlistItem } from "./src/types";

type Tab = "home" | "goals" | "wishlist" | "bond" | "settings";

const tabs: { key: Tab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "goals", label: "Goals" },
  { key: "wishlist", label: "Wishlist" },
  { key: "bond", label: "Bond" },
  { key: "settings", label: "You" },
];

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("home");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailInput, setEmailInput] = useState("");
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [saturnCap, setSaturnCap] = useState("20");
  const [trustMode, setTrustMode] = useState<TrustMode>("pilot");
  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [newWishName, setNewWishName] = useState("");
  const [newWishPrice, setNewWishPrice] = useState("");
  const [bond, setBond] = useState<Bond | null>(null);
  const [bondInvite, setBondInvite] = useState<BondInvite | null>(null);
  const [sharedGoalIds, setSharedGoalIds] = useState<Set<string>>(new Set());
  const [bondGoals, setBondGoals] = useState<Goal[]>([]);
  const [bondPartnerEmail, setBondPartnerEmail] = useState("");
  const [bondPartnerLabel, setBondPartnerLabel] = useState("");
  const [bondToken, setBondToken] = useState("");
  const [openWish, setOpenWish] = useState<WishlistItem | null>(null);

  const northStar = useMemo(
    () => goals.find((g) => g.is_north_star) ?? goals.find((g) => g.priority === "P1") ?? goals[0],
    [goals],
  );

  async function refreshData(uid: string | null) {
    if (!uid) return;
    setLoading(true);
    try {
      const [g, r, w, p] = await Promise.all([
        listGoals(),
        listRipples(8),
        listWishlist(),
        getProfileSettings(uid),
      ]);
      setGoals(g);
      setRipples(r);
      setWishlist(w);
      setDisplayName(p.display_name);
      setSaturnCap(String(p.saturn_cap_pct));
      setTrustMode(p.trust_mode);
      const activeBond = await getActiveBond();
      setBond(activeBond);
      if (activeBond) {
        const [invite, shared, _bondGoals] = await Promise.all([
          listInviteForBond(activeBond.id),
          listSharedGoals(activeBond.id),
          listBondGoals(activeBond.id),
        ]);
        setBondInvite(invite);
        setSharedGoalIds(new Set(shared.map((s) => s.goal_id)));
        setBondGoals(_bondGoals);
      } else {
        setBondInvite(null);
        setSharedGoalIds(new Set());
        setBondGoals([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshSession() {
    if (!supabase) return;
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setAuthMsg(error.message);
      return;
    }
    const uid = data.user?.id ?? null;
    setUserId(uid);
    setUserEmail(data.user?.email ?? "");
    await refreshData(uid);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function sendMagicLink() {
    if (!supabase) return;
    const email = emailInput.trim();
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    setAuthMsg(error ? error.message : "Magic link sent. Open it and tap Refresh session.");
  }

  async function addGoal() {
    if (!userId || !newGoalLabel.trim()) return;
    await createGoal(userId, {
      label: newGoalLabel.trim(),
      priority: "P1",
      target: 10000,
      monthly: 500,
      current_amount: 0,
      position: goals.length,
    });
    setNewGoalLabel("");
    await refreshData(userId);
  }

  async function addWishlist() {
    if (!userId || !newWishName.trim() || Number(newWishPrice) <= 0) return;
    await createWishlistItem(userId, {
      name: newWishName.trim(),
      price: Number(newWishPrice),
    });
    setNewWishName("");
    setNewWishPrice("");
    await refreshData(userId);
  }

  async function runWishlistVerdict(itemId: string) {
    const verdict = await requestVerdict(itemId);
    await updateWishlistItem(itemId, verdict);
    if (userId) await refreshData(userId);
  }

  async function planWishlistItem(item: WishlistItem) {
    if (!userId) return;
    const monthly = Math.max(50, Math.ceil(Number(item.price) / 6));
    await createGoal(userId, {
      label: item.name,
      tagline: item.brand ?? null,
      priority: "P2",
      target: Number(item.price),
      current_amount: 0,
      monthly,
      is_north_star: false,
      position: goals.length,
    });
    await updateWishlistItem(item.id, { status: "planning" });
    await refreshData(userId);
  }

  async function deferWishlistItem(itemId: string) {
    await updateWishlistItem(itemId, { status: "deferred" });
    if (userId) await refreshData(userId);
  }

  async function removeWishlistItem(itemId: string) {
    await deleteWishlistItem(itemId);
    if (userId) await refreshData(userId);
  }

  async function createInvite() {
    if (!userId || !bondPartnerEmail.trim()) return;
    await createBondInvite(userId, bondPartnerEmail, bondPartnerLabel || undefined);
    setBondPartnerEmail("");
    setBondPartnerLabel("");
    await refreshData(userId);
  }

  async function acceptToken() {
    if (!bondToken.trim()) return;
    await acceptInviteByToken(bondToken.trim());
    setBondToken("");
    if (userId) await refreshData(userId);
  }

  async function toggleShare(goalId: string) {
    if (!bond || !userId) return;
    if (sharedGoalIds.has(goalId)) {
      await unshareGoal(bond.id, goalId);
    } else {
      await shareGoal(bond.id, goalId, userId);
    }
    await refreshData(userId);
  }

  async function stopBond() {
    if (!bond || !userId) return;
    await endBond(bond.id);
    await refreshData(userId);
  }

  async function shareInviteLink() {
    if (!bondInvite) return;
    const link = `https://airepay-main.vercel.app/m/bond?token=${bondInvite.token}`;
    await Share.share({ message: link, url: link });
  }

  function combinedDaysSaved(target: number, current: number, myMonthly: number, partnerMonthly: number) {
    const remaining = Math.max(0, target - current);
    const solo = myMonthly > 0 ? Math.round((remaining / myMonthly) * 30) : 0;
    const bonded = myMonthly + partnerMonthly > 0 ? Math.round((remaining / (myMonthly + partnerMonthly)) * 30) : solo;
    return { soloDays: solo, bondedDays: bonded, daysSaved: Math.max(0, solo - bonded) };
  }

  async function saveSettings() {
    if (!userId) return;
    await saveProfileSettings(userId, {
      display_name: displayName,
      saturn_cap_pct: Math.max(0, Math.min(40, Number(saturnCap) || 20)),
      trust_mode: trustMode,
    });
    setAuthMsg("Settings saved.");
  }

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const wishlistTotal = wishlist
    .filter((w) => w.status === "considering" || w.status === "planning")
    .reduce((sum, w) => sum + Number(w.price), 0);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.topTitle}>Aire Mobile</Text>
        <Text style={styles.topSub}>{tab.toUpperCase()}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!hasSupabaseConfig && (
          <Card>
            <Text style={styles.muted}>
              Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env`.
            </Text>
          </Card>
        )}
        {!userId && (
          <Card>
            <Text style={styles.title}>Sign in</Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@email.com"
              placeholderTextColor="#7d8699"
              style={styles.input}
            />
            <Row>
              <Button label="Send magic link" onPress={() => void sendMagicLink()} />
              <Button label="Refresh session" onPress={() => void refreshSession()} />
            </Row>
            {authMsg ? <Text style={styles.muted}>{authMsg}</Text> : null}
          </Card>
        )}
        {loading && <ActivityIndicator color="#60a5fa" />}
        {tab === "home" && (
          <>
            <Card>
              <Text style={styles.title}>{northStar?.label ?? "No goals yet"}</Text>
              <Text style={styles.big}>${Math.floor(Number(northStar?.current_amount ?? 0)).toLocaleString()}</Text>
              <Text style={styles.muted}>of ${Math.floor(Number(northStar?.target ?? 0)).toLocaleString()}</Text>
            </Card>
            <Card>
              <Text style={styles.title}>Recent activity</Text>
              {ripples.length === 0 ? (
                <Text style={styles.muted}>No activity yet.</Text>
              ) : (
                ripples.map((r) => (
                  <Row key={r.id}>
                    <Text style={styles.text}>{r.action}</Text>
                    <Text style={styles.text}>{r.days_delta}d</Text>
                  </Row>
                ))
              )}
            </Card>
          </>
        )}
        {tab === "goals" && (
          <>
            <Card>
              <Text style={styles.title}>Total saved</Text>
              <Text style={styles.big}>${Math.floor(totalSaved).toLocaleString()}</Text>
            </Card>
            <Card>
              <Text style={styles.title}>Create goal</Text>
              <TextInput
                value={newGoalLabel}
                onChangeText={setNewGoalLabel}
                placeholder="e.g. Down payment"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <Button label="Add goal" onPress={() => void addGoal()} />
            </Card>
            {goals.map((g) => (
              <Card key={g.id}>
                <Row>
                  <Text style={styles.text}>{g.label}</Text>
                  <Text style={styles.text}>${Number(g.current_amount).toLocaleString()}</Text>
                </Row>
                <Text style={styles.muted}>
                  {g.priority} · ${Number(g.monthly).toLocaleString()}/mo
                </Text>
              </Card>
            ))}
          </>
        )}
        {tab === "wishlist" && (
          <>
            <Card>
              <Text style={styles.title}>Wishlist total</Text>
              <Text style={styles.big}>${Math.floor(wishlistTotal).toLocaleString()}</Text>
            </Card>
            <Card>
              <Text style={styles.title}>Add item</Text>
              <TextInput
                value={newWishName}
                onChangeText={setNewWishName}
                placeholder="Item name"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <TextInput
                value={newWishPrice}
                onChangeText={setNewWishPrice}
                keyboardType="decimal-pad"
                placeholder="Price"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <Button label="Add item" onPress={() => void addWishlist()} />
            </Card>
            {wishlist.map((item) => (
              <Pressable key={item.id} onPress={() => setOpenWish(item)}>
                <Card>
                  <Row>
                    <Text style={styles.text}>{item.name}</Text>
                    <Text style={styles.text}>${Number(item.price).toLocaleString()}</Text>
                  </Row>
                  <Text style={styles.muted}>{item.verdict_text ?? item.verdict}</Text>
                </Card>
              </Pressable>
            ))}
          </>
        )}
        {tab === "bond" && (
          <>
            {!bond && (
              <Card>
                <Text style={styles.title}>Invite partner</Text>
                <TextInput
                  value={bondPartnerEmail}
                  onChangeText={setBondPartnerEmail}
                  placeholder="partner@example.com"
                  placeholderTextColor="#7d8699"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <TextInput
                  value={bondPartnerLabel}
                  onChangeText={setBondPartnerLabel}
                  placeholder="Nickname (optional)"
                  placeholderTextColor="#7d8699"
                  style={styles.input}
                />
                <Button label="Create invite" onPress={() => void createInvite()} />
              </Card>
            )}
            <Card>
              <Text style={styles.title}>Accept invite token</Text>
              <TextInput
                value={bondToken}
                onChangeText={setBondToken}
                placeholder="Paste token"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <Button label="Accept token" onPress={() => void acceptToken()} />
            </Card>
            {bond && (
              <Card>
                <Text style={styles.title}>Bond status: {bond.status}</Text>
                <Text style={styles.muted}>
                  Partner: {bond.partner_label || bond.partner_email}
                </Text>
                {bondInvite ? (
                  <>
                    <Text style={styles.muted}>Invite token: {bondInvite.token}</Text>
                    <Button label="Share invite link" onPress={() => void shareInviteLink()} />
                  </>
                ) : null}
                <Button label="End bond" onPress={() => void stopBond()} />
              </Card>
            )}
            {bond && bond.status === "active" ? (
              <Card>
                <Text style={styles.title}>Together progress</Text>
                {goals
                  .filter((g) => g.user_id === userId && sharedGoalIds.has(g.id))
                  .map((mine) => {
                    const partner = bondGoals.find(
                      (p) =>
                        p.user_id !== userId &&
                        p.label.trim().toLowerCase() === mine.label.trim().toLowerCase(),
                    );
                    const calc = combinedDaysSaved(
                      Number(mine.target),
                      Number(mine.current_amount) + Number(partner?.current_amount ?? 0),
                      Number(mine.monthly),
                      Number(partner?.monthly ?? 0),
                    );
                    return (
                      <View key={mine.id} style={styles.metricCard}>
                        <Text style={styles.text}>{mine.label}</Text>
                        <Text style={styles.muted}>
                          Solo {calc.soloDays}d to Together {calc.bondedDays}d
                        </Text>
                        <Text style={styles.metricGood}>Saved {calc.daysSaved}d together</Text>
                      </View>
                    );
                  })}
              </Card>
            ) : null}
            {bond && (
              <Card>
                <Text style={styles.title}>Share goals</Text>
                {goals.map((g) => (
                  <Row key={g.id}>
                    <Text style={styles.text}>{g.label}</Text>
                    <Button
                      label={sharedGoalIds.has(g.id) ? "Unshare" : "Share"}
                      onPress={() => void toggleShare(g.id)}
                    />
                  </Row>
                ))}
              </Card>
            )}
          </>
        )}
        {tab === "settings" && (
          <>
            <Card>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.muted}>{userEmail || "Not signed in"}</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <TextInput
                value={saturnCap}
                onChangeText={setSaturnCap}
                keyboardType="number-pad"
                placeholder="Safety cap %"
                placeholderTextColor="#7d8699"
                style={styles.input}
              />
              <Row>
                <Choice label="Ask first" active={trustMode === "pilot"} onPress={() => setTrustMode("pilot")} />
                <Choice label="Run rules" active={trustMode === "copilot"} onPress={() => setTrustMode("copilot")} />
                <Choice label="Auto" active={trustMode === "auto"} onPress={() => setTrustMode("auto")} />
              </Row>
              <Button label="Save settings" onPress={() => void saveSettings()} />
              <Button label="Refresh session" onPress={() => void refreshSession()} />
            </Card>
          </>
        )}
      </ScrollView>
      <Modal visible={Boolean(openWish)} transparent animationType="slide" onRequestClose={() => setOpenWish(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {openWish ? (
              <>
                <Text style={styles.title}>{openWish.name}</Text>
                <Text style={styles.muted}>${Number(openWish.price).toLocaleString()}</Text>
                <Text style={styles.text}>{openWish.verdict_text ?? "No verdict yet."}</Text>
                {openWish.alternatives?.length ? (
                  <View style={styles.metricCard}>
                    <Text style={styles.muted}>Alternatives</Text>
                    {openWish.alternatives.map((alt, idx) => (
                      <Text key={idx} style={styles.text}>
                        {alt.label}: {alt.days_delta > 0 ? "+" : ""}
                        {alt.days_delta}d
                      </Text>
                    ))}
                  </View>
                ) : null}
                <Row>
                  <Button label="Analyse" onPress={() => void runWishlistVerdict(openWish.id)} />
                  <Button label="Plan" onPress={() => void planWishlistItem(openWish)} />
                </Row>
                <Row>
                  <Button label="Defer" onPress={() => void deferWishlistItem(openWish.id)} />
                  <Button label="Remove" onPress={() => void removeWishlistItem(openWish.id)} />
                </Row>
                <Button label="Close" onPress={() => setOpenWish(null)} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
      <View style={[styles.bottom, { paddingBottom: Math.max(10, insets.bottom + 6) }]}>
        <View style={styles.tabBar}>
          {tabs.map((t) => (
            <Pressable key={t.key} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, active && styles.choiceActive]} onPress={onPress}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#08090b" },
  top: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#0c0f14" },
  topTitle: { color: "#f5f7fb", fontSize: 18, fontWeight: "700" },
  topSub: { color: "#9ba3b5", fontSize: 11, marginTop: 2 },
  content: { padding: 14, gap: 10, paddingBottom: 140 },
  card: { backgroundColor: "#1b1f2799", borderRadius: 14, borderWidth: 1, borderColor: "#ffffff1a", padding: 12, gap: 8 },
  title: { color: "#f5f7fb", fontSize: 16, fontWeight: "700" },
  text: { color: "#f5f7fb", fontSize: 13, flexShrink: 1 },
  muted: { color: "#9ba3b5", fontSize: 12 },
  big: { color: "#f5f7fb", fontSize: 32, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  input: { borderColor: "#ffffff1a", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, color: "#f5f7fb" },
  button: { backgroundColor: "#f8fafc", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
  buttonText: { color: "#0f172a", fontSize: 12, fontWeight: "700" },
  choice: { borderColor: "#ffffff1a", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  choiceActive: { backgroundColor: "#f8fafc" },
  choiceText: { color: "#f5f7fb", fontSize: 11, fontWeight: "600" },
  choiceTextActive: { color: "#0f172a" },
  metricCard: { borderWidth: 1, borderColor: "#ffffff1a", borderRadius: 12, padding: 10, gap: 3 },
  metricGood: { color: "#22c55e", fontSize: 12, fontWeight: "700" },
  modalBackdrop: { flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#111318",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffffff1a",
  },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 10, backgroundColor: "#0c0f14" },
  tabBar: { flexDirection: "row", gap: 6, backgroundColor: "#0e121ae6", borderRadius: 26, borderWidth: 1, borderColor: "#ffffff1a", padding: 6 },
  tabBtn: { flex: 1, borderRadius: 20, paddingVertical: 9, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#2a303dcc" },
  tabText: { color: "#7d8699", fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: "#f5f7fb" },
});
