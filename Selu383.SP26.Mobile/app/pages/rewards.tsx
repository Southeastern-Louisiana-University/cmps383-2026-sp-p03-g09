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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api, type RewardDto, type OrderDto, type MenuItemDto } from '../context/api';
import { addToBag } from '../(tabs)/menu';


export default function RewardsScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();
  const { user, refresh, setUser } = useAuth();

  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [confirmReward, setConfirmReward] = useState<RewardDto | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [customizeReward, setCustomizeReward] = useState<RewardDto | null>(null);
  const [customizeItem, setCustomizeItem] = useState<MenuItemDto | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<number[]>([]);
  const [selectedToggleLabels, setSelectedToggleLabels] = useState<string[]>([]);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number>(1);

  const LOCATIONS = [
    { id: 1, label: "new orleans", address: "1140 S Carrollton Ave, New Orleans, LA", taxRate: 0.0975 },
    { id: 2, label: "hammond",     address: "110 North Cate Street, Hammond, LA",    taxRate: 0.0975 },
    { id: 3, label: "new york",    address: "72 E 1st St, New York, NY",             taxRate: 0.08875 },
  ];

  const points = user?.loyaltyPoints ?? 0;
  const NEXT_REWARD = (() => {
    const fixed = [50, 100, 150, 175, 200];
    const fromFixed = fixed.find(r => points < r);
    if (fromFixed) return fromFixed;
    // above 200, next multiple of 50
    return Math.ceil((points + 1) / 50) * 50;
  })();
  const toNext = NEXT_REWARD - points;

  useEffect(() => {
    api.rewards.getAll().then(setRewards).catch(() => setRewards([]));
    api.orders.getAll().then(setOrders).catch(() => setOrders([]));
    api.menuItems.getAll().then(setMenuItems).catch(() => setMenuItems([])); 
  }, []);

  // step 1 — tapped redeem on a reward card
const REWARD_ITEM_MAP: Record<string, (items: MenuItemDto[]) => MenuItemDto[]> = {
  'free drip coffee':    items => items.filter(m => m.name.toLowerCase() === 'black & white cold brew'),
  'free iced latte':     items => items.filter(m => m.name.toLowerCase() === 'iced latte'),
  'free roaring frappe': items => items.filter(m => m.name.toLowerCase() === 'roaring frappe'),
  'free bagel':          items => items.filter(m => m.category === 'bagels'),
  'free sweet crepe':    items => items.filter(m => m.category === 'sweet crepes'),
  'free drink of choice':items => items.filter(m => m.category === 'drinks'),
};

const handleRedeemPress = (reward: RewardDto) => {
  if (points < reward.pointCost) return;

  const matches = REWARD_ITEM_MAP[reward.name]?.(menuItems) ?? [];

  if (matches.length === 1) {
    // single item — go straight to customization
    const item = matches[0];
    setCustomizeReward(reward);
    setCustomizeItem(item);
    setSelectedSize('medium');
    setSelectedAddOnIds([]);
    setSelectedToggleLabels(item.toggles.filter(t => t.defaultOn).map(t => t.label));
    setConfirmReward(reward);
  } else {
    // multiple options — show picker first
    setCustomizeReward(reward);
    setChoiceModalVisible(true);
  }
};

// step 1b — for 250pt tier, user picks a drink
const handleChooseItem = (item: MenuItemDto) => {
  setChoiceModalVisible(false);
  setCustomizeItem(item);
  setSelectedSize('medium');
  setSelectedAddOnIds([]);
  setSelectedToggleLabels(item.toggles.filter(t => t.defaultOn).map(t => t.label));
  setConfirmReward(customizeReward);
};

