import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';
import { useRouter } from 'expo-router';

const MENU = [
  {
    category: 'drinks',
    items: [
      { name: 'iced latte', desc: 'espresso and milk served over ice', price: '$5.50' },
      { name: 'supernova', desc: 'unique blend with complex, balanced profile and subtle sweetness — as espresso or with milk', price: '$7.95' },
      { name: 'roaring frappe', desc: 'cold brew, milk, and ice blended with a signature syrup, topped with whipped cream', price: '$6.20' },
      { name: 'black & white cold brew', desc: 'dark and light roast cold brew, finished with condensed milk', price: '$5.15' },
      { name: 'strawberry limeade', desc: 'fresh lime juice blended with strawberry purée', price: '$5.00' },
      { name: 'shaken lemonade', desc: 'fresh lemon juice and simple syrup, vigorously shaken', price: '$5.00' },
    ],
  },
  {
    category: 'sweet crepes',
    items: [
      { name: 'mannino honey crepe', desc: 'drizzled with Mannino honey, topped with mixed berries', price: '$10.00' },
      { name: 'downtowner', desc: 'strawberries and bananas with Nutella and Hershey\'s chocolate sauce', price: '$10.75' },
      { name: 'funky monkey', desc: 'Nutella and bananas, served with whipped cream', price: '$10.00' },
      { name: 'le s\'mores', desc: 'marshmallow cream and chocolate sauce, topped with graham cracker crumbs', price: '$9.50' },
      { name: 'strawberry fields', desc: 'fresh strawberries, Hershey\'s chocolate drizzle, powdered sugar', price: '$10.00' },
      { name: 'bonjour', desc: 'syrup and cinnamon, finished with powdered sugar', price: '$8.50' },
      { name: 'banana foster', desc: 'bananas with cinnamon, topped with a generous caramel drizzle', price: '$8.95' },
    ],
  },
  {
    category: 'savory crepes',
    items: [
      { name: 'matt\'s scrambled eggs', desc: 'scrambled eggs and melted mozzarella', price: '$5.00' },
      { name: 'meanie mushroom', desc: 'sautéed mushrooms, mozzarella, tomato, and bacon', price: '$10.50' },
      { name: 'turkey club', desc: 'sliced turkey, bacon, spinach, and tomato', price: '$10.50' },
      { name: 'green machine', desc: 'spinach, artichokes, and mozzarella', price: '$10.00' },
      { name: 'perfect pair', desc: 'bacon and Nutella — trust us on this one', price: '$10.00' },
      { name: 'crepe fromage', desc: 'a blend of cheeses, simply done', price: '$8.00' },
      { name: 'farmers market crepe', desc: 'turkey, spinach, and mozzarella', price: '$10.50' },
    ],
  },
  {
    category: 'bagels',
    items: [
      { name: 'travis special', desc: 'cream cheese, salmon, spinach, and a fried egg', price: '$14.00' },
      { name: 'crème brulagel', desc: 'caramelized sugar crust inspired by crème brûlée, with cream cheese', price: '$8.00' },
      { name: 'the fancy one', desc: 'smoked salmon, cream cheese, and fresh dill', price: '$13.00' },
      { name: 'breakfast bagel', desc: 'ham, bacon, or sausage with a fried egg and cheddar', price: '$9.50' },
      { name: 'the classic', desc: 'toasted bagel with cream cheese', price: '$5.25' },
    ],
  },
];

export default function MenuScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState(0);

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
      fontWeight: '300',
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

    scroll: {
      paddingTop: 100,
      paddingBottom: 48,
    },

    pageHeader: {
      paddingHorizontal: 32,
      paddingTop: 32,
      paddingBottom: 24,
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
      fontWeight: '300',
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

    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: 32,
      gap: 8,
      marginBottom: 24,
    },
    tab: {
      borderWidth: 1,
      borderColor: palette.accent + '60',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    tabActive: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      backgroundColor: palette.accent + '22',
    },
    tabText: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 0.5,
      opacity: 0.5,
    },
    tabTextActive: {
      color: palette.accent,
      fontSize: 11,
      letterSpacing: 0.5,
    },

    section: {
      paddingHorizontal: 32,
    },
    sectionLabel: {
      color: palette.accent,
      fontSize: 10,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 12,
      opacity: 0.75,
    },

    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent + '20',
      gap: 12,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '300',
      letterSpacing: 0.3,
      marginBottom: 4,
    },
    itemDesc: {
      color: palette.accent,
      fontSize: 12,
      lineHeight: 18,
      opacity: 0.65,
    },
    itemPrice: {
      color: palette.accent,
      fontSize: 13,
      fontWeight: '300',
      letterSpacing: 0.5,
      paddingTop: 2,
    },

    footer: {
      color: palette.accent,
      fontSize: 11,
      letterSpacing: 1.5,
      textAlign: 'center',
      opacity: 0.5,
      marginTop: 40,
      marginBottom: 8,
    },
  });

  const categories = MENU.map(s => s.category);

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
          <Text style={styles.pageLabel}>✦ what we&apos;re serving</Text>
          <Text style={styles.pageTitle}>our menu.</Text>
          <Text style={styles.pageSubtitle}>sip something that gets you ( ´ ▽ ` )</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={i === activeCategory ? styles.tabActive : styles.tab}
              onPress={() => setActiveCategory(i)}
            >
              <Text style={i === activeCategory ? styles.tabTextActive : styles.tabText}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{MENU[activeCategory].category}</Text>
          {MENU[activeCategory].items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>new orleans · hammond · new york</Text>

      </ScrollView>
    </View>
  );
}