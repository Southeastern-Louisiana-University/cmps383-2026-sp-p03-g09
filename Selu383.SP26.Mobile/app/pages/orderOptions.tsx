import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, ThemePalette } from "@/app/theme-context";
import { useAuth } from "../context/AuthContext";
import { globalBag, BagItem } from '../(tabs)/menu';
import { api, OrderDto, CreateOrderDto, CreateOrderItemDto } from '../context/api';

//  global order result — read by orderConfirmation

export let globalLastOrder: OrderDto | null = null;

//  data

const LOCATIONS = [
  { id: 1, label: "new orleans", address: "1140 S Carrollton Ave, New Orleans, LA", taxRate: 0.0975 },
  { id: 2, label: "hammond",     address: "110 North Cate Street, Hammond, LA",    taxRate: 0.0975 },
  { id: 3, label: "new york",    address: "72 E 1st St, New York, NY",             taxRate: 0.08875 },
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

function isExpiryValid(value: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  const [mm, yy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear  = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

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

// convert display slot "6:45 pm" → ISO string for today
function slotToIso(slot: string): string {
  const [time, ampm] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
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

//  auth banner

function AuthBanner({
  palette,
  onSignIn,
  onContinueAsGuest,
}: {
  palette: ThemePalette;
  onSignIn: () => void;
  onContinueAsGuest: () => void;
}) {
  const s = StyleSheet.create({
    wrapper: {
      borderWidth: 1,
      borderColor: palette.accent + "60",
      borderRadius: 16,
      backgroundColor: palette.accent + "0E",
      padding: 18,
      marginBottom: 36,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    heading: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.4, flex: 1 },
    sub: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.55, lineHeight: 18, marginBottom: 16 },
    btnRow: { flexDirection: "row", gap: 10 },
    primaryBtn: { flex: 1, borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingVertical: 10, alignItems: "center", backgroundColor: palette.accent + "18" },
    primaryBtnText: { color: palette.accent, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    ghostBtn: { flex: 1, borderWidth: 1, borderColor: palette.subtle + "60", borderRadius: 20, paddingVertical: 10, alignItems: "center" },
    ghostBtnText: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.8, opacity: 0.55 },
  });

  return (
    <View style={s.wrapper}>
      <View style={s.row}>
        <Ionicons name="person-circle-outline" size={18} color={palette.accent} />
        <Text style={s.heading}>you&apos;re not signed in</Text>
      </View>
      <Text style={s.sub}>
        sign in to track your order history, earn rewards, and check out faster next time.
      </Text>
      <View style={s.btnRow}>
        <TouchableOpacity style={s.primaryBtn} onPress={onSignIn}>
          <Text style={s.primaryBtnText}>sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ghostBtn} onPress={onContinueAsGuest}>
          <Text style={s.ghostBtnText}>guest checkout</Text>
        </TouchableOpacity>
      </View>
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

  const filtered = TABLE_OPTIONS.filter(t => t.toLowerCase().includes(search.toLowerCase()));

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
        tds(palette).inputRow,
        open && { borderColor: palette.accent, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
      ]}>
        <Ionicons name="grid-outline" size={14} color={palette.subtle} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={handleChangeText}
          onFocus={() => setOpen(true)}
          placeholder="search or type a table..."
          placeholderTextColor={palette.subtle}
          style={tds(palette).input}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setOpen(o => !o)}>
          <Ionicons name={open ? "chevron-up-outline" : "chevron-down-outline"} size={14} color={palette.subtle} />
        </TouchableOpacity>
      </View>

      {open && filtered.length > 0 && (
        <View style={tds(palette).dropdown}>
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
                  style={[tds(palette).dropdownItem, active && { backgroundColor: palette.accent + "18" }]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[tds(palette).dropdownItemText, active && { color: palette.accent, opacity: 1 }]}>
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

const tds = (palette: ThemePalette) => StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "50", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, padding: 0 },
  dropdown: { backgroundColor: palette.surface, borderWidth: 1, borderTopWidth: 0, borderColor: palette.accent, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: "hidden" },
  dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: palette.subtle + "20" },
  dropdownItemText: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.6 },
});

//  card entry

