import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';

// ─── types ───────────────────────────────────────────────────────────────────

interface AddOn {
  id: string;
  label: string;
  price: number; // 0 = free
}

interface MenuItem {
  name: string;
  desc: string;
  price: string;
  basePrice: number;
  hasSizes?: boolean;
  addOns?: AddOn[];
  toggles?: { id: string; label: string }[];
}

interface BagItem {
  id: string;
  name: string;
  size?: string;
  addOns: AddOn[];
  toggles: string[];
  qty: number;
  total: number;
}

// ─── menu data ────────────────────────────────────────────────────────────────

const SIZE_UPCHARGES: Record<string, number> = {
  small: 0,
  medium: 0.75,
  large: 1.5,
};

const DRINK_ADDONS: AddOn[] = [
  { id: 'oat', label: 'oat milk', price: 0.75 },
  { id: 'almond', label: 'almond milk', price: 0.75 },
  { id: 'coconut', label: 'coconut milk', price: 0.75 },
  { id: 'extra_shot', label: 'extra shot', price: 1.0 },
  { id: 'vanilla', label: 'vanilla syrup', price: 0.5 },
  { id: 'caramel', label: 'caramel syrup', price: 0.5 },
  { id: 'hazelnut', label: 'hazelnut syrup', price: 0.5 },
  { id: 'whip', label: 'whipped cream', price: 0.5 },
];

const CREPE_ADDONS: AddOn[] = [
  { id: 'extra_nutella', label: 'extra nutella', price: 1.0 },
  { id: 'extra_whip', label: 'extra whipped cream', price: 0.5 },
  { id: 'extra_berries', label: 'extra berries', price: 1.5 },
  { id: 'powdered_sugar', label: 'powdered sugar', price: 0.0 },
  { id: 'extra_choc', label: 'extra chocolate drizzle', price: 0.5 },
];

const BAGEL_ADDONS: AddOn[] = [
  { id: 'extra_cream', label: 'extra cream cheese', price: 0.75 },
  { id: 'extra_salmon', label: 'extra salmon', price: 2.5 },
  { id: 'add_egg', label: 'add fried egg', price: 1.5 },
  { id: 'add_bacon', label: 'add bacon', price: 1.5 },
  { id: 'avocado', label: 'add avocado', price: 1.5 },
];

