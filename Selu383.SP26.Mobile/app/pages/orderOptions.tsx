import React, { useState, useEffect } from "react";
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

// ─── data ─────────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id: "new_orleans", label: "new orleans", address: "1140 S Carrollton Ave, New Orleans, LA" },
  { id: "hammond",     label: "hammond",     address: "110 North Cate Street, Hammond, LA" },
  { id: "new_york",    label: "new york",    address: "72 E 1st St, New York, NY" },
];

const ORDER_TYPES = [
  { id: "dine_in",    label: "dine in",    icon: "restaurant-outline" as const },
  { id: "carry_out",  label: "carry out",  icon: "bag-handle-outline" as const },
  { id: "drive_thru", label: "drive thru", icon: "car-outline" as const },
];

const PAYMENT_METHODS = [
  { id: "card",   label: "credit / debit", icon: "card-outline" as const },
  { id: "cash",   label: "cash",           icon: "cash-outline" as const },
  { id: "apple",  label: "apple pay",      icon: "logo-apple" as const },
  { id: "google", label: "google pay",     icon: "logo-google" as const },
];

// ─── time helpers ─────────────────────────────────────────────────────────────

function generateTimeSlots(): string[] {
  const now = new Date();
  const slots: string[] = [];
  const start = new Date(now);
  start.setSeconds(0, 0);
  start.setMinutes(Math.ceil((start.getMinutes() + 15) / 15) * 15);

  const end = new Date(now);
  end.setHours(22, 0, 0, 0);

  const cursor = new Date(start);
  while (cursor <= end) {
    const h = cursor.getHours();
    const m = cursor.getMinutes();
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m === 0 ? "00" : String(m);
    slots.push(`${h12}:${mm} ${ampm}`);
    cursor.setMinutes(cursor.getMinutes() + 15);
  }
  return slots;
}

// ─── section header ───────────────────────────────────────────────────────────

