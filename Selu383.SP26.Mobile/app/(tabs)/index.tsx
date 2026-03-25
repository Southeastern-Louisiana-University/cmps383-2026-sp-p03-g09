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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;

const SAYINGS = [
  'your daily ritual, elevated. ✦',
  'brewed with love & a little chaos ♡',
  'sip something that gets you ( ´ ▽ ` )',
  'fuel for dreamers & deadline-chasers ʕ•́ᴥ•̀ʔっ',
  'stay paw-sitive, stay caffeinated 🐾',
  "you're not you, without your brew ☕",
  'sip now, slay later 💅',
];

const DRINKS = [
  {
    emoji: '🫐',
    name: 'blueberry fizz',
    desc: 'blueberry tea, vanilla cream, butterfly pea swirl',
    image: require('../../assets/blueberrycoffee.png'),
    pairing: {
      name: 'blueberry muffin',
      desc: 'fluffy, golden crumble-topped, bursting with berries',
      image: require('../../assets/bbmuffins.jpg'),
    },
  },
];

function SwipeCard({
  drink,
  slot,
  palette,
  styles,
}: {
  drink: typeof DRINKS[0];
  slot: 'drink' | 'pairing';
  palette: any;
  styles: any;
}) {
  const isDrink = slot === 'drink';
  const name = isDrink ? drink.name : drink.pairing.name;
  const desc = isDrink ? drink.desc : drink.pairing.desc;
  const image = isDrink ? drink.image : drink.pairing.image;
  const badgeText = isDrink ? 'roaring good pick' : 'perfect pairing';

  return (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      <Image source={image} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        {!isDrink && <Text style={styles.cardPairingLabel}>pairs with →</Text>}
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';

  const [sayingIndex, setSayingIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const drink = DRINKS[week % DRINKS.length];

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setSayingIndex(i => (i + 1) % SAYINGS.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    scroll: { paddingHorizontal: 32, paddingTop: 80, paddingBottom: 48 },

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
      borderBottomColor: palette.subtle + '40',
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

    // theme toggle inside top bar
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginRight: 4,
    },
    themeIcon: {
      opacity: 0.6,
    },

    topBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: palette.subtle,
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
    topBtnAccent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: palette.accent + '22',
    },
    topBtnAccentText: {
      color: palette.accent,
      fontSize: 11,
      letterSpacing: 0.5,
    },

    saying: {
      color: palette.subtle,
      fontSize: 13,
      letterSpacing: 1,
      marginBottom: 40,
      fontStyle: 'italic',
      opacity: 0.75,
    },
    headline: {
      color: palette.text,
      fontSize: 42,
      fontWeight: '300',
      lineHeight: 50,
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    subline: {
      color: palette.subtle,
      fontSize: 14,
      letterSpacing: 2,
      marginBottom: 4,
      opacity: 0.75,
    },
    kaomoji: {
      color: palette.subtle,
      fontSize: 13,
      letterSpacing: 1,
      marginBottom: 40,
    },
    drinkLabel: {
      color: palette.subtle,
      fontSize: 10,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    swipeHint: {
      color: palette.subtle,
      fontSize: 10,
      letterSpacing: 1.5,
      opacity: 0.5,
      marginBottom: 10,
      fontStyle: 'italic',
    },
    swiperWrapper: {
      marginHorizontal: -32,
      marginBottom: 16,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.subtle,
      overflow: 'hidden',
      marginLeft: 32,
    },
    cardImage: {
      width: '100%',
      height: 180,
    },
    cardBody: {
      padding: 20,
      gap: 6,
    },
    cardPairingLabel: {
      color: palette.accent,
      fontSize: 10,
      letterSpacing: 2,
      opacity: 0.7,
      marginBottom: 2,
    },
    cardName: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    cardDesc: {
      color: palette.subtle,
      fontSize: 12,
      lineHeight: 18,
      opacity: 0.75,
    },
    badge: {
      marginTop: 4,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 2,
    },
    badgeText: {
      color: palette.accent,
      fontSize: 10,
      letterSpacing: 1.5,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: 4,
      marginBottom: 44,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    locations: {
      color: palette.subtle,
      fontSize: 11,
      letterSpacing: 1.5,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const slots: ('drink' | 'pairing')[] = ['drink', 'pairing'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      {/* fixed top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <View style={styles.topBarRight}>

          {/* theme toggle — lives here now */}
          <View style={styles.themeToggle}>
            <Ionicons
              name="sunny-outline"
              size={13}
              color={palette.subtle}
              style={styles.themeIcon}
            />
            <Switch
              value={isDark}
              onValueChange={val => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: palette.subtle + '88', true: palette.accent + '88' }}
              thumbColor={isDark ? palette.accent : palette.elevated}
              ios_backgroundColor={palette.subtle + '88'}
            />
            <Ionicons
              name="moon-outline"
              size={13}
              color={palette.subtle}
              style={styles.themeIcon}
            />
          </View>

          <TouchableOpacity style={styles.topBtn} onPress={() => router.push('/pages/stores')}>
            <Ionicons name="location-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.topBtnText}>stores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.topBtn} onPress={() => router.push('/pages/login')}>
            <Ionicons name="paw-outline" size={12} color={palette.accent} />
            <Text style={styles.topBtnAccentText}>sign in</Text>
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Animated.Text style={[styles.saying, { opacity: fadeAnim }]}>
          {SAYINGS[sayingIndex]}
        </Animated.Text>

        <Text style={styles.headline}>
          {'five locations.\ntwenty drinks.\nunlimited ways to '}
          <Text style={{ color: palette.accent }}>smile.</Text>
        </Text>

        <Text style={styles.subline}>come say hi today</Text>
        <Text style={styles.kaomoji}>( @^u^ )</Text>

        <Text style={styles.drinkLabel}>✦ lion&apos;s pick + a little treat 🍰</Text>
        <Text style={styles.swipeHint}>swipe to see the pairing →</Text>

        <View style={styles.swiperWrapper}>
          <FlatList
            data={slots}
            keyExtractor={item => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 32}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 32 }}
            onMomentumScrollEnd={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_WIDTH + 32)
              );
              setActiveSlot(index);
            }}
            renderItem={({ item }) => (
              <SwipeCard
                drink={drink}
                slot={item}
                palette={palette}
                styles={styles}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          />
        </View>

        <View style={styles.dots}>
          {slots.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeSlot ? palette.accent : palette.subtle },
              ]}
            />
          ))}
        </View>

        <Text style={styles.locations}>
          baton rouge · hammond · lafayette · metairie · new orleans
        </Text>

      </ScrollView>
    </View>
  );
}