const MENU: { category: string; items: MenuItem[] }[] = [
  {
    category: 'drinks',
    items: [
      { name: 'iced latte', desc: 'espresso and milk served over ice', price: '$5.50', basePrice: 5.5, hasSizes: true, addOns: DRINK_ADDONS },
      { name: 'supernova', desc: 'unique blend with complex, balanced profile and subtle sweetness — as espresso or with milk', price: '$7.95', basePrice: 7.95, hasSizes: true, addOns: DRINK_ADDONS },
      { name: 'roaring frappe', desc: 'cold brew, milk, and ice blended with a signature syrup, topped with whipped cream', price: '$6.20', basePrice: 6.2, hasSizes: true, addOns: DRINK_ADDONS },
      { name: 'black & white cold brew', desc: 'dark and light roast cold brew, finished with condensed milk', price: '$5.15', basePrice: 5.15, hasSizes: true, addOns: DRINK_ADDONS },
      { name: 'strawberry limeade', desc: 'fresh lime juice blended with strawberry purée', price: '$5.00', basePrice: 5.0, hasSizes: true, addOns: DRINK_ADDONS },
      { name: 'shaken lemonade', desc: 'fresh lemon juice and simple syrup, vigorously shaken', price: '$5.00', basePrice: 5.0, hasSizes: true, addOns: DRINK_ADDONS },
    ],
  },
  {
    category: 'sweet crepes',
    items: [
      { name: 'mannino honey crepe', desc: 'drizzled with Mannino honey, topped with mixed berries', price: '$10.00', basePrice: 10.0, addOns: CREPE_ADDONS },
      { name: 'downtowner', desc: 'strawberries and bananas with Nutella and Hershey\'s chocolate sauce', price: '$10.75', basePrice: 10.75, addOns: CREPE_ADDONS },
      { name: 'funky monkey', desc: 'Nutella and bananas, served with whipped cream', price: '$10.00', basePrice: 10.0, addOns: CREPE_ADDONS },
      { name: 'le s\'mores', desc: 'marshmallow cream and chocolate sauce, topped with graham cracker crumbs', price: '$9.50', basePrice: 9.5, addOns: CREPE_ADDONS },
      { name: 'strawberry fields', desc: 'fresh strawberries, Hershey\'s chocolate drizzle, powdered sugar', price: '$10.00', basePrice: 10.0, addOns: CREPE_ADDONS },
      { name: 'bonjour', desc: 'syrup and cinnamon, finished with powdered sugar', price: '$8.50', basePrice: 8.5, addOns: CREPE_ADDONS },
      { name: 'banana foster', desc: 'bananas with cinnamon, topped with a generous caramel drizzle', price: '$8.95', basePrice: 8.95, addOns: CREPE_ADDONS },
    ],
  },
  {
    category: 'savory crepes',
    items: [
      { name: 'matt\'s scrambled eggs', desc: 'scrambled eggs and melted mozzarella', price: '$5.00', basePrice: 5.0, addOns: CREPE_ADDONS },
      { name: 'meanie mushroom', desc: 'sautéed mushrooms, mozzarella, tomato, and bacon', price: '$10.50', basePrice: 10.5, addOns: CREPE_ADDONS },
      { name: 'turkey club', desc: 'sliced turkey, bacon, spinach, and tomato', price: '$10.50', basePrice: 10.5, addOns: CREPE_ADDONS },
      { name: 'green machine', desc: 'spinach, artichokes, and mozzarella', price: '$10.00', basePrice: 10.0, addOns: CREPE_ADDONS },
      { name: 'perfect pair', desc: 'bacon and Nutella — trust us on this one', price: '$10.00', basePrice: 10.0, addOns: CREPE_ADDONS },
      { name: 'crepe fromage', desc: 'a blend of cheeses, simply done', price: '$8.00', basePrice: 8.0, addOns: CREPE_ADDONS },
      { name: 'farmers market crepe', desc: 'turkey, spinach, and mozzarella', price: '$10.50', basePrice: 10.5, addOns: CREPE_ADDONS },
    ],
  },
  {
    category: 'bagels',
    items: [
      { name: 'travis special', desc: 'cream cheese, salmon, spinach, and a fried egg', price: '$14.00', basePrice: 14.0, addOns: BAGEL_ADDONS, toggles: [{ id: 'toasted', label: 'toasted' }] },
      { name: 'crème brulagel', desc: 'caramelized sugar crust inspired by crème brûlée, with cream cheese', price: '$8.00', basePrice: 8.0, addOns: BAGEL_ADDONS, toggles: [{ id: 'toasted', label: 'toasted' }] },
      { name: 'the fancy one', desc: 'smoked salmon, cream cheese, and fresh dill', price: '$13.00', basePrice: 13.0, addOns: BAGEL_ADDONS, toggles: [{ id: 'toasted', label: 'toasted' }] },
      { name: 'breakfast bagel', desc: 'ham, bacon, or sausage with a fried egg and cheddar', price: '$9.50', basePrice: 9.5, addOns: BAGEL_ADDONS, toggles: [{ id: 'toasted', label: 'toasted' }] },
      { name: 'the classic', desc: 'toasted bagel with cream cheese', price: '$5.25', basePrice: 5.25, addOns: BAGEL_ADDONS, toggles: [{ id: 'toasted', label: 'toasted' }] },
    ],
  },
];

// ─── bag context (simple module-level store so bag page can share it) ─────────
// Replace this with your actual bag context/store if you have one

export let globalBag: BagItem[] = [];
export const bagListeners: (() => void)[] = [];
export function addToBag(item: BagItem) {
  globalBag = [...globalBag, item];
  bagListeners.forEach(l => l());
}

