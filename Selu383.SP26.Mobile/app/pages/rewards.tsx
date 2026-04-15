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

const REWARDS = [
  {
    name: 'drippy coffee',
    id: 'free_drip',
    label: 'free drip coffee',
    desc: 'any drip coffee, on us',
    cost: 50,
    icon: 'cafe-outline',
  },
  {
    name: 'iced out latte',
    id: 'free_latte',
    label: 'free iced latte',
    desc: 'any iced latte, your way',
    cost: 100,
    icon: 'water-outline',
  },
  {
    name: 'roaring frappe',
    id: 'free_frappe',
    label: 'free roaring frappe',
    desc: 'our signature blended drink',
    cost: 150,
    icon: 'snow-outline',
  },
  {
    name: 'lioness crepe',
    id: 'free_crepe',
    label: 'free sweet crepe',
    desc: 'any sweet crepe of your choice',
    cost: 200,
    icon: 'restaurant-outline',
  },
  {
    name: 'bagel bliss',
    id: 'free_bagel',
    label: 'free bagel',
    desc: 'any bagel from the menu',
    cost: 175,
    icon: 'ellipse-outline',
  },
  {
    name: 'queen\'s treat',
    id: 'free_drink',
    label: 'free drink of your choice',
    desc: 'anything on the drinks menu',
    cost: 250,
    icon: 'star-outline',
  },
];

const HISTORY = [
  { label: 'iced latte purchase', points: '+10', date: 'apr 10' },
  { label: 'roaring frappe purchase', points: '+10', date: 'apr 8' },
  { label: 'free drip coffee redeemed', points: '-50', date: 'apr 5' },
  { label: 'downtowner crepe purchase', points: '+10', date: 'apr 3' },
  { label: 'double points day bonus', points: '+20', date: 'apr 1' },
];

export default function RewardsScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  const [points, setPoints] = useState(220);
  const [history, setHistory] = useState(HISTORY);
  const [confirmReward, setConfirmReward] = useState<typeof REWARDS[0] | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showConfirm = (reward: typeof REWARDS[0]) => {
    if (points >= reward.cost) setConfirmReward(reward);
  };

  const redeem = () => {
    if (!confirmReward) return;
    setPoints(p => p - confirmReward.cost);
    setHistory(h => [
      { label: `${confirmReward.label} redeemed`, points: `-${confirmReward.cost}`, date: 'today' },
      ...h,
    ]);
    setConfirmReward(null);
    setToastMsg(`${confirmReward.label} redeemed! ʕ•́ᴥ•̀ʔっ`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const progressPct = Math.min((points % 250) / 250, 1);
  const nextMilestone = 250;
  const toNext = nextMilestone - (points % 250);

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
      letterSpacing: 1,
      opacity: 0.5,
      marginTop: 8,
      fontStyle: 'italic',
    },

    sectionLabel: {
      color: palette.accent,
      fontSize: 10,
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
      letterSpacing: 1.5,
    },
    redeemBtnTextLocked: {
      color: palette.accent,
      fontSize: 10,
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
            <Text style={styles.progressLabelText}>progress to next reward</Text>
            <Text style={styles.progressLabelText}>{points % 250} / {nextMilestone}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressNote}>{toNext} pts until your next free drink ☕</Text>
        </View>

        {/* rewards */}
        <Text style={styles.sectionLabel}>✦ redeem your points</Text>
        <View style={styles.rewardsGrid}>
          {REWARDS.map(reward => {
            const canRedeem = points >= reward.cost;
            return (
              <View
                key={reward.id}
                style={[styles.rewardCard, !canRedeem && styles.rewardCardLocked]}
              >
                <View style={styles.rewardIcon}>
                  <Ionicons name={reward.icon as any} size={18} color={palette.accent} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDesc}>{reward.desc}</Text>
                </View>
                <View style={styles.rewardRight}>
                  <Text style={styles.rewardCost}>{reward.cost} pts</Text>
                  <TouchableOpacity
                    style={canRedeem ? styles.redeemBtn : styles.redeemBtnLocked}
                    onPress={() => showConfirm(reward)}
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
        <Text style={styles.sectionLabel}>✦ recent point activity</Text>
        <View style={styles.historySection}>
          {history.slice(0, 5).map((item, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyLabel}>{item.label}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={[
                styles.historyPoints,
                { color: item.points.startsWith('+') ? palette.accent : palette.text + 'aa' },
              ]}>
                {item.points}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>new orleans · hammond · new york</Text>

      </ScrollView>

      {/* confirm modal */}
      <Modal
        visible={!!confirmReward}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmReward(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmReward(null)}>
          <Pressable onPress={() => {}}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalLabel}>✦ confirm redemption</Text>
              <Text style={styles.modalTitle}>{confirmReward?.name}</Text>
              <Text style={styles.modalDesc}>{confirmReward?.desc}</Text>
              <View style={styles.modalCostRow}>
                <Text style={styles.modalCostLabel}>points to redeem</Text>
                <Text style={styles.modalCostValue}>{confirmReward?.cost} pts</Text>
              </View>
              <View style={styles.modalCostRow}>
                <Text style={styles.modalCostLabel}>remaining after</Text>
                <Text style={styles.modalCostValue}>
                  {confirmReward ? points - confirmReward.cost : 0} pts
                </Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmReward(null)}>
                  <Text style={styles.modalCancelText}>cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={redeem}>
                  <Text style={styles.modalConfirmText}>confirm ✦</Text>
                </TouchableOpacity>
              </View>
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