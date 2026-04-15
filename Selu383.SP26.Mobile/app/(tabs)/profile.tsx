import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// mock data 
const USER = {
  name: 'Sophia',
  handle: '@caffeinatedsoph',
  memberSince: 'March 2026',
  tier: 'golden paw',
  points: 1240,
  nextReward: 1500,
  streak: 7,
};

const STATS = [
  { label: 'drinks ordered', value: '14', icon: 'cafe-outline' },
  { label: 'rewards redeemed', value: '2', icon: 'gift-outline' },
  { label: 'fave location', value: 'hammond', icon: 'location-outline' },
];

const ORDER_HISTORY = [
  {
    id: '1',
    name: 'blueberry fizz',
    date: 'apr 7',
    store: 'hammond',
    emoji: '🫐',
    points: '+15',
  },
  {
    id: '2',
    name: 'lavender latte',
    date: 'apr 5',
    store: 'new orleans',
    emoji: '💜',
    points: '+15',
  },
  {
    id: '3',
    name: 'classic cold brew',
    date: 'apr 3',
    store: 'new orleans',
    emoji: '🖤',
    points: '+10',
  },
  {
    id: '4',
    name: 'honey oat flat white',
    date: 'mar 30',
    store: 'new orleans',
    emoji: '🍯',
    points: '+15',
  },
];

// sub-components 
function SectionLabel({ text, palette }: { text: string; palette: any }) {
  return (
    <Text
      style={{
        color: palette.accent,
        fontSize: 10,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 36,
      }}
    >
      ✦ {text}
    </Text>
  );
}

function OrderRow({
  item,
  palette,
  styles,
}: {
  item: typeof ORDER_HISTORY[0];
  palette: any;
  styles: any;
}) {
  return (
    <View style={styles.orderRow}>
      <Text style={styles.orderEmoji}>{item.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderName}>{item.name}</Text>
        <Text style={styles.orderMeta}>
          {item.date} · {item.store}
        </Text>
      </View>
      <Text style={styles.orderPoints}>{item.points} pts</Text>
    </View>
  );
}

