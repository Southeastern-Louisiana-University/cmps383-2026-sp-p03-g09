import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api, type MenuItemDto } from '../context/api';
import { addToBag } from './menu';
import { menuPhotos } from '@/app/context/menuPhotos';

const FEATURED_CARD_WIDTH = 200;

//  shared photo map (mirrors menu.tsx) 

function getMenuPhoto(name: string) {
  const map: Record<string, any> = {
    'iced latte':              menuPhotos.icedLatte,
    'supernova':               menuPhotos.supernova,
    'roaring frappe':          menuPhotos.roaringFrappe,
    'black & white cold brew': menuPhotos.blackWhiteColdBrew,
    'strawberry limeade':      menuPhotos.strawberryLimeade,
    'shaken lemonade':         menuPhotos.shakenLemonade,
    'mannino honey crepe':     menuPhotos.manninoCrepe,
    'downtowner':              menuPhotos.downtowner,
    'funky monkey':            menuPhotos.funkyMonkey,
    "le s'mores":              menuPhotos.leSmores,
    'strawberry fields':       menuPhotos.strawberryFields,
    'bonjour':                 menuPhotos.bonjour,
    'banana foster':           menuPhotos.bananasFoster,
    "matt's scrambled eggs":   menuPhotos.mattsScrambledEggs,
    'meanie mushroom':         menuPhotos.meanieMushroom,
    'turkey club':             menuPhotos.turkeyClub,
    'green machine':           menuPhotos.greenMachine,
    'perfect pair':            menuPhotos.perfectPair,
    'crepe fromage':           menuPhotos.crepeFromage,
    'farmers market crepe':    menuPhotos.farmersMarketCrepe,
    'travis special':          menuPhotos.travisSpecial,
    'creme brulagel':          menuPhotos.cremeBrulagel,
    'the fancy one':           menuPhotos.theFancyOne,
    'breakfast bagel':         menuPhotos.breakfastBagel,
    'the classic':             menuPhotos.theClassic,
  };
  return map[name.toLowerCase()] ?? null;
}

function getSizePrice(item: MenuItemDto, size: string): number {
  if (size === 'small')  return item.smallPrice  ?? item.basePrice;
  if (size === 'medium') return item.mediumPrice ?? item.basePrice + 0.75;
  return item.largePrice ?? item.basePrice + 1.5;
}

const SIZE_UPCHARGES: Record<string, number> = { small: 0, medium: 0.75, large: 1.5 };

//  sayings 

const SAYINGS = [
  'your daily ritual, elevated. ✦',
  'brewed with love & a little chaos ♡',
  'sip something that gets you ( ´ ▽ ` )',
  'fuel for dreamers & deadline-chasers ʕ•́ᴥ•̀ʔっ',
  'stay paw-sitive, stay caffeinated 🐾',
  "you're not you, without your brew ☕",
  'sip now, slay later 💅',
];

//  featured card 

