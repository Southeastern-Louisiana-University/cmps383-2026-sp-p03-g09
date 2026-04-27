import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { api, type OrderDto } from '../context/api';

    
const rewardsIncrements = [50, 100, 150, 175, 200, 250];

function SectionLabel({ text, palette }: { text: string; palette: any }) {
  return (
    <Text style={{ color: palette.accent, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, marginTop: 36 }}>
      ✦ {text}
    </Text>
  );
}

export default function ProfileScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    if (!user) return;
    api.orders.getAll().then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  const points = user?.loyaltyPoints ?? 0;
  const NEXT_REWARD = rewardsIncrements.find(r => points < r) ?? 0; 
  const progressPct = Math.min(points / NEXT_REWARD, 1);

  const userName = user?.userName ?? '';
  const handle = `@${userName.toLowerCase().replace(/\s/g, '')}`;
  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const drinksOrdered = orders.length;
const pointsEarned = orders.reduce((sum: number, o: OrderDto) => sum + o.pointsEarned, 0);

  const STATS = [
    { label: 'drinks ordered', value: String(drinksOrdered), icon: 'cafe-outline' },
    { label: 'points earned', value: String(pointsEarned), icon: 'gift-outline' },
  ];

  useEffect(() => {
    if (!user) return;
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
    Animated.spring(streakAnim, {
      toValue: 1,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [user]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    scroll: { paddingHorizontal: 32, paddingTop: 80, paddingBottom: 60 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 32, paddingTop: 52, paddingBottom: 12,
      backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.accent + '40',
    },
    logoTopBar: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    topBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderWidth: 1, borderColor: palette.accent, borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    topBtnText: { color: palette.text,  fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, opacity: 0.8 },
    iconBtn: {
      width: 32, height: 32, borderRadius: 16, borderWidth: 1,
      borderColor: palette.accent, alignItems: 'center', justifyContent: 'center',
    },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 28, marginBottom: 4 },
    avatarWrap: { width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: palette.accent, overflow: 'hidden' },
    avatarFallback: { width: '100%', height: '100%', backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
    nameBlock: { flex: 1 },
    userName: { color: palette.text, fontSize: 28, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    userHandle: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1, marginTop: 2 },
    memberSince: { color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, opacity: 0.9, marginTop: 3 },
    streakCard: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1,
      borderColor: palette.accent + '55', padding: 16, marginTop: 20,
    },
    streakNum: { color: palette.text, fontSize: 32, fontFamily: 'Tiempos-Regular' },
    streakLabel: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    streakSub: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', opacity: 0.65, marginTop: 2, letterSpacing: 0.5 },
    pointsRow: { flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'Tiempos-Regular', alignItems: 'flex-end', marginBottom: 8 },
    pointsNum: { color: palette.text, fontSize: 36, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    pointsLabel: { color: palette.text, fontSize: 11, letterSpacing: 1.5, fontFamily: 'Tiempos-Regular', opacity: 0.7, marginBottom: 6 },
    pointsNextBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1,
      borderColor: palette.accent + '55', borderRadius: 20, paddingHorizontal: 10,
      paddingVertical: 4, marginBottom: 6, backgroundColor: palette.accent + '10',
    },
    pointsNextText: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 1, opacity: 0.75 },
    progressTrack: { height: 4, backgroundColor: palette.accent + '30', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: palette.accent, borderRadius: 2 },
    progressHint: { color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 1, opacity: 0.5, marginTop: 6, fontStyle: 'italic' },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1, backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1,
      borderColor: palette.accent + '40', padding: 14, alignItems: 'center', gap: 6,
    },
    statValue: { color: palette.text, fontSize: 22, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    statLabel: { color: palette.text, fontSize: 9, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5, opacity: 0.65, textAlign: 'center', textTransform: 'uppercase' },
    orderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: palette.text + '22' },
    orderEmoji: { fontSize: 22, fontFamily: 'Tiempos-Regular' },
    orderName: { color: palette.text, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5 },
    orderMeta: { color: palette.text, fontSize: 10, fontFamily: 'Tiempos-Regular', letterSpacing: 1, opacity: 0.6, marginTop: 2 },
    orderPoints: { color: palette.text, fontSize: 11, fontFamily: 'Tiempos-Regular', letterSpacing: 1, opacity: 0.75 },
    signOutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tiempos-Regular', gap: 8,
      marginTop: 44, paddingVertical: 14, borderWidth: 1,
      borderColor: palette.text + '55', borderRadius: 28,
    },
    signOutText: { color: palette.text, fontSize: 12,  fontFamily: 'Tiempos-Regular',letterSpacing: 1.5, opacity: 0.7 },
    kaomoji: { color: palette.text, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1, opacity: 0.5, textAlign: 'center', marginTop: 16 },

    // auth gate overlay
    overlayWrap: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: 'center', justifyContent: 'center' },
    overlayBlur: { ...StyleSheet.absoluteFillObject },
    overlayCard: {
      backgroundColor: palette.surface,
      borderRadius: 24, borderWidth: 1, borderColor: palette.accent + '55',
      padding: 32, alignItems: 'center', gap: 12, marginHorizontal: 32,
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
    },
    overlayTitle: { color: palette.text, fontSize: 22, fontFamily: 'Tiempos-Regular', letterSpacing: 0.5, textAlign: 'center' },
    overlaySub: { color: palette.text, fontFamily: 'Tiempos-Regular', fontSize: 12, opacity: 0.6, letterSpacing: 1, textAlign: 'center' },
    overlayBtn: {
      marginTop: 4, backgroundColor: palette.accent, borderRadius: 20,
      paddingHorizontal: 28, paddingVertical: 12, width: '100%', alignItems: 'center',
    },
    overlayBtnText: { color: '#fff', fontSize: 12, letterSpacing: 1.5, fontFamily: 'Tiempos-Regular'},
    overlayBtnOutline: {
      marginTop: 4, borderWidth: 1, borderColor: palette.accent,
      borderRadius: 20, paddingHorizontal: 28, paddingVertical: 12, width: '100%', alignItems: 'center',
    },
    overlayBtnOutlineText: { color: palette.accent, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1.5 },
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const isLoggedIn = !loading && !!user;

  const getTierStyles = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'golden paw':
      return {
        bg: 'rgba(255, 215, 0, 0.18)',     
        border: 'rgba(255, 215, 0, 0.6)',
        text: '#FFD700',                  
        shadowColor: '#FFD700',
      };
    case 'silver paw':
      return {
        bg: 'rgba(192, 192, 192, 0.18)',  
        border: 'rgba(192, 192, 192, 0.6)',
        text: '#C0C0C0',
      };
    case 'cub':
    default:
      return {
        bg: 'transparent',
        border: palette.accent + '55',
        text: palette.accent,
      };
  }
};
const tierStyle = getTierStyles(user?.tier ?? 'cub');



  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/pages/settings')} accessibilityLabel="settings">
            <Ionicons name="settings-outline" size={14} color={palette.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.topBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* page content (always rendered, blurred behind overlay if not logged in) */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} scrollEnabled={isLoggedIn}>

        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarFallback}>
              <Ionicons name="paw-outline" size={28} color={palette.accent} />
            </View>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.userName}>{isLoggedIn ? userName : '———'}</Text>
            <Text style={styles.userHandle}>{isLoggedIn ? handle : '@———'}</Text>
           <Text style={styles.memberSince}>member since {isLoggedIn ? memberSince : '———'}</Text>
              {isLoggedIn && user?.tier && (
                <View style={{
                  alignSelf: 'flex-start',
                  marginTop: 6,
                  backgroundColor: tierStyle.bg,
                  borderWidth: 1,
                  borderColor: tierStyle.border,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}>
                  <Text style={{
                    color: tierStyle.text,
                    fontSize: 9,
                    letterSpacing: 2,
                    fontFamily: 'Tiempos-Regular',
                    textTransform: 'uppercase',
                  }}>
                    {user.tier}
                  </Text>
                </View>
              )}
          </View>
        </View>

        <SectionLabel text="current streak" palette={palette} />
        <Animated.View style={[styles.streakCard, { transform: [{ scale: streakAnim }] }]}>
          <Text style={styles.streakNum}>—</Text>
          <View>
            <Text style={styles.streakLabel}>days in a row ☕</Text>
            <Text style={styles.streakSub}>keep going, you&apos;re on a roll ( •̀ ω •́ )</Text>
          </View>
        </Animated.View>

        <SectionLabel text="paw points" palette={palette} />
        <View style={styles.pointsRow}>
          <Text style={styles.pointsNum}>{isLoggedIn ? points.toLocaleString() : '—'}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
          <TouchableOpacity style={styles.pointsNextBtn} onPress={() => router.push('/pages/rewards')} accessibilityLabel="view rewards">
            <Text style={styles.pointsNextText}>
              {isLoggedIn
                ? NEXT_REWARD === 0
                  ? 'redeem your next reward'
                  : `${NEXT_REWARD - points} to next reward`
                : '— to next reward'}
            </Text>
            <Ionicons name="arrow-forward-outline" size={11} color={palette.accent} opacity={0.75} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressHint}>{Math.round(progressPct * 100)}% of the way to a free drink ✦</Text>

        <SectionLabel text="your numbers" palette={palette} />
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={18} color={palette.accent} opacity={0.75} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionLabel text="recent orders" palette={palette} />
        <View>
          {orders.slice(0, 5).map(order => (
            <View key={order.id} style={styles.orderRow}>
              <Text style={styles.orderEmoji}>☕</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderName}>{order.items[0]?.menuItemName ?? 'order'}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</Text>
                <Text style={styles.orderMeta}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {order.locationName.toLowerCase()}
                </Text>
              </View>
              <Text style={styles.orderPoints}>+{order.pointsEarned} pts</Text>
            </View>
          ))}
          {orders.length === 0 && (
            <Text style={{ color: palette.text, opacity: 0.4, fontSize: 12, fontFamily: 'Tiempos-Regular', letterSpacing: 1, paddingVertical: 16 }}>
              no orders yet ☕
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={async () => { await logout(); router.replace('/pages/login'); }}>
          <Ionicons name="log-out-outline" size={14} color={palette.accent} opacity={0.7} />
          <Text style={styles.signOutText}>sign out</Text>
        </TouchableOpacity>

        <Text style={styles.kaomoji}>( ´ ▽ ` )ノ see you tomorrow!</Text>
      </ScrollView>

      {/* auth gate overlay — only shown when not logged in */}
      {!loading && !user && (
        <View style={styles.overlayWrap} pointerEvents="box-none">
          <ExpoBlurView
            intensity={18}
            tint={isDark ? 'dark' : 'light'}
            style={styles.overlayBlur}
          />
          <View style={styles.overlayCard}>
            <Text style={{ fontSize: 32 }}>🐾</Text>
            <Text style={styles.overlayTitle}>you&apos;re not logged in</Text>
            <Text style={styles.overlaySub}>sign in to see your paw points,{'\n'}streak, and order history ✦</Text>
            <TouchableOpacity style={styles.overlayBtn} onPress={() => router.push('/pages/login')}>
              <Text style={styles.overlayBtnText}>sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayBtnOutline} onPress={() => router.push('/pages/signup')}>
              <Text style={styles.overlayBtnOutlineText}>create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}