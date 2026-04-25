import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';
import { api, type MenuItemDto } from '../context/api';

// photos

const MENU_PHOTOS: Record<string, any> = {
  'iced latte':               require('../../assets/iced latte.png'),
  'supernova':                require('../../assets/supernova.png'),
  'roaring frappe':           require('../../assets/roaring frappe.png'),
  'black & white cold brew':  require('../../assets/black and white cold brew.png'),
  'strawberry limeade':       require('../../assets/strawberry limeade.png'),
  'shaken lemonade':          require('../../assets/shaken lemonade.png'),
  'mannino honey crepe':      require('../../assets/mannino crepe.png'),
  'downtowner':               require('../../assets/downtowner.png'),
  'funky monkey':             require('../../assets/funky monkey.png'),
  "le s'mores":               require('../../assets/le smores.png'),
  'strawberry fields':        require('../../assets/strawberry fields.png'),
  'bonjour':                  require('../../assets/bonjour.png'),
  'banana foster':            require('../../assets/bananas foster.png'),
};

//helpers

const SIZE_UPCHARGES: Record<string, number> = { small: 0, medium: 0.75, large: 1.5 };
const CATEGORY_ORDER = ['drinks', 'sweet crepes', 'savory crepes', 'bagels'];

function getSizePrice(item: MenuItemDto, size: string): number {
  if (size === 'small')  return item.smallPrice  ?? item.basePrice;
  if (size === 'medium') return item.mediumPrice ?? item.basePrice + 0.75;
  return item.largePrice ?? item.basePrice + 1.5;
}

// bag 

export interface BagItem {
  id: string;
  name: string;
  size?: string;
  addOns: { label: string; price: number }[];
  toggles: string[];
  qty: number;
  total: number;
}

export let globalBag: BagItem[] = [];
export const bagListeners: (() => void)[] = [];
export function addToBag(item: BagItem) {
  globalBag = [...globalBag, item];
  bagListeners.forEach(l => l());
}