// ─── component ────────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState(0);

  // modal state
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [selectedToggles, setSelectedToggles] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const openModal = (item: MenuItem) => {
    setModalItem(item);
    setSelectedSize('medium');
    setSelectedAddOns([]);
    setSelectedToggles(item.toggles?.map(t => t.id) ?? []); // toasted by default
    setQty(1);
  };

  const toggleAddOn = (addon: AddOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const toggleToggle = (id: string) => {
    setSelectedToggles(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const calcTotal = () => {
    if (!modalItem) return 0;
    const sizeUp = modalItem.hasSizes ? SIZE_UPCHARGES[selectedSize] ?? 0 : 0;
    const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
    return (modalItem.basePrice + sizeUp + addOnTotal) * qty;
  };

  const handleAddToBag = () => {
    if (!modalItem) return;
    const bagItem: BagItem = {
      id: `${modalItem.name}-${Date.now()}`,
      name: modalItem.name,
      size: modalItem.hasSizes ? selectedSize : undefined,
      addOns: selectedAddOns,
      toggles: selectedToggles,
      qty,
      total: calcTotal(),
    };
    addToBag(bagItem);
    setModalItem(null);
    setToastMsg(`${modalItem.name} added to bag ✦`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const categories = MENU.map(s => s.category);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },

    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1, borderBottomColor: palette.accent + '40',
    },
    logoTopBar: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    backBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderWidth: 1, borderColor: palette.accent, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    backBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },

    scroll: { paddingTop: 100, paddingBottom: 48 },

    pageHeader: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 24 },
    pageLabel: { color: palette.accent, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
    pageTitle: { color: palette.text, fontSize: 36, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, marginBottom: 4 },
    pageSubtitle: { color: palette.accent, fontSize: 12, letterSpacing: 1, opacity: 0.6, fontStyle: 'italic' },

    tabBar: { flexDirection: 'row', paddingHorizontal: 32, gap: 8, marginBottom: 24 },
    tab: { borderWidth: 1, borderColor: palette.accent + '60', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    tabActive: { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: palette.accent + '22' },
    tabText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.5 },
    tabTextActive: { color: palette.accent, fontSize: 11, letterSpacing: 0.5 },

    section: { paddingHorizontal: 32 },
    sectionLabel: { color: palette.accent, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, opacity: 0.75 },

    itemRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.accent + '20', gap: 12,
    },
    itemInfo: { flex: 1 },
    itemName: { color: palette.text, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 4 },
    itemDesc: { color: palette.accent, fontSize: 12, lineHeight: 18, opacity: 0.65 },
    itemRight: { alignItems: 'flex-end', gap: 8 },
    itemPrice: { color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    addBtn: {
      borderWidth: 1, borderColor: palette.accent, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 5, backgroundColor: palette.accent + '22',
      flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    addBtnText: { color: palette.accent, fontSize: 10, letterSpacing: 1 },

    footer: { color: palette.accent, fontSize: 11, letterSpacing: 1.5, textAlign: 'center', opacity: 0.5, marginTop: 40, marginBottom: 8 },

    // modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: palette.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderTopWidth: 1, borderColor: palette.accent + '40',
      paddingHorizontal: 28, paddingTop: 16, paddingBottom: 48,
      maxHeight: '88%',
    },
    handle: { width: 36, height: 3, backgroundColor: palette.accent + '40', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalLabel: { color: palette.accent, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 },
    modalTitle: { color: palette.text, fontSize: 22, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 4 },
    modalDesc: { color: palette.accent, fontSize: 12, opacity: 0.6, letterSpacing: 0.3, marginBottom: 24 },

    divider: { height: 1, backgroundColor: palette.accent + '20', marginVertical: 16 },
    sectionTitle: { color: palette.accent, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 },

    // sizes
    sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    sizeBtn: { flex: 1, borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingVertical: 8, alignItems: 'center' },
    sizeBtnActive: { flex: 1, borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingVertical: 8, alignItems: 'center', backgroundColor: palette.accent + '22' },
    sizeBtnText: { color: palette.text, fontSize: 12, letterSpacing: 0.5, opacity: 0.5 },
    sizeBtnTextActive: { color: palette.accent, fontSize: 12, letterSpacing: 0.5 },
    sizeUpcharge: { color: palette.accent, fontSize: 10, opacity: 0.5, marginTop: 2 },

    // add-ons
    addOnsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    addonChip: { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    addonChipActive: { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.accent + '22' },
    addonChipText: { color: palette.text, fontSize: 11, opacity: 0.5 },
    addonChipTextActive: { color: palette.accent, fontSize: 11 },

    // toggles
    toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    toggleChip: { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    toggleChipActive: { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: palette.accent + '22' },
    toggleChipText: { color: palette.text, fontSize: 11, opacity: 0.5 },
    toggleChipTextActive: { color: palette.accent, fontSize: 11 },

    // qty + total
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { color: palette.accent, fontSize: 18, lineHeight: 22 },
    qtyNum: { color: palette.text, fontSize: 18, fontFamily: 'Tiempos-Regular', minWidth: 20, textAlign: 'center' },
    totalText: { color: palette.accent, fontSize: 13, letterSpacing: 0.5 },

    confirmBtn: {
      marginTop: 16, borderWidth: 1, borderColor: palette.accent,
      borderRadius: 24, paddingVertical: 14, alignItems: 'center',
      backgroundColor: palette.accent + '22',
    },
    confirmBtnText: { color: palette.accent, fontSize: 13, letterSpacing: 1.5 },

    // toast
    toast: {
      position: 'absolute', bottom: 48, left: 32, right: 32,
      backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.accent,
      borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
      flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100,
    },
    toastText: { color: palette.accent, fontSize: 12, letterSpacing: 0.5, flex: 1 },
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      <View style={s.topBar}>
        <Text style={s.logoTopBar}>caffeinated lions</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
          <Text style={s.backBtnText}>back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.pageHeader}>
          <Text style={s.pageLabel}>✦ what we&apos;re serving</Text>
          <Text style={s.pageTitle}>our menu.</Text>
          <Text style={s.pageSubtitle}>sip something that gets you ( ´ ▽ ` )</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
          {categories.map((cat, i) => (
            <TouchableOpacity key={cat} style={i === activeCategory ? s.tabActive : s.tab} onPress={() => setActiveCategory(i)}>
              <Text style={i === activeCategory ? s.tabTextActive : s.tabText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.section}>
          <Text style={s.sectionLabel}>{MENU[activeCategory].category}</Text>
          {MENU[activeCategory].items.map((item, i) => (
            <View key={i} style={s.itemRow}>
              <View style={s.itemInfo}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemDesc}>{item.desc}</Text>
              </View>
              <View style={s.itemRight}>
                <Text style={s.itemPrice}>{item.price}</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => openModal(item)}>
                  <Ionicons name="add" size={11} color={palette.accent} />
                  <Text style={s.addBtnText}>add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.footer}>new orleans · hammond · new york</Text>
      </ScrollView>

      {/* ── customisation modal ── */}
      <Modal visible={!!modalItem} transparent animationType="slide" onRequestClose={() => setModalItem(null)}>
        <Pressable style={s.overlay} onPress={() => setModalItem(null)}>
          <Pressable onPress={() => {}}>
            <View style={s.sheet}>
              <View style={s.handle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.modalLabel}>✦ customise your order</Text>
                <Text style={s.modalTitle}>{modalItem?.name}</Text>
                <Text style={s.modalDesc}>{modalItem?.desc}</Text>

                {/* sizes */}
                {modalItem?.hasSizes && (
                  <>
                    <Text style={s.sectionTitle}>size</Text>
                    <View style={s.sizeRow}>
                      {(['small', 'medium', 'large'] as const).map(sz => (
                        <TouchableOpacity
                          key={sz}
                          style={selectedSize === sz ? s.sizeBtnActive : s.sizeBtn}
                          onPress={() => setSelectedSize(sz)}
                        >
                          <Text style={selectedSize === sz ? s.sizeBtnTextActive : s.sizeBtnText}>{sz}</Text>
                          <Text style={s.sizeUpcharge}>
                            {SIZE_UPCHARGES[sz] === 0 ? 'base' : `+$${SIZE_UPCHARGES[sz].toFixed(2)}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={s.divider} />
                  </>
                )}

                {/* toggles (toasted etc) */}
                {modalItem?.toggles && modalItem.toggles.length > 0 && (
                  <>
                    <Text style={s.sectionTitle}>preferences</Text>
                    <View style={s.toggleRow}>
                      {modalItem.toggles.map(t => {
                        const active = selectedToggles.includes(t.id);
                        return (
                          <TouchableOpacity
                            key={t.id}
                            style={active ? s.toggleChipActive : s.toggleChip}
                            onPress={() => toggleToggle(t.id)}
                          >
                            <Text style={active ? s.toggleChipTextActive : s.toggleChipText}>
                              {active ? `✓ ${t.label}` : t.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={s.divider} />
                  </>
                )}

                {/* add-ons */}
                {modalItem?.addOns && modalItem.addOns.length > 0 && (
                  <>
                    <Text style={s.sectionTitle}>add-ons</Text>
                    <View style={s.addOnsGrid}>
                      {modalItem.addOns.map(addon => {
                        const active = !!selectedAddOns.find(a => a.id === addon.id);
                        return (
                          <TouchableOpacity
                            key={addon.id}
                            style={active ? s.addonChipActive : s.addonChip}
                            onPress={() => toggleAddOn(addon)}
                          >
                            <Text style={active ? s.addonChipTextActive : s.addonChipText}>
                              {addon.label}{addon.price > 0 ? ` +$${addon.price.toFixed(2)}` : ' free'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <View style={s.divider} />
                  </>
                )}

                {/* qty + total */}
                <View style={s.bottomRow}>
                  <View style={s.qtyRow}>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                      <Text style={s.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qtyNum}>{qty}</Text>
                    <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => q + 1)}>
                      <Text style={s.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.totalText}>total  ${calcTotal().toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={s.confirmBtn} onPress={handleAddToBag}>
                  <Text style={s.confirmBtnText}>add to bag ✦</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* toast */}
      {showToast && (
        <View style={s.toast}>
          <Ionicons name="bag-outline" size={14} color={palette.accent} />
          <Text style={s.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}