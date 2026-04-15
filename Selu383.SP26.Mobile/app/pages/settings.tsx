import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeName } from '@/app/theme-context';
import { useRouter } from 'expo-router';

// ─── sub-components ──────────────────────────────────────────────────────────

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

function SettingRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  palette,
  danger,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  palette: any;
  danger?: boolean;
}) {
  const color = danger ? palette.danger : palette.text;
  const iconColor = danger ? palette.danger : palette.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: palette.accent + '22',
      }}
    >
      <Ionicons name={icon as any} size={17} color={iconColor} opacity={0.8} />
      <View style={{ flex: 1 }}>
        <Text style={{ color, fontSize: 13, fontFamily: 'Tiempos-Regular', letterSpacing: 0.4 }}>{label}</Text>
        {sublabel ? (
          <Text style={{ color: palette.accent, fontSize: 10, letterSpacing: 1, opacity: 0.55, marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {right ?? (
        onPress ? (
          <Ionicons name="chevron-forward-outline" size={13} color={palette.accent} opacity={0.5} />
        ) : null
      )}
    </TouchableOpacity>
  );
}

// main screen 

export default function SettingsScreen() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';
  const router = useRouter();

  // account fields (pre-filled mock)
  const [displayName, setDisplayName] = useState('Sophia');
  const [email, setEmail] = useState('sophia@example.com');
  const [editing, setEditing] = useState(false);

  // notification toggles
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [streakReminder, setStreakReminder] = useState(true);

  const styles = createStyles(palette);

  const themeOptions: { label: string; value: ThemeName; icon: string }[] = [
    { label: 'light', value: 'light', icon: 'sunny-outline' },
    { label: 'dark', value: 'dark', icon: 'moon-outline' },
    { label: 'oled', value: 'oled', icon: 'contrast-outline' },
  ];

  const handleSaveAccount = () => {
    setEditing(false);
    Alert.alert('saved ✦', 'your account info has been updated.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'delete account',
      'this will permanently remove your data. are you sure?',
      [
        { text: 'cancel', style: 'cancel' },
        { text: 'delete', style: 'destructive', onPress: () => router.replace('/pages/login') },
      ]
    );
  };

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
          <View style={styles.themeToggle}>
         </View>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.topBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* page header */}
        <Text style={styles.headline}>settings</Text>
        <Text style={styles.subline}>manage your account &amp; preferences</Text>

        {/* ── appearance ─────────────────────────────────────────────── */}
        <SectionLabel text="appearance" palette={palette} />

        <View style={styles.themeRow}>
          {themeOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setTheme(opt.value)}
              style={[
                styles.themeChip,
                theme === opt.value && styles.themeChipActive,
              ]}
              accessibilityLabel={`set theme to ${opt.label}`}
            >
              <Ionicons
                name={opt.icon as any}
                size={13}
                color={theme === opt.value ? palette.bg : palette.accent}
                opacity={theme === opt.value ? 1 : 0.65}
              />
              <Text
                style={[
                  styles.themeChipText,
                  theme === opt.value && styles.themeChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── account info ────────────────────────────────────────────── */}
        <SectionLabel text="account" palette={palette} />

        <View style={styles.card}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>display name</Text>
            {editing ? (
              <TextInput
                style={styles.fieldInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholderTextColor={palette.accent + '55'}
                selectionColor={palette.accent}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldValue}>{displayName}</Text>
            )}
          </View>

          <View style={[styles.fieldWrap, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>email</Text>
            {editing ? (
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={palette.accent + '55'}
                selectionColor={palette.accent}
              />
            ) : (
              <Text style={styles.fieldValue}>{email}</Text>
            )}
          </View>
        </View>

        {editing ? (
          <View style={styles.editBtnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAccount}>
              <Text style={styles.saveBtnText}>save changes ✦</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelBtnText}>cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={12} color={palette.accent} opacity={0.75} />
            <Text style={styles.editBtnText}>edit info</Text>
          </TouchableOpacity>
        )}

        {/* ── security ────────────────────────────────────────────────── */}
        <SectionLabel text="security" palette={palette} />

        <View style={styles.card}>
          <SettingRow
            icon="lock-closed-outline"
            label="change password"
            sublabel="last changed 3 months ago"
            onPress={() => Alert.alert('change password', 'password reset email sent!')}
            palette={palette}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="two-factor authentication"
            sublabel="currently disabled"
            onPress={() => Alert.alert('2fa', 'coming soon ✦')}
            palette={palette}
          />
          <SettingRow
            icon="log-out-outline"
            label="sign out of all devices"
            onPress={() => Alert.alert('signed out', 'all sessions have been ended.')}
            palette={palette}
          />
        </View>

        {/* ── notifications ───────────────────────────────────────────── */}
        <SectionLabel text="notifications" palette={palette} />

        <View style={styles.card}>
          <SettingRow
            icon="receipt-outline"
            label="order updates"
            sublabel="ready notifications, status changes"
            palette={palette}
            right={
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: palette.subtle + '55', true: palette.accent + '88' }}
                thumbColor={orderUpdates ? palette.accent : palette.elevated}
                ios_backgroundColor={palette.subtle + '55'}
              />
            }
          />
          <SettingRow
            icon="pricetag-outline"
            label="promos &amp; offers"
            sublabel="weekly deals and seasonal drinks"
            palette={palette}
            right={
              <Switch
                value={promoAlerts}
                onValueChange={setPromoAlerts}
                trackColor={{ false: palette.subtle + '55', true: palette.accent + '88' }}
                thumbColor={promoAlerts ? palette.accent : palette.elevated}
                ios_backgroundColor={palette.subtle + '55'}
              />
            }
          />
          <SettingRow
            icon="flame-outline"
            label="streak reminder"
            sublabel="daily nudge to keep your streak alive"
            palette={palette}
            right={
              <Switch
                value={streakReminder}
                onValueChange={setStreakReminder}
                trackColor={{ false: palette.subtle + '55', true: palette.accent + '88' }}
                thumbColor={streakReminder ? palette.accent : palette.elevated}
                ios_backgroundColor={palette.subtle + '55'}
              />
            }
          />
        </View>

        {/* ── about ───────────────────────────────────────────────────── */}
        <SectionLabel text="about" palette={palette} />

        <View style={styles.card}>
          <SettingRow
            icon="document-text-outline"
            label="privacy policy"
            onPress={() => Alert.alert('privacy', 'opening privacy policy...')}
            palette={palette}
          />
          <SettingRow
            icon="clipboard-outline"
            label="terms of service"
            onPress={() => Alert.alert('terms', 'opening terms of service...')}
            palette={palette}
          />
          <SettingRow
            icon="information-circle-outline"
            label="app version"
            sublabel="v1.0.0 · caffeinated lions"
            palette={palette}
          />
        </View>

        {/*danger zone */}
        <SectionLabel text="danger zone" palette={palette} />

        <View style={styles.card}>
          <SettingRow
            icon="trash-outline"
            label="delete account"
            sublabel="permanently remove your data"
            onPress={handleDeleteAccount}
            palette={palette}
            danger
          />
        </View>

        <Text style={styles.kaomoji}>( ´ ▽ ` )ノ you&apos;re all set!</Text>

      </ScrollView>
    </View>
  );
}
const createStyles = (palette: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },

    topBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
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
    logoTopBar: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
    topBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },

    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },

    headline: {
      color: palette.text,
      fontSize: 42,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    subline: {
      color: palette.accent,
      fontSize: 12,
      letterSpacing: 0.5,
      opacity: 0.6,
    },

    // theme chip row
    themeRow: { flexDirection: 'row', gap: 10 },
    themeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.accent + '55',
      backgroundColor: palette.surface + '33',
    },
    themeChipActive: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    themeChipText: {
      color: palette.accent,
      fontSize: 11,
      letterSpacing: 1.5,
      opacity: 0.75,
    },
    themeChipTextActive: {
      color: palette.bg,
      opacity: 1,
    },

    // card container
    card: {
      backgroundColor: palette.surface + '44',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.accent + '30',
      paddingHorizontal: 16,
      overflow: 'hidden',
    },

    // account edit fields
    fieldWrap: {
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent + '22',
      gap: 4,
    },
    fieldLabel: {
      color: palette.accent,
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      opacity: 0.6,
    },
    fieldValue: {
      color: palette.text,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.3,
    },
    fieldInput: {
      color: palette.text,
      fontSize: 14,
      fontFamily: 'Tiempos-Regular',
      letterSpacing: 0.3,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent + '88',
      paddingVertical: 2,
    },

    // edit / save buttons
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: palette.accent + '66',
      borderRadius: 20,
    },
    editBtnText: { color: palette.accent, fontSize: 11, letterSpacing: 1, opacity: 0.8 },
    editBtnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    saveBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 11,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.accent,
      backgroundColor: palette.accent + '18',
    },
    saveBtnText: { color: palette.accent, fontSize: 12, letterSpacing: 1.5 },
    cancelBtn: {
      paddingHorizontal: 18,
      alignItems: 'center',
      paddingVertical: 11,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.subtle + '55',
    },
    cancelBtnText: { color: palette.text, fontSize: 12, letterSpacing: 1, opacity: 0.6 },

    kaomoji: {
      color: palette.accent,
      fontSize: 12,
      letterSpacing: 1,
      opacity: 0.5,
      textAlign: 'center',
      marginTop: 40,
    },
  });