// component 
export default function MenuScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  // modal state
  const [modalItem, setModalItem] = useState<MenuItemDto | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<number[]>([]);
  const [selectedToggleLabels, setSelectedToggleLabels] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    api.menuItems.getAll()
      .then(setMenuItems)
      .finally(() => setLoading(false));
  }, []);

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    items: menuItems.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  const openModal = (item: MenuItemDto) => {
    setModalItem(item);
    setSelectedSize('medium');
    setSelectedAddOnIds([]);
    setSelectedToggleLabels(item.toggles.filter(t => t.defaultOn).map(t => t.label));
    setQty(1);
  };

  const toggleAddOn = (id: number) => {
    setSelectedAddOnIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleToggle = (label: string) => {
    setSelectedToggleLabels(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );
  };

  const calcTotal = () => {
    if (!modalItem) return 0;
    const base = modalItem.hasSizes ? getSizePrice(modalItem, selectedSize) : modalItem.basePrice;
    const addOnTotal = modalItem.addOns
      .filter(a => selectedAddOnIds.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (base + addOnTotal) * qty;
  };

  const handleAddToBag = () => {
    if (!modalItem) return;
    addToBag({
      id: `${modalItem.name}-${Date.now()}`,
      name: modalItem.name,
      size: modalItem.hasSizes ? selectedSize : undefined,
      addOns: modalItem.addOns          // ← store the full add-on objects
        .filter(a => selectedAddOnIds.includes(a.id)),
      toggles: selectedToggleLabels,
      qty,
      total: calcTotal(),
    });
    setModalItem(null);
    setToastMsg(`${modalItem.name} added to bag ✦`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
      backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.accent + '40',
    },
    logoTopBar: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    backBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderWidth: 1, borderColor: palette.accent, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    backBtnText: { color: palette.text,  fontSize: 11, letterSpacing: 0.5, fontFamily: 'Tiempos-Regular', opacity: 0.8 },
    scroll: { paddingTop: 100, paddingBottom: 48 },
    pageHeader: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 24 },
    pageLabel: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
    pageTitle: { color: palette.text, fontSize: 36, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, marginBottom: 4 },
    pageSubtitle: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 1, opacity: 0.6, fontStyle: 'italic' },
    tabBar: { paddingHorizontal: 32, gap: 8, marginBottom: 24 },
    tab: { borderWidth: 1, borderColor: palette.accent + '60', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    tabActive: { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: palette.accent + '22' },
    tabText: { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, letterSpacing: 0.5, opacity: 0.5 },
    tabTextActive: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11, letterSpacing: 0.5 },
    section: { paddingHorizontal: 32 },
    sectionLabel: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, opacity: 0.75 },
    itemRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.accent + '20', gap: 12,
    },
    itemInfo: { flex: 1 },
    itemName: { color: palette.text, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 4 },
    itemDesc: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, lineHeight: 18, opacity: 0.65 },
    itemRight: { alignItems: 'flex-end', fontFamily: 'Tiempos-Regular', gap: 8 },
    itemPrice: { color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    addBtn: {
      borderWidth: 1, borderColor: palette.accent, borderRadius: 20, 
      paddingHorizontal: 12, paddingVertical: 5, backgroundColor: palette.accent + '22',
      flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    addBtnText: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, letterSpacing: 1 },
    footer: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11, letterSpacing: 1.5, textAlign: 'center', opacity: 0.5, marginTop: 40, marginBottom: 8 },
    loadingText: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 2, textAlign: 'center', marginTop: 80 },

    // modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: palette.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderTopWidth: 1, borderColor: palette.accent + '40',
      paddingBottom: 48, maxHeight: '100%',
    },
    handle: { width: 36, height: 3, backgroundColor: palette.accent + '40', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },

    // photo header in modal
    modalPhoto: { width: '100%', height: 200, },
    modalPhotoFallback: { width: '100%', height: 200, backgroundColor: palette.surface },
    modalHeaderRow: {
      flexDirection: 'row', alignItems: 'flex-start',
      paddingHorizontal: 28, paddingTop: 20, paddingBottom: 4, gap: 16,
    },
    modalHeaderText: { flex: 1 },

    modalLabel: { color: palette.accent, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 },
    modalTitle: { color: palette.text, fontSize: 22, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 4 },
    modalDesc: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, opacity: 0.6, letterSpacing: 0.3 },
    modalPrice: { color: palette.accent, fontSize: 18, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, marginTop: 4 },

    modalBody: { paddingHorizontal: 28 },
    divider: { height: 1, backgroundColor: palette.accent + '20', marginVertical: 16 },
    sectionTitle: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 },
    sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    sizeBtn: { flex: 1, borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingVertical: 8, alignItems: 'center' },
    sizeBtnActive: { flex: 1, borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingVertical: 8, alignItems: 'center', backgroundColor: palette.accent + '22' },
    sizeBtnText: { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5, opacity: 0.5 },
    sizeBtnTextActive: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5 },
    sizeUpcharge: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, opacity: 0.5, marginTop: 2 },
    addOnsGrid: { flexDirection: 'row', fontFamily: 'Tiempos-Regular', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    addonChip: { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    addonChipActive: { borderWidth: 1, fontFamily: 'Tiempos-Regular', borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.accent + '22' },
    addonChipText: { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: 0.5 },
    addonChipTextActive: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11 },
    toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    toggleChip: { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    toggleChipActive: { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: palette.accent + '22' },
    toggleChipText: { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: 0.5 },
    toggleChipTextActive: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11 },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { color: palette.accent, fontSize: 18, fontFamily: 'Tiempos-Regular', lineHeight: 22 },
    qtyNum: { color: palette.text, fontSize: 18, fontFamily: 'Tiempos-Regular', minWidth: 20, textAlign: 'center' },
    totalText: { color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    confirmBtn: {
      marginTop: 16, borderWidth: 1, borderColor: palette.accent,
      borderRadius: 24, paddingVertical: 14, alignItems: 'center',
      backgroundColor: palette.accent + '22',
    },
    confirmBtnText: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 13, letterSpacing: 1.5 },
    toast: {
      position: 'absolute', bottom: 48, left: 32, right: 32,
      backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.accent,
      borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
      flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100,
    },
    toastText: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5, flex: 1 },
  });

  const photo = modalItem ? MENU_PHOTOS[modalItem.name.toLowerCase()] : null;

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

        {loading ? (
          <Text style={s.loadingText}>loading menu...</Text>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
              {grouped.map((g, i) => (
                <TouchableOpacity key={g.category} style={i === activeCategory ? s.tabActive : s.tab} onPress={() => setActiveCategory(i)}>
                  <Text style={i === activeCategory ? s.tabTextActive : s.tabText}>{g.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.section}>
              <Text style={s.sectionLabel}>{grouped[activeCategory]?.category}</Text>
              {grouped[activeCategory]?.items.map(item => (
                <View key={item.id} style={s.itemRow}>
                  <View style={s.itemInfo}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemDesc}>{item.description}</Text>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemPrice}>${item.basePrice.toFixed(2)}</Text>
                    <TouchableOpacity style={s.addBtn} onPress={() => openModal(item)}>
                      <Ionicons name="add" size={11} color={palette.accent} />
                      <Text style={s.addBtnText}>add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={s.footer}>new orleans · hammond · new york</Text>
      </ScrollView>

      {/* modal */}
      <Modal visible={!!modalItem} transparent animationType="slide" onRequestClose={() => setModalItem(null)}>
        <Pressable style={s.overlay} onPress={() => setModalItem(null)}>
          <Pressable onPress={() => {}}>
            <View style={s.sheet}>
              <View style={s.handle} />
              <ScrollView showsVerticalScrollIndicator={false}>

                {/* photo */}
                {photo
                  ? <Image source={photo} style={s.modalPhoto} resizeMode="cover" />
                  : <View style={s.modalPhotoFallback} />
                }

                {/* name + price */}
                <View style={s.modalHeaderRow}>
                  <View style={s.modalHeaderText}>
                    <Text style={s.modalLabel}>✦ customise your order</Text>
                    <Text style={s.modalTitle}>{modalItem?.name}</Text>
                    <Text style={s.modalDesc}>{modalItem?.description}</Text>
                    <Text style={s.modalPrice}>
                      ${modalItem ? (modalItem.hasSizes ? getSizePrice(modalItem, selectedSize) : modalItem.basePrice).toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>

                <View style={s.modalBody}>
                  {/* sizes */}
                  {modalItem?.hasSizes && (
                    <>
                      <Text style={s.sectionTitle}>size</Text>
                      <View style={s.sizeRow}>
                        {(['small', 'medium', 'large'] as const).map(sz => (
                          <TouchableOpacity key={sz} style={selectedSize === sz ? s.sizeBtnActive : s.sizeBtn} onPress={() => setSelectedSize(sz)}>
                            <Text style={selectedSize === sz ? s.sizeBtnTextActive : s.sizeBtnText}>{sz}</Text>
                            <Text style={s.sizeUpcharge}>{SIZE_UPCHARGES[sz] === 0 ? 'base' : `+$${SIZE_UPCHARGES[sz].toFixed(2)}`}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={s.divider} />
                    </>
                  )}

                  {/* toggles */}
                  {modalItem?.toggles && modalItem.toggles.length > 0 && (
                    <>
                      <Text style={s.sectionTitle}>preferences</Text>
                      <View style={s.toggleRow}>
                        {modalItem.toggles.map(t => {
                          const active = selectedToggleLabels.includes(t.label);
                          return (
                            <TouchableOpacity key={t.id} style={active ? s.toggleChipActive : s.toggleChip} onPress={() => toggleToggle(t.label)}>
                              <Text style={active ? s.toggleChipTextActive : s.toggleChipText}>{active ? `✓ ${t.label}` : t.label}</Text>
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
                        {modalItem.addOns.map(a => {
                          const active = selectedAddOnIds.includes(a.id);
                          return (
                            <TouchableOpacity key={a.id} style={active ? s.addonChipActive : s.addonChip} onPress={() => toggleAddOn(a.id)}>
                              <Text style={active ? s.addonChipTextActive : s.addonChipText}>
                                {a.label}{a.price > 0 ? ` +$${a.price.toFixed(2)}` : ' free'}
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
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {showToast && (
        <View style={s.toast}>
          <Ionicons name="bag-outline" size={14} color={palette.accent} />
          <Text style={s.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}