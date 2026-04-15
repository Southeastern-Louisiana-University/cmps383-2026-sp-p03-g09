import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, ThemePalette } from "@/app/theme-context";
import { globalBag, bagListeners, BagItem } from "./menu"; // adjust path if needed

export default function BagScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";
  const router = useRouter();

  const [bag, setBag] = useState<BagItem[]>([...globalBag]);
  const [submitting, setSubmitting] = useState(false);

  // stay in sync with menu additions
  useEffect(() => {
    const sync = () => setBag([...globalBag]);
    bagListeners.push(sync);
    return () => {
      const i = bagListeners.indexOf(sync);
      if (i !== -1) bagListeners.splice(i, 1);
    };
  }, []);

  const removeItem = (id: string) => {
    const i = globalBag.findIndex(item => item.id === id);
    if (i !== -1) globalBag.splice(i, 1);
    setBag([...globalBag]);
  };

  const updateQty = (id: string, delta: number) => {
    const item = globalBag.find(item => item.id === id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty < 1) {
      removeItem(id);
      return;
    }
    // recalculate total proportionally
    item.total = (item.total / item.qty) * newQty;
    item.qty = newQty;
    setBag([...globalBag]);
  };

  const subtotal = bag.reduce((s, item) => s + item.total, 0);
  const tax = subtotal * 0.0975; // Louisiana tax ~9.75%
  const grandTotal = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (bag.length === 0) {
      Alert.alert("your bag is empty", "add something delicious first ☕");
      return;
    }
    try {
      setSubmitting(true);
      // TODO: hook up your order submission here
      Alert.alert("thank you! ♡", "all that looks good! just a few more questions ☕");
      globalBag.splice(0, globalBag.length);
      setBag([]);
      router.replace("/pages/orderOptions");
    } catch (e: any) {
      Alert.alert("order failed", e?.message || "unable to place order. please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.backBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.headline}>
          {"your\n"}
          <Text style={{ color: palette.accent }}>bag. ✦</Text>
        </Text>

        {bag.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={36} color={palette.accent} style={{ opacity: 0.4, marginBottom: 12 }} />
            <Text style={styles.emptyText}>nothing here yet.</Text>
            <TouchableOpacity onPress={() => router.push("/menu")}>
              <Text style={styles.emptyLink}>browse the menu →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* bag items */}
            {bag.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.size && (
                      <Text style={styles.itemMeta}>{item.size}</Text>
                    )}
                    {item.toggles.length > 0 && (
                      <Text style={styles.itemMeta}>{item.toggles.join(", ")}</Text>
                    )}
                    {item.addOns.length > 0 && (
                      <Text style={styles.itemMeta}>
                        {item.addOns.map(a => a.label).join(", ")}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
                </View>

                <View style={styles.itemCardBottom}>
                  {/* qty controls */}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={13} color={palette.subtle} />
                    <Text style={styles.removeBtnText}>remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* order summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>tax (9.75%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>total</Text>
                <Text style={styles.summaryTotalValue}>${grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* place order */}
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={submitting}
              style={[styles.submitBtn, submitting && { opacity: 0.4 }]}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? "one moment... ☕" : "place order ♡"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footer}>new orleans · hammond · new york</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: "absolute",
      top: 0, left: 0, right: 0,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontWeight: "300", letterSpacing: 1 },
    topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: palette.subtle,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    backBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },

    headline: {
      color: palette.text,
      fontSize: 42,
      fontWeight: "300",
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 32,
    },

    emptyState: { alignItems: "center", paddingTop: 48 },
    emptyText: { color: palette.text, fontSize: 14, opacity: 0.4, letterSpacing: 0.5, marginBottom: 12 },
    emptyLink: { color: palette.accent, fontSize: 13, letterSpacing: 0.5 },

    itemCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    itemCardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    itemName: { color: palette.text, fontSize: 15, fontWeight: "300", letterSpacing: 0.3, marginBottom: 4 },
    itemMeta: { color: palette.accent, fontSize: 11, opacity: 0.65, letterSpacing: 0.3, marginTop: 2 },
    itemTotal: { color: palette.accent, fontSize: 14, fontWeight: "300", letterSpacing: 0.5 },

    itemCardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    qtyBtn: {
      width: 28, height: 28, borderRadius: 14,
      borderWidth: 1, borderColor: palette.accent,
      alignItems: "center", justifyContent: "center",
    },
    qtyBtnText: { color: palette.accent, fontSize: 16, lineHeight: 20 },
    qtyNum: { color: palette.text, fontSize: 15, fontWeight: "300", minWidth: 18, textAlign: "center" },

    removeBtn: { flexDirection: "row", alignItems: "center", gap: 5, opacity: 0.6 },
    removeBtnText: { color: palette.subtle, fontSize: 11, letterSpacing: 0.5 },

    summaryCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
      marginBottom: 20,
      gap: 10,
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between" },
    summaryLabel: { color: palette.text, fontSize: 13, opacity: 0.6, letterSpacing: 0.3 },
    summaryValue: { color: palette.text, fontSize: 13, opacity: 0.6, letterSpacing: 0.3 },
    summaryTotal: {
      borderTopWidth: 1,
      borderTopColor: palette.subtle + "40",
      paddingTop: 10,
      marginTop: 2,
    },
    summaryTotalLabel: { color: palette.text, fontSize: 15, fontWeight: "300", letterSpacing: 0.5 },
    summaryTotalValue: { color: palette.accent, fontSize: 15, fontWeight: "300", letterSpacing: 0.5 },

    submitBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: palette.accent + "18",
    },
    submitBtnText: {
      color: palette.accent,
      fontSize: 14,
      letterSpacing: 1.5,
      fontWeight: "400",
    },

    footer: {
      color: palette.accent,
      fontSize: 15,
      letterSpacing: 1.5,
      textAlign: "center",
      lineHeight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      opacity: 1,
    },
  });