// step 2 — confirmed customization, redeem + add to bag
const redeem = async () => {
  if (!confirmReward || !customizeItem) return;
  try {
    await api.rewards.redeem(confirmReward.id);

    const pickupTime = new Date(Date.now() + 15 * 60000).toISOString();
    await api.orders.create({
      locationId: selectedLocation,
      orderType: 'carry_out',
      pickupTime,
      paymentMethod: 'reward',
      items: [{
        menuItemId: customizeItem.id,
        size: customizeItem.hasSizes ? selectedSize : undefined,
        quantity: 1,
        selectedAddOnIds,
        selectedToggleLabels,
      }],
    });
    const updatedUser = await api.rewards.redeem(confirmReward.id);
    setUser(updatedUser);
    setConfirmReward(null);
    setCustomizeItem(null);
    setCustomizeReward(null);
    router.push('/(tabs)/profile');
  } catch (e) {
    const err = e as any;
    console.log('[redeem] error →', err?.message ?? err);
    setConfirmReward(null);
    setToastMsg('redemption failed, try again ☕');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }
};

  const nextRewardCost = rewards.find(r => points < r.pointCost)?.pointCost ?? rewards[rewards.length - 1]?.pointCost ?? 250;

  const progressPct = rewards.length === 0 ? 0 : Math.min(points / (rewards[rewards.length - 1]?.pointCost ?? 250), 1);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },

    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent + '40',
    },
    logoTopBar: {
      color: palette.accent,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    backBtnText: {
      color: palette.text,
      fontSize: 11,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      opacity: 0.8,
    },

    scroll: { paddingTop: 100, paddingBottom: 48 },

    pageHeader: {
      paddingHorizontal: 32,
      paddingTop: 32,
      paddingBottom: 28,
    },
    pageLabel: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    pageTitle: {
      color: palette.text,
      fontSize: 36,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    pageSubtitle: {
      color: palette.accent,
      fontSize: 12,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.6,
      fontStyle: 'italic',
    },

    pointsCard: {
      marginHorizontal: 32,
      marginBottom: 32,
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.accent,
      padding: 24,
    },
    pointsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    pointsNumber: {
      color: palette.text,
      fontSize: 52,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: -1,
      lineHeight: 56,
    },
    pointsUnit: {
      color: palette.accent,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.7,
      marginBottom: 8,
    },
    progressLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabelText: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.6,
    },
    progressTrack: {
      height: 4,
      backgroundColor: palette.accent + '22',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: 4,
      backgroundColor: palette.accent,
      borderRadius: 2,
      width: `${Math.round(progressPct * 100)}%` as any,
    },
    progressNote: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.5,
      marginTop: 8,
      fontStyle: 'italic',
    },

    sectionLabel: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 3,
      textTransform: 'uppercase',
      opacity: 0.75,
      marginBottom: 12,
      paddingHorizontal: 32,
    },

    rewardsGrid: {
      paddingHorizontal: 32,
      gap: 12,
      marginBottom: 36,
    },
    rewardCard: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.accent + '40',
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    rewardCardLocked: {
      opacity: 0.4,
    },
    rewardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.accent + '60',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rewardInfo: { flex: 1 },
    rewardName: {
      color: palette.text,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.3,
      marginBottom: 3,
    },
    rewardDesc: {
      color: palette.accent,
      fontSize: 11,
      fontFamily: 'Tiempos-Regular',
      opacity: 0.6,
      letterSpacing: 0.3,
    },
    rewardRight: { alignItems: 'flex-end', gap: 6 },
    rewardCost: {
      color: palette.accent,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
    },
    redeemBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      backgroundColor: palette.accent + '22',
    },
    redeemBtnLocked: {
      borderWidth: 1,
      borderColor: palette.accent + '30',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    redeemBtnText: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
    },
    redeemBtnTextLocked: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
      opacity: 0.3,
    },

    historySection: {
      paddingHorizontal: 32,
      marginBottom: 20,
    },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent + '20',
    },
    historyLabel: {
      color: palette.text,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.2,
      flex: 1,
    },
    historyDate: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.5,
      marginRight: 16,
    },
    historyPoints: {
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
    },

    footer: {
      color: palette.accent,
      fontSize: 11,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
      textAlign: 'center',
      opacity: 0.5,
      marginTop: 32,
    },

    // modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: palette.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderColor: palette.accent + '40',
      padding: 32,
      paddingBottom: 48,
    },
    modalHandle: {
      width: 36,
      height: 3,
      backgroundColor: palette.accent + '40',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 24,
    },
    modalLabel: {
      color: palette.accent,
      fontSize: 10,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 3,
      textTransform: 'uppercase',
      opacity: 0.75,
      marginBottom: 8,
    },
    modalTitle: {
      color: palette.text,
      fontSize: 24,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    modalDesc: {
      color: palette.accent,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      opacity: 0.65,
      letterSpacing: 0.5,
      marginBottom: 28,
    },
    modalCostRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 28,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: palette.accent + '20',
    },
    modalCostLabel: {
      color: palette.accent,
      fontSize: 12,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1,
      opacity: 0.6,
    },
    modalCostValue: {
      color: palette.text,
      fontSize: 13,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
    },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalConfirmBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: palette.accent + '22',
    },
    modalConfirmText: {
      color: palette.accent,
      fontSize: 12,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
    },
    modalCancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.accent + '40',
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalCancelText: {
      color: palette.text,
      fontSize: 12,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 1.5,
      opacity: 0.5,
    },

    // toast
    toast: {
      position: 'absolute',
      bottom: 48,
      left: 32,
      right: 32,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      zIndex: 100,
    },
    toastText: {
      color: palette.accent,
      fontSize: 12,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.bg}
      />

      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
          <Text style={styles.backBtnText}>back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>✦ lion&apos;s rewards</Text>
          <Text style={styles.pageTitle}>your points.</Text>
          <Text style={styles.pageSubtitle}>sip now, slay later 💅</Text>
        </View>

        {/* points card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.pointsUnit}>points available</Text>
            </View>
          </View>
          <View style={styles.progressLabel}>
            <Text style={styles.progressNote}>{toNext} pts until your next reward ☕</Text>
            <Text style={styles.progressLabelText}>{points % 250} / {NEXT_REWARD}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressNote}>{toNext} pts until your next free drink ☕</Text>
        </View>

        {/* rewards */}
        <Text style={styles.sectionLabel}>✦ redeem your points</Text>
        <View style={styles.rewardsGrid}>
          {rewards.map(reward => {
            const canRedeem = points >= reward.pointCost;
            return (
              <View key={reward.id} style={[styles.rewardCard, !canRedeem && styles.rewardCardLocked]}>
                <View style={styles.rewardIcon}>
                  <Ionicons name="gift-outline" size={18} color={palette.accent} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                </View>
                <View style={styles.rewardRight}>
                  <Text style={styles.rewardCost}>{reward.pointCost} pts</Text>
                  <TouchableOpacity
                    style={canRedeem ? styles.redeemBtn : styles.redeemBtnLocked}
                    onPress={() => handleRedeemPress(reward)}
                    disabled={!canRedeem}
                  >
                    <Text style={canRedeem ? styles.redeemBtnText : styles.redeemBtnTextLocked}>
                      {canRedeem ? 'redeem' : 'locked'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* history */}
        <View style={styles.historySection}>
          {orders.slice(0, 5).map((order, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyLabel}>
                {order.items[0]?.menuItemName ?? 'order'}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={[styles.historyPoints, { color: palette.accent }]}>
                +{order.pointsEarned}
              </Text>
            </View>
          ))}
          {orders.length === 0 && (
            <Text style={{ color: palette.text, opacity: 0.4, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1, paddingVertical: 16 }}>
              no activity yet ☕
            </Text>
          )}
        </View>

        <Text style={styles.footer}>new orleans · hammond · new york</Text>

      </ScrollView>

      {/* confirm modal */}
      <Modal visible={!!confirmReward} transparent animationType="slide" onRequestClose={() => setConfirmReward(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmReward(null)}>
          <Pressable onPress={() => {}}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalLabel}>✦ customise your reward</Text>
              <Text style={styles.modalTitle}>{customizeItem?.name ?? '—'}</Text>
              <Text style={styles.modalDesc}>{customizeItem?.description}</Text>

              {customizeItem?.hasSizes && (
                <>
                  <Text style={[styles.modalCostLabel, { marginBottom: 8 }]}>size</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    {(['small', 'medium', 'large'] as const).map(sz => (
                      <TouchableOpacity
                        key={sz}
                        onPress={() => setSelectedSize(sz)}
                        style={{
                          flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center',
                          borderColor: selectedSize === sz ? palette.accent : palette.accent + '40',
                          backgroundColor: selectedSize === sz ? palette.accent + '22' : 'transparent',
                        }}
                      >
                        <Text style={{ color: selectedSize === sz ? palette.accent : palette.text, fontFamily: 'Tiempos-Regular', fontSize: 12, opacity: selectedSize === sz ? 1 : 0.5 }}>{sz}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {customizeItem?.toggles && customizeItem.toggles.length > 0 && (
                <>
                  <Text style={[styles.modalCostLabel, { marginBottom: 8 }]}>preferences</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {customizeItem.toggles.map(t => {
                      const active = selectedToggleLabels.includes(t.label);
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setSelectedToggleLabels(prev => active ? prev.filter(x => x !== t.label) : [...prev, t.label])}
                          style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderColor: active ? palette.accent : palette.accent + '50', backgroundColor: active ? palette.accent + '22' : 'transparent' }}
                        >
                          <Text style={{ color: active ? palette.accent : palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: active ? 1 : 0.5 }}>
                            {active ? `✓ ${t.label}` : t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {customizeItem?.addOns && customizeItem.addOns.length > 0 && (
                <>
                  <Text style={[styles.modalCostLabel, { marginBottom: 8 }]}>add-ons</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {customizeItem.addOns.map(a => {
                      const active = selectedAddOnIds.includes(a.id);
                      return (
                        <TouchableOpacity
                          key={a.id}
                          onPress={() => setSelectedAddOnIds(prev => active ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                          style={{ borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderColor: active ? palette.accent : palette.accent + '50', backgroundColor: active ? palette.accent + '22' : 'transparent' }}
                        >
                          <Text style={{ color: active ? palette.accent : palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: active ? 1 : 0.5 }}>
                            {a.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
              <Text style={[styles.modalCostLabel, { marginBottom: 8, marginTop: 8 }]}>location</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  {LOCATIONS.map(loc => (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => setSelectedLocation(loc.id)}
                      style={{
                        flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center',
                        borderColor: selectedLocation === loc.id ? palette.accent : palette.accent + '40',
                        backgroundColor: selectedLocation === loc.id ? palette.accent + '22' : 'transparent',
                      }}
                    >
                      <Text style={{ color: selectedLocation === loc.id ? palette.accent : palette.text, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: selectedLocation === loc.id ? 1 : 0.5 }}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              <View style={styles.modalCostRow}>
                <Text style={styles.modalCostLabel}>cost</Text>
                <Text style={styles.modalCostValue}>{confirmReward?.pointCost} pts → free ✦</Text>
              </View>
              <View style={styles.modalCostRow}>
                <Text style={styles.modalCostLabel}>points after</Text>
                <Text style={styles.modalCostValue}>
                  {confirmReward ? points - confirmReward.pointCost : points} pts remaining
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmReward(null)}>
                  <Text style={styles.modalCancelText}>cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={redeem}>
                  <Text style={styles.modalConfirmText}>place order ✦</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={choiceModalVisible} transparent animationType="slide" onRequestClose={() => setChoiceModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setChoiceModalVisible(false)}>
          <Pressable onPress={() => {}}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalLabel}>✦ pick your drink</Text>
              <Text style={styles.modalTitle}>{customizeReward?.name.replace('free ', '')} of your choice</Text>
              <ScrollView style={{ maxHeight: 320, marginTop: 16 }} showsVerticalScrollIndicator={false}>
                {(customizeReward ? REWARD_ITEM_MAP[customizeReward.name]?.(menuItems) ?? [] : []).map((item: MenuItemDto) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleChooseItem(item)}
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.accent + '20' }}
                  >
                    <Text style={{ color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 15, letterSpacing: 0.3 }}>{item.name}</Text>
                    <Text style={{ color: palette.accent, fontFamily: 'Tiempos-Regular', fontSize: 11, opacity: 0.6, marginTop: 2 }}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* toast */}
      {showToast && (
        <View style={styles.toast}>
          <Ionicons name="paw-outline" size={14} color={palette.accent} />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

    </View>
  );
}