// main screen 
export default function ProfileScreen() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  const progressPct = USER.points / USER.nextReward;

  useEffect(() => {
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
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    scroll: { paddingHorizontal: 32, paddingTop: 80, paddingBottom: 60 },

    // top bar
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
      fontWeight: '300',
      letterSpacing: 1,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    themeIcon: { opacity: 0.6 },
    topBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    topBtnText: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 0.5,
      opacity: 0.8,
    },
    // icon-only circle button for settings
    iconBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // avatar section
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      marginTop: 28,
      marginBottom: 4,
    },
    avatarWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1.5,
      borderColor: palette.accent,
      overflow: 'hidden',
    },
    avatarFallback: {
      width: '100%',
      height: '100%',
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nameBlock: { flex: 1 },
    userName: {
      color: palette.text,
      fontSize: 28,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    userHandle: {
      color: palette.text,
      fontSize: 12,
      letterSpacing: 1,
      opacity: 1,
      marginTop: 2,
    },
    memberSince: {
      color: palette.text,
      fontSize: 10,
      letterSpacing: 1.5,
      opacity: 0.9,
      marginTop: 3,
    },

    // tier badge — now a button
    tierBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginTop: 16,
      backgroundColor: palette.accent + '18',
    },
    tierText: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 1.5,
    },
    tierChevron: {
      opacity: 0.6,
    },

    // streak
    streakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.accent + '55',
      padding: 16,
      marginTop: 20,
    },
    streakNum: {
      color: palette.text,
      fontSize: 32,
      fontWeight: '300',
    },
    streakLabel: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    streakSub: {
      color: palette.text,
      fontSize: 11,
      opacity: 0.65,
      marginTop: 2,
      letterSpacing: 0.5,
    },

    // points / progress
    pointsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 8,
    },
    pointsNum: {
      color: palette.text,
      fontSize: 36,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    pointsLabel: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 1.5,
      opacity: 0.7,
      marginBottom: 6,
    },
    // points next reward — tappable pill
    pointsNextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: palette.accent + '55',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 6,
      backgroundColor: palette.accent + '10',
    },
    pointsNextText: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 1,
      opacity: 0.75,
    },
    progressTrack: {
      height: 4,
      backgroundColor: palette.accent + '30',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: palette.accent,
      borderRadius: 2,
    },
    progressHint: {
      color: palette.text,
      fontSize: 10,
      letterSpacing: 1,
      opacity: 0.5,
      marginTop: 6,
      fontStyle: 'italic',
    },

    // stats
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.accent + '40',
      padding: 14,
      alignItems: 'center',
      gap: 6,
    },
    statValue: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    statLabel: {
      color: palette.text,
      fontSize: 9,
      letterSpacing: 1.5,
      opacity: 0.65,
      textAlign: 'center',
      textTransform: 'uppercase',
    },

    // order history
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: palette.text + '22',
    },
    orderEmoji: { fontSize: 22 },
    orderName: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    orderMeta: {
      color: palette.text,
      fontSize: 10,
      letterSpacing: 1,
      opacity: 0.6,
      marginTop: 2,
    },
    orderPoints: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 1,
      opacity: 0.75,
    },

    // sign out
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 44,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: palette.text + '55',
      borderRadius: 28,
    },
    signOutText: {
      color: palette.text,
      fontSize: 12,
      letterSpacing: 1.5,
      opacity: 0.7,
    },

    kaomoji: {
      color: palette.text,
      fontSize: 12,
      letterSpacing: 1,
      opacity: 0.5,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.bg}
      />

      {/* fixed top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <View style={styles.topBarRight}>

          {/* settings icon button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/pages/settings')}
            accessibilityLabel="settings"
          >
            <Ionicons name="settings-outline" size={14} color={palette.accent} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.topBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── avatar + name ─────────────────────────────── */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarFallback}>
              <Ionicons name="paw-outline" size={28} color={palette.accent} />
            </View>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userHandle}>{USER.handle}</Text>
            <Text style={styles.memberSince}>member since {USER.memberSince}</Text>
          </View>
        </View>

        {/* tier badge — tappable, leads to tier page */}
        <TouchableOpacity
          style={styles.tierBadge}
          onPress={() => router.push('/pages/tiers')}
          accessibilityLabel="view tier details"
        >
          <Ionicons name="paw" size={12} color={palette.accent} />
          <Text style={styles.tierText}>{USER.tier} member</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={11}
            color={palette.accent}
            style={styles.tierChevron}
          />
        </TouchableOpacity>

        {/*streak*/}
        <SectionLabel text="current streak" palette={palette} />
        <Animated.View style={[styles.streakCard, { transform: [{ scale: streakAnim }] }]}>
          <Text style={styles.streakNum}>{USER.streak}</Text>
          <View>
            <Text style={styles.streakLabel}>days in a row ☕</Text>
            <Text style={styles.streakSub}>keep going, you&apos;re on a roll ( •̀ ω •́ )</Text>
          </View>
        </Animated.View>

        {/*points*/}
        <SectionLabel text="paw points" palette={palette} />
        <View style={styles.pointsRow}>
          <Text style={styles.pointsNum}>{USER.points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
          {/* points-to-next-reward — tappable pill */}
          <TouchableOpacity
            style={styles.pointsNextBtn}
            onPress={() => router.push('/pages/rewards')}
            accessibilityLabel="view rewards"
          >
            <Text style={styles.pointsNextText}>
              {USER.nextReward - USER.points} to next reward
            </Text>
            <Ionicons name="arrow-forward-outline" size={11} color={palette.accent} opacity={0.75} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressHint}>
          {Math.round(progressPct * 100)}% of the way to a free drink ✦
        </Text>

        {/*stats*/}
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

        {/*order history*/}
        <SectionLabel text="recent orders" palette={palette} />
        <View>
          {ORDER_HISTORY.map(item => (
            <OrderRow key={item.id} item={item} palette={palette} styles={styles} />
          ))}
        </View>

        {/*sign out*/}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => router.push('/pages/login')}>
          <Ionicons name="log-out-outline" size={14} color={palette.accent} opacity={0.7} />
          <Text style={styles.signOutText}>sign out</Text>
        </TouchableOpacity>

        <Text style={styles.kaomoji}>( ´ ▽ ` )ノ see you tomorrow!</Text>

      </ScrollView>
    </View>
  );
}