export interface CardEntryHandle {
  validate: () => boolean;
}
export let globalLastDriveThruCode: string | null = null;
export function setGlobalDriveThruCode(code: string | null) {
  globalLastDriveThruCode = code;
}
export function setGlobalLastOrder(order: OrderDto | null) {
  globalLastOrder = order;
}
const CardEntry = forwardRef<CardEntryHandle, { palette: ThemePalette }>(
  function CardEntry({ palette }, ref) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry]         = useState("");
    const [cvv, setCvv]               = useState("");
    const [name, setName]             = useState("");
    const [touched, setTouched]       = useState({ name: false, cardNumber: false, expiry: false, cvv: false });

    const expiryFormatOk = /^\d{2}\/\d{2}$/.test(expiry);
    const expiryExpired  = expiryFormatOk && !isExpiryValid(expiry);

    const errors = {
      name:       name.trim().length < 2,
      cardNumber: cardNumber.replace(/\s/g, "").length < 16,
      expiry:     !expiryFormatOk || expiryExpired,
      cvv:        cvv.length < 3,
    };

    const expiryMessage = expiryExpired ? "this card has expired" : "mm/yy required";

    useImperativeHandle(ref, () => ({
      validate() {
        setTouched({ name: true, cardNumber: true, expiry: true, cvv: true });
        return !Object.values(errors).some(Boolean);
      },
    }));

    const formatCardNumber = (text: string) => text.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    const formatExpiry = (text: string) => {
      const digits = text.replace(/\D/g, "").slice(0, 4);
      if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
      return digits;
    };

    const fieldStyle = (key: keyof typeof errors) => [
      s.field,
      touched[key] && errors[key] && { borderColor: "#f87171", borderWidth: 1.5 },
    ];

    const s = StyleSheet.create({
      row: { flexDirection: "row", gap: 10 },
      field: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "50", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
      fieldLabel: { color: palette.text, fontSize: 9, fontFamily: 'Tiempos-Regular', letterSpacing: 2, textTransform: "uppercase", opacity: 0.4, marginBottom: 4 },
      fieldInput: { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1, padding: 0 },
      errorText: { color: "#f87171", fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginTop: 4 },
    });

    return (
      <View>
        <View style={fieldStyle("name")}>
          <Text style={s.fieldLabel}>cardholder name</Text>
          <TextInput value={name} onChangeText={setName} onBlur={() => setTouched(t => ({ ...t, name: true }))} placeholder="your name" placeholderTextColor={palette.subtle} style={s.fieldInput} autoCapitalize="words" autoCorrect={false} />
          {touched.name && errors.name && <Text style={s.errorText}>at least 2 characters required</Text>}
        </View>

        <View style={fieldStyle("cardNumber")}>
          <Text style={s.fieldLabel}>card number</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput value={cardNumber} onChangeText={t => setCardNumber(formatCardNumber(t))} onBlur={() => setTouched(t => ({ ...t, cardNumber: true }))} placeholder="0000 0000 0000 0000" placeholderTextColor={palette.subtle} style={[s.fieldInput, { flex: 1 }]} keyboardType="numeric" maxLength={19} />
            <Ionicons name="card-outline" size={16} color={palette.subtle} />
          </View>
          {touched.cardNumber && errors.cardNumber && <Text style={s.errorText}>enter a valid 16-digit card number</Text>}
        </View>

        <View style={s.row}>
          <View style={[fieldStyle("expiry"), { flex: 1 }]}>
            <Text style={s.fieldLabel}>expiry</Text>
            <TextInput value={expiry} onChangeText={t => setExpiry(formatExpiry(t))} onBlur={() => setTouched(t => ({ ...t, expiry: true }))} placeholder="mm/yy" placeholderTextColor={palette.subtle} style={s.fieldInput} keyboardType="numeric" maxLength={5} />
            {touched.expiry && errors.expiry && <Text style={s.errorText}>{expiryMessage}</Text>}
          </View>

          <View style={[fieldStyle("cvv"), { flex: 1 }]}>
            <Text style={s.fieldLabel}>cvv</Text>
            <TextInput value={cvv} onChangeText={t => setCvv(t.replace(/\D/g, "").slice(0, 4))} onBlur={() => setTouched(t => ({ ...t, cvv: true }))} placeholder="•••" placeholderTextColor={palette.subtle} style={s.fieldInput} keyboardType="numeric" secureTextEntry maxLength={4} />
            {touched.cvv && errors.cvv && <Text style={s.errorText}>3–4 digits required</Text>}
          </View>
        </View>
      </View>
    );
  }
);

//  order summary