function SectionHeader({ number, label, palette }: { number: string; label: string; palette: ThemePalette }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 1, borderColor: palette.accent,
        alignItems: "center", justifyContent: "center",
        backgroundColor: palette.accent + "18",
      }}>
        <Text style={{ color: palette.accent, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 }}>{number}</Text>
      </View>
      <Text style={{ color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.6 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── component ────────────────────────────────────────────────────────────────

export default function OrderOptionsScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";
  const router = useRouter();

  const [location, setLocation]     = useState<string | null>(null);
  const [orderType, setOrderType]   = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [payment, setPayment]       = useState<string | null>(null);
  const [timeSlots, setTimeSlots]   = useState<string[]>([]);

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
    const interval = setInterval(() => setTimeSlots(generateTimeSlots()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isReady = location && orderType && pickupTime && payment;

  const handleConfirm = () => {
    if (!isReady) {
      Alert.alert("not quite", "please fill in all options ☕");
      return;
    }
    // TODO: pass options to order confirmation
    router.replace("/pages/orderConfirmation");
  };

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
          <Text style={styles.backBtnText}>back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.headline}>
          {"almost\n"}
          <Text style={{ color: palette.accent }}>there. ♡</Text>
        </Text>
        <Text style={styles.subline}>just a few more details and we&apos;ll get started on your order.</Text>

        {/* 1. location */}
        <View style={styles.section}>
          <SectionHeader number="1" label="choose a location" palette={palette} />
          {LOCATIONS.map(loc => {
            const active = location === loc.id;
            return (
              <TouchableOpacity
                key={loc.id}
                style={[styles.optionCard, active && styles.optionCardActive]}
                onPress={() => setLocation(loc.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{loc.label}</Text>
                  <Text style={styles.optionSub}>{loc.address}</Text>
                </View>
                {active && <Ionicons name="checkmark" size={14} color={palette.accent} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. order type */}
        <View style={styles.section}>
          <SectionHeader number="2" label="how are you ordering?" palette={palette} />
          <View style={styles.chipRow}>
            {ORDER_TYPES.map(type => {
              const active = orderType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.iconChip, active && styles.iconChipActive]}
                  onPress={() => setOrderType(type.id)}
                >
                  <Ionicons name={type.icon} size={18} color={active ? palette.accent : palette.subtle} />
                  <Text style={[styles.iconChipText, active && styles.iconChipTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. pickup time */}
        <View style={styles.section}>
          <SectionHeader number="3" label="when do you want it?" palette={palette} />
          {timeSlots.length === 0 ? (
            <Text style={styles.closedText}>sorry, we&apos;re closed for the rest of today ☕{"\n"}come back tomorrow!</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
              {timeSlots.map(slot => {
                const active = pickupTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.timeChip, active && styles.timeChipActive]}
                    onPress={() => setPickupTime(slot)}
                  >
                    <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 4. payment */}
        <View style={styles.section}>
          <SectionHeader number="4" label="how are you paying?" palette={palette} />
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map(method => {
              const active = payment === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentCard, active && styles.paymentCardActive]}
                  onPress={() => setPayment(method.id)}
                >
                  {active && (
                    <View style={styles.paymentCheck}>
                      <Ionicons name="checkmark" size={10} color={palette.accent} />
                    </View>
                  )}
                  <Ionicons name={method.icon} size={20} color={active ? palette.accent : palette.subtle} style={{ marginBottom: 6 }} />
                  <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>{method.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* confirm */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!isReady}
          style={[styles.submitBtn, !isReady && { opacity: 0.4 }]}
        >
          <Text style={styles.submitBtnText}>confirm order ♡</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>new orleans · hammond · new york</Text>
      </ScrollView>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: "absolute",
      top: 0, left: 0, right: 0, zIndex: 10,
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
    logo: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
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
    backBtnText: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },

    headline: {
      color: palette.text,
      fontSize: 42,
      fontFamily: 'Tiempos-Regular',
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subline: {
      color: palette.text,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      opacity: 0.6,
      lineHeight: 20,
      marginBottom: 40,
    },

    section: { marginBottom: 36 },

    // location
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 8,
    },
    optionCardActive: {
      borderColor: palette.accent,
      backgroundColor: palette.accent + "12",
    },
    optionLabel: { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 2, opacity: 0.6 },
    optionLabelActive: { opacity: 1 },
    optionSub: { color: palette.accent, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.55 },

    // order type
    chipRow: { flexDirection: "row", gap: 10 },
    iconChip: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: palette.subtle + "50",
      borderRadius: 12,
      backgroundColor: palette.surface,
    },
    iconChipActive: { borderColor: palette.accent, backgroundColor: palette.accent + "12" },
    iconChipText: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.5 },
    iconChipTextActive: { color: palette.accent, opacity: 1 },

    // time
    timeRow: { gap: 8, paddingRight: 8 },
    timeChip: {
      borderWidth: 1,
      borderColor: palette.subtle + "50",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: palette.surface,
    },
    timeChipActive: { borderColor: palette.accent, backgroundColor: palette.accent + "18" },
    timeChipText: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.5 },
    timeChipTextActive: { color: palette.accent, opacity: 1 },
    closedText: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3, lineHeight: 22 },

    // payment
    paymentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    paymentCard: {
      width: "47%",
      alignItems: "center",
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: palette.subtle + "50",
      borderRadius: 12,
      backgroundColor: palette.surface,
    },
    paymentCardActive: { borderColor: palette.accent, backgroundColor: palette.accent + "12" },
    paymentLabel: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.5 },
    paymentLabelActive: { color: palette.accent, opacity: 1 },
    paymentCheck: {
      position: "absolute",
      top: 8, right: 8,
      width: 16, height: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.accent,
      backgroundColor: palette.accent + "22",
      alignItems: "center",
      justifyContent: "center",
    },

    // submit
    submitBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: palette.accent + "18",
      marginBottom: 8,
    },
    submitBtnText: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, },

    footer: {
      color: palette.accent,
      fontSize: 15,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
      textAlign: "center",
      lineHeight: 20,
      paddingTop: 20,
      paddingBottom: 20,
    },
  });