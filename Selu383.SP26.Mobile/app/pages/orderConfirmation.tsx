import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, ThemePalette } from "@/app/theme-context";
import { OrderDto } from "../context/api";
import QRCode from 'react-native-qrcode-svg';
import { globalLastOrder, setGlobalDriveThruCode } from './orderOptions';

//  drive-thru code 

function useDriveThruCode(isDriveThru: boolean): string {
  return useMemo(() => {
    if (!isDriveThru) {
      setGlobalDriveThruCode(null);
      return '';
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGlobalDriveThruCode(code);
    return code;
  }, [isDriveThru]);
}

//  parse order type string

function parseOrderType(raw: string): { label: string; table: string | null } {
  if (raw.startsWith("dine_in:")) {
    return { label: "dine in", table: raw.replace("dine_in:", "").trim() };
  }
  const map: Record<string, string> = {
    dine_in:    "dine in",
    carry_out:  "carry out",
    drive_thru: "drive thru",
  };
  return { label: map[raw] ?? raw, table: null };
}

//  format ISO pickup time

function formatPickupTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m === 0 ? "00" : String(m).padStart(2, "0");
    return `${h12}:${mm} ${ampm}`;
  } catch {
    return iso;
  }
}

//  animated checkmark

function AnimatedCheck({ palette }: { palette: ThemePalette }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity, alignItems: "center", marginBottom: 28 }}>
      <View style={{
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 1.5, borderColor: palette.accent,
        backgroundColor: palette.accent + "12",
        alignItems: "center", justifyContent: "center",
      }}>
        <Ionicons name="checkmark" size={22} color={palette.accent} />
      </View>
    </Animated.View>
  );
}

//  detail row

function DetailRow({ label, value, accent, palette, isLast = false }: {
  label: string; value: string; accent?: boolean;
  palette: ThemePalette; isLast?: boolean;
}) {
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 11,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: palette.subtle + "28",
    }}>
      <Text style={{ color: palette.text, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", opacity: 0.45 }}>
        {label}
      </Text>
      <Text style={{
        color: accent ? palette.accent : palette.text,
        fontSize: 13,
        fontFamily: 'Tiempos-Regular',
        letterSpacing: 0.3,
        opacity: accent ? 1 : 0.85,
      }}>
        {value}
      </Text>
    </View>
  );
}

//  drive-thru code card

function DriveThruCode({ code, palette }: { code: string; palette: ThemePalette }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      transform: [{ scale: pulse }],
      backgroundColor: palette.accent + "12",
      borderWidth: 1.5,
      borderColor: palette.accent + "80",
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
      alignItems: "center",
      marginBottom: 28,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Ionicons name="car-outline" size={16} color={palette.accent} />
        <Text style={{ color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.5 }}>
          drive-thru code
        </Text>
      </View>
      <Text style={{ color: palette.accent, fontSize: 44, fontFamily: 'Tiempos-Regular', letterSpacing: 12 }}>
        {code}
      </Text>
      <Text style={{ color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.4, opacity: 0.4, marginTop: 8, textAlign: "center" }}>
        show this code at the window when you arrive
      </Text>
    </Animated.View>
  );
}

//  main component

