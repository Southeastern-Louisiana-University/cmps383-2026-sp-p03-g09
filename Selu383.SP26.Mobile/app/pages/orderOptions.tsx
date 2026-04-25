import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, ThemePalette } from "@/app/theme-context";
import { globalBag, BagItem } from '../(tabs)/menu';

//  data 

const LOCATIONS = [
  { id: "new_orleans", label: "new orleans", address: "1140 S Carrollton Ave, New Orleans, LA", taxRate: 0.0975 },
  { id: "hammond",     label: "hammond",     address: "110 North Cate Street, Hammond, LA",    taxRate: 0.0975 },
  { id: "new_york",    label: "new york",    address: "72 E 1st St, New York, NY",             taxRate: 0.08875 },
];

const ORDER_TYPES = [
  { id: "dine_in",    label: "dine in",    icon: "restaurant-outline" as const },
  { id: "carry_out",  label: "carry out",  icon: "bag-handle-outline" as const },
  { id: "drive_thru", label: "drive thru", icon: "car-outline" as const },
];

const TABLE_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => `table ${i + 1}`),
  "bar seating",
  "patio",
];

//  time helpers 

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

//  section header 

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

//  table dropdown 

function TableDropdown({ value, onChange, palette }: {
  value: string;
  onChange: (v: string) => void;
  palette: ThemePalette;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);

  const filtered = TABLE_OPTIONS.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: string) => {
    onChange(item);
    setSearch(item);
    setOpen(false);
    Keyboard.dismiss();
  };

  const handleChangeText = (text: string) => {
    setSearch(text);
    onChange(text);
    setOpen(true);
  };

  return (
    <View style={{ zIndex: 100 }}>
      <View style={[
        tableDropdownStyles(palette).inputRow,
        open && { borderColor: palette.accent, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
      ]}>
        <Ionicons name="grid-outline" size={14} color={palette.subtle} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={handleChangeText}
          onFocus={() => setOpen(true)}
          placeholder="search or type a table..."
          placeholderTextColor={palette.subtle}
          style={tableDropdownStyles(palette).input}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setOpen(o => !o)}>
          <Ionicons
            name={open ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color={palette.subtle}
          />
        </TouchableOpacity>
      </View>

      {open && filtered.length > 0 && (
        <View style={tableDropdownStyles(palette).dropdown}>
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            style={{ maxHeight: 180 }}
            renderItem={({ item }) => {
              const active = item === value;
              return (
                <TouchableOpacity
                  style={[tableDropdownStyles(palette).dropdownItem, active && { backgroundColor: palette.accent + "18" }]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[tableDropdownStyles(palette).dropdownItemText, active && { color: palette.accent, opacity: 1 }]}>
                    {item}
                  </Text>
                  {active && <Ionicons name="checkmark" size={12} color={palette.accent} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const tableDropdownStyles = (palette: ThemePalette) => StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.subtle + "50",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 13,
    fontFamily: 'Tiempos-Regular',
    letterSpacing: 0.3,
    padding: 0,
  },
  dropdown: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: palette.accent,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: palette.subtle + "20",
  },
  dropdownItemText: {
    color: palette.text,
    fontSize: 13,
    fontFamily: 'Tiempos-Regular',
    letterSpacing: 0.3,
    opacity: 0.6,
  },
});

//  card entry 

function CardEntry({ palette }: { palette: ThemePalette }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const s = StyleSheet.create({
    row: { flexDirection: "row", gap: 10 },
    field: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "50",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
    },
    fieldLabel: {
      color: palette.text,
      fontSize: 9,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 2,
      textTransform: "uppercase",
      opacity: 0.4,
      marginBottom: 4,
    },
    fieldInput: {
      color: palette.text,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      padding: 0,
    },
  });

  return (
    <View>
      <View style={s.field}>
        <Text style={s.fieldLabel}>cardholder name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="your name"
          placeholderTextColor={palette.subtle}
          style={s.fieldInput}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      <View style={s.field}>
        <Text style={s.fieldLabel}>card number</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={cardNumber}
            onChangeText={t => setCardNumber(formatCardNumber(t))}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={palette.subtle}
            style={[s.fieldInput, { flex: 1 }]}
            keyboardType="numeric"
            maxLength={19}
          />
          <Ionicons name="card-outline" size={16} color={palette.subtle} />
        </View>
      </View>

      <View style={s.row}>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.fieldLabel}>expiry</Text>
          <TextInput
            value={expiry}
            onChangeText={t => setExpiry(formatExpiry(t))}
            placeholder="mm/yy"
            placeholderTextColor={palette.subtle}
            style={s.fieldInput}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.fieldLabel}>cvv</Text>
          <TextInput
            value={cvv}
            onChangeText={t => setCvv(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="•••"
            placeholderTextColor={palette.subtle}
            style={s.fieldInput}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
        </View>
      </View>
    </View>
  );
}

//  order summary — uses BagItem fields (total, qty) 

function OrderSummary({ locationId, palette }: { locationId: string | null; palette: ThemePalette }) {
  const loc = LOCATIONS.find(l => l.id === locationId);
  const taxRate = loc?.taxRate ?? 0;

  const items: BagItem[] = globalBag;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const s = StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "40",
      borderRadius: 14,
      padding: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    itemName: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.8, flex: 1 },
    itemQty: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', opacity: 0.4, marginRight: 8 },
    itemPrice: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.8 },
    divider: { height: 1, backgroundColor: palette.subtle + "30", marginVertical: 10 },
    metaText: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3 },
    metaValue: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', opacity: 0.5 },
    totalLabel: { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    totalValue: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    empty: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.4, textAlign: "center", paddingVertical: 8 },
  });

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <Text style={s.empty}>your bag is empty</Text>
      ) : (
        <>
          {items.map((item, i) => (
            <View key={i} style={s.row}>
              <Text style={s.itemQty}>×{item.qty}</Text>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemPrice}>{fmt(item.total)}</Text>
            </View>
          ))}

          <View style={s.divider} />

          <View style={s.row}>
            <Text style={s.metaText}>subtotal</Text>
            <Text style={s.metaValue}>{fmt(subtotal)}</Text>
          </View>

          <View style={[s.row, { marginBottom: 10 }]}>
            <Text style={s.metaText}>
              tax {loc ? `(${(taxRate * 100).toFixed(3).replace(/\.?0+$/, "")}% · ${loc.label})` : "(select a location)"}
            </Text>
            <Text style={s.metaValue}>{loc ? fmt(tax) : "—"}</Text>
          </View>

          <View style={s.divider} />

          <View style={[s.row, { marginBottom: 0, marginTop: 4 }]}>
            <Text style={s.totalLabel}>total</Text>
            <Text style={s.totalValue}>{loc ? fmt(total) : fmt(subtotal)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

//  main component 

export default function OrderOptionsScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";
  const router = useRouter();

  const [location, setLocation]     = useState<string | null>(null);
  const [orderType, setOrderType]   = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [table, setTable]           = useState<string>("");
  const [timeSlots, setTimeSlots]   = useState<string[]>([]);

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
    const interval = setInterval(() => setTimeSlots(generateTimeSlots()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isDineIn = orderType === "dine_in";
  const isReady = location && orderType && pickupTime && (!isDineIn || table.trim().length > 0);

  const handleConfirm = () => {
    if (!isReady) {
      Alert.alert("not quite", isDineIn && !table.trim()
        ? "please select or enter a table ☕"
        : "please fill in all options ☕"
      );
      return;
    }
    // clear the bag only after full confirmation
    globalBag.splice(0, globalBag.length);
    router.replace("/pages/orderConfirmation");
  };

  const styles = createStyles(palette);

  return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

        {/* top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>caffeinated lions</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('../(tabs)/bag')}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.backBtnText}>back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
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

            {isDineIn && (
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.optionLabel, { marginBottom: 10, opacity: 0.6 }]}>which table?</Text>
                <TableDropdown value={table} onChange={setTable} palette={palette} />
              </View>
            )}
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

          {/* 4. card payment */}
          <View style={styles.section}>
            <SectionHeader number="4" label="payment" palette={palette} />
            <CardEntry palette={palette} />
          </View>

          {/* 5. order summary */}
          <View style={styles.section}>
            <SectionHeader number="5" label="your order" palette={palette} />
            <OrderSummary locationId={location} palette={palette} />
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

//  styles 

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

    submitBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: palette.accent + "18",
      marginBottom: 8,
    },
    submitBtnText: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5 },

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