function FeaturedCard({
  item,
  onPress,
  palette,
}: {
  item: MenuItemDto;
  onPress: () => void;
  palette: any;
}) {
  const photo = getMenuPhoto(item.name);
  const price = item.hasSizes
    ? `from $${(item.smallPrice ?? item.basePrice).toFixed(2)}`
    : `$${item.basePrice.toFixed(2)}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        width: FEATURED_CARD_WIDTH,
        marginLeft: 32,
        backgroundColor: palette.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.accent + '60',
        overflow: 'hidden',
      }}
    >
      {photo ? (
        <Image source={photo} style={{ width: '100%', height: 140 }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 140, backgroundColor: palette.accent + '12', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="cafe-outline" size={32} color={palette.accent} opacity={0.3} />
        </View>
      )}

      <View style={{ padding: 14, gap: 4 }}>
        <Text style={{ color: palette.accent, fontSize: 9, fontFamily: 'Tiempos-Regular', letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.6 }}>
          {item.category}
        </Text>
        <Text style={{ color: palette.text, fontSize: 15, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3 }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ color: palette.accent, fontSize: 12, fontFamily: 'Tiempos-Regular', opacity: 0.6, lineHeight: 17 }} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 }}>
            {price}
          </Text>
          <View style={{ borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: palette.accent + '18', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="add" size={10} color={palette.accent} />
            <Text style={{ color: palette.accent, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 1 }}>add</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

//  main screen 

export default function HomeScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();
  const { user } = useAuth();

  // sayings
  const [sayingIndex, setSayingIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // featured items
  const [featured, setFeatured]             = useState<MenuItemDto[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // modal state (mirrors menu.tsx)
  const [modalItem, setModalItem]                       = useState<MenuItemDto | null>(null);
  const [selectedSize, setSelectedSize]                 = useState<string>('medium');
  const [selectedAddOnIds, setSelectedAddOnIds]         = useState<number[]>([]);
  const [selectedToggleLabels, setSelectedToggleLabels] = useState<string[]>([]);
  const [qty, setQty]                                   = useState(1);
  const [showToast, setShowToast]                       = useState(false);
  const [toastMsg, setToastMsg]                         = useState('');

  // fetch featured from API
  useEffect(() => {
    api.menuItems.getFeatured()
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, []);

  // rotating sayings
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setSayingIndex(i => (i + 1) % SAYINGS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 90, useNativeDriver: true }).start();
      });
    }, 9000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  // modal helpers
  const openModal = (item: MenuItemDto) => {
    setModalItem(item);
    setSelectedSize('medium');
    setSelectedAddOnIds([]);
    setSelectedToggleLabels(item.toggles.filter(t => t.defaultOn).map(t => t.label));
    setQty(1);
  };

  const toggleAddOn = (id: number) =>
    setSelectedAddOnIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleToggle = (label: string) =>
    setSelectedToggleLabels(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);

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
      menuItemId: modalItem.id,
      name: modalItem.name,
      size: modalItem.hasSizes ? selectedSize : undefined,
      addOns: modalItem.addOns.filter(a => selectedAddOnIds.includes(a.id)),
      toggles: selectedToggleLabels,
      qty,
      total: calcTotal(),
    });
    setModalItem(null);
    setToastMsg(`${modalItem.name} added to bag ✦`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const photo = modalItem ? getMenuPhoto(modalItem.name) : null;
  const s = createStyles(palette);

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={s.topBar}>
        <Text style={s.logoTopBar}>caffeinated lions</Text>
        <View style={s.topBarRight}>
          <TouchableOpacity style={s.topBtn} onPress={() => router.push('/pages/stores')}>
            <Ionicons name="location-outline" size={12} color={palette.text} />
            <Text style={s.topBtnText}>stores</Text>
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity style={s.topBtn} onPress={() => router.push('./profile')}>
              <Ionicons name="person-outline" size={12} color={palette.accent} />
              <Text style={s.topBtnText}>profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.topBtn} onPress={() => router.push('/pages/login')}>
              <Ionicons name="paw-outline" size={12} color={palette.accent} />
              <Text style={s.topBtnText}>sign in</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Animated.Text style={[s.saying, { opacity: fadeAnim }]}>
          {SAYINGS[sayingIndex]}
        </Animated.Text>

        <Text style={s.headline}>
          {'three locations.\nsix drinks.\nunlimited ways to '}
          <Text style={{ color: palette.accent }}>smile.</Text>
        </Text>

        <Text style={s.subline}>come say hi today</Text>
        <Text style={s.kaomoji}>( @^u^ )</Text>

        {/*  featured section  */}
        <Text style={s.drinkLabel}>✦ featured right now</Text>

        {featuredLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : featured.length === 0 ? (
          <Text style={s.emptyText}>nothing featured right now — check back soon ☕</Text>
        ) : (
          <FlatList
            data={featured}
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
            contentContainerStyle={{ paddingRight: 32 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <FeaturedCard item={item} onPress={() => openModal(item)} palette={palette} />
            )}
          />
        )}

        {/* see all → */}
        <TouchableOpacity style={s.seeAllBtn} onPress={() => router.push('/(tabs)/menu')}>
          <Text style={s.seeAllText}>see all →</Text>
        </TouchableOpacity>

        <Text style={s.locations}>new orleans · hammond · new york</Text>

      </ScrollView>

      {/*  modal (mirrors menu.tsx exactly)  */}
      <Modal visible={!!modalItem} transparent animationType="slide" onRequestClose={() => setModalItem(null)}>
        <Pressable style={s.overlay} onPress={() => setModalItem(null)}>
          <Pressable onPress={() => {}}>
            <View style={s.sheet}>
              <View style={s.handle} />
              <ScrollView showsVerticalScrollIndicator={false}>

                {photo
                  ? <Image source={photo} style={s.modalPhoto} resizeMode="cover" />
                  : <View style={s.modalPhotoFallback} />
                }

                <View style={s.modalHeaderRow}>
                  <View style={s.modalHeaderText}>
                    <Text style={s.modalLabel}>✦ customise your order</Text>
                    <Text style={s.modalTitle}>{modalItem?.name}</Text>
                    <Text style={s.modalDesc}>{modalItem?.description}</Text>
                    <Text style={s.modalPrice}>
                      ${modalItem
                        ? (modalItem.hasSizes ? getSizePrice(modalItem, selectedSize) : modalItem.basePrice).toFixed(2)
                        : '0.00'}
                    </Text>
                  </View>
                </View>

                <View style={s.modalBody}>
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

                  {modalItem?.toggles && modalItem.toggles.length > 0 && (
                    <>
                      <Text style={s.sectionTitle}>preferences</Text>
                      <View style={s.toggleRow}>
                        {modalItem.toggles.map(t => {
                          const active = selectedToggleLabels.includes(t.label);
                          return (
                            <TouchableOpacity key={t.id} style={active ? s.toggleChipActive : s.toggleChip} onPress={() => toggleToggle(t.label)}>
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

// styles 

const createStyles = (palette: any) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: palette.bg },
  scroll:       { paddingTop: 80, paddingBottom: 48 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
    backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.accent + '40',
  },
  logoTopBar:  { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  topBtnText:  { color: palette.text, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.8 },

  saying:    { color: palette.accent, fontSize: 13, letterSpacing: 1, marginTop: 25, marginHorizontal: 32, marginBottom: 40, fontStyle: 'italic', opacity: 0.75 },
  headline:  { color: palette.text, fontSize: 42, fontFamily: 'Tiempos-Regular', lineHeight: 50, marginBottom: 20, letterSpacing: 0.5, marginHorizontal: 32 },
  subline:   { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 2, marginBottom: 4, opacity: 0.75, marginHorizontal: 32 },
  kaomoji:   { color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 1, marginBottom: 40, marginHorizontal: 32 },
  drinkLabel:{ color: palette.accent, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, marginHorizontal: 32 },

  emptyText: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', opacity: 0.4, marginHorizontal: 32, marginBottom: 16 },
  seeAllBtn: { alignSelf: 'flex-end', marginRight: 32, marginTop: 4, marginBottom: 44 },
  seeAllText:{ color: palette.accent, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.7 },
  locations: { color: palette.accent, fontSize: 11, letterSpacing: 1.5, textAlign: 'center', lineHeight: 20, fontFamily: 'Tiempos-Regular', marginHorizontal: 32 },

  // modal
  overlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:             { backgroundColor: palette.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: palette.accent + '40', paddingBottom: 48, maxHeight: '100%' },
  handle:            { width: 36, height: 3, backgroundColor: palette.accent + '40', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalPhoto:        { width: '100%', height: 200 },
  modalPhotoFallback:{ width: '100%', height: 200, backgroundColor: palette.surface },
  modalHeaderRow:    { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 28, paddingTop: 20, paddingBottom: 4, gap: 16 },
  modalHeaderText:   { flex: 1 },
  modalLabel:        { color: palette.accent, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 },
  modalTitle:        { color: palette.text, fontSize: 22, fontFamily: 'Tiempos-Regular', letterSpacing: 0.3, marginBottom: 4 },
  modalDesc:         { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, opacity: 0.6, letterSpacing: 0.3 },
  modalPrice:        { color: palette.accent, fontSize: 18, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, marginTop: 4 },
  modalBody:         { paddingHorizontal: 28 },
  divider:           { height: 1, backgroundColor: palette.accent + '20', marginVertical: 16 },
  sectionTitle:      { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 },
  sizeRow:           { flexDirection: 'row', gap: 10, marginBottom: 4 },
  sizeBtn:           { flex: 1, borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingVertical: 8, alignItems: 'center' },
  sizeBtnActive:     { flex: 1, borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingVertical: 8, alignItems: 'center', backgroundColor: palette.accent + '22' },
  sizeBtnText:       { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5, opacity: 0.5 },
  sizeBtnTextActive: { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5 },
  sizeUpcharge:      { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 10, opacity: 0.5, marginTop: 2 },
  addOnsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  addonChip:         { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  addonChipActive:   { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette.accent + '22' },
  addonChipText:     { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: 0.5 },
  addonChipTextActive:{ color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11 },
  toggleRow:         { flexDirection: 'row', gap: 10, marginBottom: 4 },
  toggleChip:        { borderWidth: 1, borderColor: palette.accent + '50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  toggleChipActive:  { borderWidth: 1, borderColor: palette.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: palette.accent + '22' },
  toggleChipText:    { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: 0.5 },
  toggleChipTextActive:{ color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11 },
  bottomRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  qtyRow:            { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn:            { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:        { color: palette.accent, fontSize: 18, fontFamily: 'Tiempos-Regular', lineHeight: 22 },
  qtyNum:            { color: palette.text, fontSize: 18, fontFamily: 'Tiempos-Regular', minWidth: 20, textAlign: 'center' },
  totalText:         { color: palette.accent, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
  confirmBtn:        { marginTop: 16, borderWidth: 1, borderColor: palette.accent, borderRadius: 24, paddingVertical: 14, alignItems: 'center', backgroundColor: palette.accent + '22' },
  confirmBtnText:    { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 13, letterSpacing: 1.5 },
  toast:             { position: 'absolute', bottom: 48, left: 32, right: 32, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100 },
  toastText:         { color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 12, letterSpacing: 0.5, flex: 1 },
});