export default function OrderConfirmationScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";
  const router = useRouter();

  const order: OrderDto | null = globalLastOrder;

  const { label: orderTypeLabel, table } = order
    ? parseOrderType(order.orderType)
    : { label: "—", table: null };

  const isDriveThru  = order?.orderType === "drive_thru";
  const driveThruCode = useDriveThruCode(isDriveThru);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const styles = createStyles(palette);

  if (!order) {
    // Shouldn't happen in normal flow, but guard gracefully
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: palette.text, fontFamily: 'Tiempos-Regular', opacity: 0.5 }}>no order found.</Text>
        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.replace("/(tabs)/menu")}>
          <Text style={{ color: palette.accent, fontFamily: 'Tiempos-Regular', letterSpacing: 1 }}>back to menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const subtotal = order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const tax      = order.total - subtotal;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* check + headline */}
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <AnimatedCheck palette={palette} />
          <Text style={styles.headline}>order confirmed.</Text>
          <Text style={styles.subline}>
            your order is being prepared and will be ready at the time below.
          </Text>
        </View>

        {/* order detail card */}
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <DetailRow label="order #"     value={`#${order.id}`}                           palette={palette} />
          <DetailRow label="location"    value={order.locationName}                        palette={palette} />
          <DetailRow
            label="order type"
            value={table ? `${orderTypeLabel} · ${table}` : orderTypeLabel}
            palette={palette}
          />
          <DetailRow label="pickup time" value={formatPickupTime(order.pickupTime)}        palette={palette} />
          <DetailRow label="payment"     value={order.paymentMethod}                       palette={palette} />
          <DetailRow label="total"       value={fmt(order.total)}          accent           palette={palette} />
          <DetailRow
            label="points earned"
            value={`+${order.pointsEarned} pts`}
            accent
            palette={palette}
            isLast
          />
        </Animated.View>

        {/* drive-thru code */}
        {isDriveThru && (
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
            <DriveThruCode code={driveThruCode} palette={palette} />
          </Animated.View>
        )}

        {/* qr code */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], marginBottom: 28 }}>
          <View style={{
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.accent + '40',
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 24,
            alignItems: 'center',
            gap: 12,
          }}>
            <Text style={{ color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.5 }}>
              show at pickup
            </Text>
            <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12 }}>
              <QRCode value={`order:${order.id}`} size={160} color="#000" backgroundColor="#fff" />
            </View>
            <Text style={{ color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.4, opacity: 0.4 }}>
              order #{order.id}
            </Text>
          </View>
        </Animated.View>
      )

        {/* items */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.itemsHeading}>items</Text>

          {order.items.map((item) => {
            const addOns   = item.selectedAddOnsJson   ? JSON.parse(item.selectedAddOnsJson)   : [];
            const toggles  = item.selectedTogglesJson  ? JSON.parse(item.selectedTogglesJson)  : [];
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.quantity}× {item.menuItemName}
                    {item.size ? ` (${item.size})` : ""}
                  </Text>
                  {toggles.length > 0 && (
                    <Text style={styles.itemMeta}>{toggles.join(", ")}</Text>
                  )}
                  {addOns.length > 0 && (
                    <Text style={styles.itemMeta}>
                      {addOns.map((a: { label?: string; name?: string }) => a.label ?? a.name).join(", ")}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>{fmt(item.unitPrice * item.quantity)}</Text>
              </View>
            );
          })}

          {/* subtotals */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>tax</Text>
              <Text style={styles.summaryValue}>{fmt(tax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>total</Text>
              <Text style={styles.summaryTotalValue}>{fmt(order.total)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* back to menu */}
        <Animated.View style={{ opacity: fadeIn }}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => router.replace("/(tabs)/menu")}>
            <Text style={styles.menuBtnText}>back to menu</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>new orleans · hammond · new york</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
      backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    scroll: { paddingHorizontal: 32, paddingTop: 120, paddingBottom: 64 },
    headline: { color: palette.text, fontSize: 36, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, marginBottom: 10, textAlign: "center" },
    subline: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.5, lineHeight: 20, textAlign: "center", marginBottom: 32, paddingHorizontal: 8 },
    card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "40", borderRadius: 14, paddingHorizontal: 16, marginBottom: 28 },
    itemsHeading: { color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.4, marginBottom: 12 },
    itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.subtle + "28" },
    itemName: { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 2 },
    itemMeta: { color: palette.accent, fontSize: 11, fontFamily: 'Tiempos-Regular', opacity: 0.6, letterSpacing: 0.3 },
    itemPrice: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.75, letterSpacing: 0.3 },
    summaryCard: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "40", borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 28, gap: 10 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between" },
    summaryLabel: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3 },
    summaryValue: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3 },
    summaryTotalRow: { borderTopWidth: 1, borderTopColor: palette.subtle + "40", paddingTop: 10, marginTop: 2 },
    summaryTotalLabel: { color: palette.text, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    summaryTotalValue: { color: palette.accent, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    menuBtn: { borderWidth: 1, borderColor: palette.subtle + "60", borderRadius: 24, paddingVertical: 13, alignItems: "center", backgroundColor: "transparent", marginBottom: 8 },
    menuBtnText: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, opacity: 0.6 },
    footer: { color: palette.accent, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, textAlign: "center", lineHeight: 20, paddingTop: 20, paddingBottom: 20 },
  });