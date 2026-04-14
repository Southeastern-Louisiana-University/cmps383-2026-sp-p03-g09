import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/theme-context';
import { apiClient, LocationDto } from '@/api/client';

export default function StoresScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.locations.getAll()
      .then(setLocations)
      .catch(() => setError('could not load locations'))
      .finally(() => setLoading(false));
  }, []);

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={palette.bg} />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
          <Text style={styles.backBtnText}>back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>
          {'find\n'}
          <Text style={{ color: palette.accent }}>us.</Text>
        </Text>
        <Text style={styles.subline}>
          come say hi at any of our locations ♡
        </Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={palette.accent} />
          </View>
        )}

        {!!error && (
          <Text style={[styles.subline, { color: palette.danger }]}>{error}</Text>
        )}

        {!loading && !error && locations.map((loc) => (
          <View key={loc.id} style={styles.card}>
            <Text style={styles.cardName}>{loc.name}</Text>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={13} color={palette.subtle} style={{ marginTop: 2 }} />
              <Text style={styles.cardAddress}>{loc.address}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="people-outline" size={13} color={palette.subtle} />
              <Text style={styles.cardMeta}>{loc.tableCount} tables</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useTheme>['palette']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + '40',
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
      borderColor: palette.subtle,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    backBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 48, paddingBottom: 64 },
    headline: {
      color: palette.text,
      fontSize: 42,
      fontWeight: '300',
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subline: {
      color: palette.subtle,
      fontSize: 13,
      letterSpacing: 0.5,
      opacity: 0.75,
      marginBottom: 32,
    },
    centered: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    card: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + '55',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      gap: 8,
    },
    cardName: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0.3,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    cardAddress: {
      color: palette.subtle,
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
      opacity: 0.8,
    },
    cardMeta: {
      color: palette.subtle,
      fontSize: 12,
      opacity: 0.7,
      letterSpacing: 0.5,
    },
  });