function OrderSummary({ locationId, palette }: { locationId: number | null; palette: ThemePalette }) {
  const loc = LOCATIONS.find(l => l.id === locationId);
  const taxRate = loc?.taxRate ?? 0;
  const items: BagItem[] = globalBag;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const s = StyleSheet.create({
    container: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "40", borderRadius: 14, padding: 16, marginBottom: 8 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
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

  const { user, refresh } = useAuth();
  const isLoggedIn = !!user;

  const [guestMode, setGuestMode]   = useState(false);
  const showAuthBanner = !isLoggedIn && !guestMode;

  const cardRef = useRef<CardEntryHandle>(null);

  const [location, setLocation]     = useState<number | null>(null);
  const [orderType, setOrderType]   = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [table, setTable]           = useState<string>("");
  const [timeSlots, setTimeSlots]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
    const interval = setInterval(() => setTimeSlots(generateTimeSlots()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isDineIn   = orderType === "dine_in";
  const isReady    = location && orderType && pickupTime && (!isDineIn || table.trim().length > 0);

  const handleConfirm = async () => {
    if (showAuthBanner) {
      Alert.alert("one more thing", "please sign in or continue as a guest to place your order ☕");
      return;
    }

    const cardValid = cardRef.current?.validate() ?? false;

    if (!isReady || !cardValid) {
      Alert.alert(
        "not quite",
        !cardValid
          ? "please complete your payment details ☕"
          : isDineIn && !table.trim()
            ? "please select or enter a table ☕"
            : "please fill in all options ☕"
      );
      return;
    }

    if (globalBag.length === 0) {
      Alert.alert("your bag is empty", "add some items before placing an order ☕");
      return;
    }

    setSubmitting(true);
    try {
      // Build the order type string — include table for dine in
      const orderTypeValue = isDineIn && table.trim()
        ? `dine_in:${table.trim()}`
        : orderType!;

      const dto: CreateOrderDto = {
        locationId:    location!,
        orderType:     orderTypeValue,
        pickupTime:    slotToIso(pickupTime!),
        paymentMethod: "credit / debit",
        items: globalBag.map(item => ({
          menuItemId:           item.menuItemId,
          size:                 item.size ?? undefined,
          quantity:             item.qty,
          selectedAddOnIds:     item.addOns.map(a => a.id),
          selectedToggleLabels: item.toggles,
        } as CreateOrderItemDto)),
      };

      const order = await api.orders.create(dto);
      globalLastOrder = order;

      // Clear bag
      globalBag.splice(0, globalBag.length);

      // Refresh user so points update in context
      if (isLoggedIn) {
        await refresh().catch(() => {});
      }

      router.replace("/pages/orderConfirmation");
    } catch (err) {
      Alert.alert("something went wrong", "we couldn't place your order. please try again ☕");
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

        {showAuthBanner && (
          <AuthBanner
            palette={palette}
            onSignIn={() => router.push('/pages/login')}
            onContinueAsGuest={() => setGuestMode(true)}
          />
        )}

        {isLoggedIn && (
          <View style={styles.loggedInPill}>
            <Ionicons name="checkmark-circle-outline" size={13} color={palette.accent} />
            <Text style={styles.loggedInText}>signed in as {user.userName ?? "you"}</Text>
          </View>
        )}

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

        {/* 4. payment */}
        <View style={styles.section}>
          <SectionHeader number="4" label="payment" palette={palette} />
          <CardEntry ref={cardRef} palette={palette} />
        </View>

        {/* 5. order summary */}
        <View style={styles.section}>
          <SectionHeader number="5" label="your order" palette={palette} />
          <OrderSummary locationId={location} palette={palette} />
        </View>

        {/* confirm */}
        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Text style={styles.submitBtnText}>confirm order ♡</Text>
          )}
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
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
      backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: palette.subtle, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    backBtnText: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },
    headline: { color: palette.text, fontSize: 42, fontFamily: 'Tiempos-Regular', lineHeight: 50, letterSpacing: 0.5, marginBottom: 8 },
    subline: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.6, lineHeight: 20, marginBottom: 40 },
    loggedInPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: palette.accent + "50", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 32, backgroundColor: palette.accent + "0E" },
    loggedInText: { color: palette.accent, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.4, opacity: 0.85 },
    section: { marginBottom: 36 },
    optionCard: { flexDirection: "row", alignItems: "center", backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.subtle + "40", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
    optionCardActive: { borderColor: palette.accent, backgroundColor: palette.accent + "12" },
    optionLabel: { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 2, opacity: 0.6 },
    optionLabelActive: { opacity: 1 },
    optionSub: { color: palette.accent, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, opacity: 0.55 },
    chipRow: { flexDirection: "row", gap: 10 },
    iconChip: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderWidth: 1, borderColor: palette.subtle + "50", borderRadius: 12, backgroundColor: palette.surface },
    iconChipActive: { borderColor: palette.accent, backgroundColor: palette.accent + "12" },
    iconChipText: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.5 },
    iconChipTextActive: { color: palette.accent, opacity: 1 },
    timeRow: { gap: 8, paddingRight: 8 },
    timeChip: { borderWidth: 1, borderColor: palette.subtle + "50", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: palette.surface },
    timeChipActive: { borderColor: palette.accent, backgroundColor: palette.accent + "18" },
    timeChipText: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.5 },
    timeChipTextActive: { color: palette.accent, opacity: 1 },
    closedText: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.5, letterSpacing: 0.3, lineHeight: 22 },
    submitBtn: { borderWidth: 1, borderColor: palette.accent, borderRadius: 24, paddingVertical: 14, alignItems: "center", backgroundColor: palette.accent + "18", marginBottom: 8 },
    submitBtnText: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5 },
    footer: { color: palette.accent, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, textAlign: "center", lineHeight: 20, paddingTop: 20, paddingBottom: 20 },
  });