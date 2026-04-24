import React, { useEffect, useRef } from "react";
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

//  types 

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  total: number;
  size?: string;
  toggles: string[];
  addOns: { label: string; price: number }[];
}

interface OrderDetails {
  orderNumber: number;
  location: string;
  pickupTime: string;
  orderType: string;
  payment: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  pointsEarned: number;
}

//  mock data (replace with real passed props/store) 

const MOCK_ORDER: OrderDetails = {
  orderNumber: 1,
  location: "hammond, la",
  pickupTime: "06:21 pm",
  orderType: "carry out",
  payment: "credit / debit",
  items: [
    {
      id: "1",
      name: "drip coffee",
      qty: 1,
      total: 4.25,
      size: "medium",
      toggles: [],
      addOns: [],
    },
  ],
  subtotal: 4.25,
  tax: 0.41,
  grandTotal: 4.66,
  pointsEarned: 5,
};

//  checkmark animation 

function AnimatedCheck({ palette }: { palette: ThemePalette }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
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

//  component 

export default function OrderConfirmationScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";
  const router = useRouter();

  // In production, pull from route params or global state
  const order = MOCK_ORDER;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const styles = createStyles(palette);

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
          <DetailRow label="order #"    value={String(order.orderNumber)}  palette={palette} />
          <DetailRow label="location"   value={order.location}             palette={palette} />
          <DetailRow label="order type" value={order.orderType}            palette={palette} />
          <DetailRow label="pickup time" value={order.pickupTime}          palette={palette} />
          <DetailRow label="payment"    value={order.payment}              palette={palette} />
          <DetailRow label="total"      value={`$${order.grandTotal.toFixed(2)}`} accent palette={palette} />
          <DetailRow
            label="points earned"
            value={`+${order.pointsEarned} pts`}
            accent
            palette={palette}
            isLast
          />
        </Animated.View>

        {/* items */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.itemsHeading}>items</Text>

          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.qty}× {item.name}
                  {item.size ? ` (${item.size})` : ""}
                </Text>
                {item.toggles.length > 0 && (
                  <Text style={styles.itemMeta}>{item.toggles.join(", ")}</Text>
                )}
                {item.addOns.length > 0 && (
                  <Text style={styles.itemMeta}>{item.addOns.map(a => a.label).join(", ")}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>${item.total.toFixed(2)}</Text>
            </View>
          ))}

          {/* subtotals */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>subtotal</Text>
              <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>tax (9.75%)</Text>
              <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>total</Text>
              <Text style={styles.summaryTotalValue}>${order.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* back to menu */}
        <Animated.View style={{ opacity: fadeIn }}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.replace("/(tabs)/menu")}
          >
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
      position: "absolute",
      top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },

    scroll: { paddingHorizontal: 32, paddingTop: 120, paddingBottom: 64 },

    headline: {
      color: palette.text,
      fontSize: 36,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      marginBottom: 10,
      textAlign: "center",
    },
    subline: {
      color: palette.text,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.3,
      opacity: 0.5,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 32,
      paddingHorizontal: 8,
    },

    card: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 28,
    },

    itemsHeading: {
      color: palette.text,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 2.5,
      textTransform: "uppercase",
      opacity: 0.4,
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + "28",
    },
    itemName: {
      color: palette.text,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.3,
      marginBottom: 2,
    },
    itemMeta: { color: palette.accent, fontSize: 11, fontFamily: 'Tiempos-Regular', opacity: 0.6, letterSpacing: 0.3 },
    itemPrice: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.75, letterSpacing: 0.3 },

    summaryCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 14,
      padding: 16,
      marginTop: 16,
      marginBottom: 28,
      gap: 10,
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between" },
    summaryLabel: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3 },
    summaryValue: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3 },
    summaryTotalRow: {
      borderTopWidth: 1,
      borderTopColor: palette.subtle + "40",
      paddingTop: 10,
      marginTop: 2,
    },
    summaryTotalLabel: { color: palette.text, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    summaryTotalValue: { color: palette.accent, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },

    menuBtn: {
      borderWidth: 1,
      borderColor: palette.subtle + "60",
      borderRadius: 24,
      paddingVertical: 13,
      alignItems: "center",
      backgroundColor: "transparent",
      marginBottom: 8,
    },
    menuBtnText: {
      color: palette.text,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
      opacity: 0.6,
    },

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