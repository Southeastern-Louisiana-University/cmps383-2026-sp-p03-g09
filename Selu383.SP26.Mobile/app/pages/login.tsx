import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, StatusBar } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';

export default function LoginScreen() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('oops', 'please fill in all fields ☕');
      return;
    }
    try {
      setSubmitting(true);
      // TODO: your auth logic here
    } catch (e: any) {
      Alert.alert('login failed', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const styles = createStyles(palette, isDark);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.bg}
      />

      {/* ── top bar ─────────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Text style={styles.logoTopBar}>caffeinated lions</Text>
        <View style={styles.topBarRight}>
          <Ionicons name="sunny-outline" size={13} color={palette.subtle} style={{ opacity: 0.6 }} />
          <Switch
            value={isDark}
            onValueChange={val => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: palette.subtle + '88', true: palette.accent + '88' }}
            thumbColor={isDark ? palette.accent : palette.elevated}
            ios_backgroundColor={palette.subtle + '88'}
          />
          <Ionicons name="moon-outline" size={13} color={palette.subtle} style={{ opacity: 0.6 }} />
        </View>
      </View>

      {/* ── content ─────────────────────────────────────────────────────────── */}
      <View style={styles.content}>

        <Text style={styles.headline}>
          {'welcome\n'}
          <Text style={{ color: palette.accent }}>back. ♡</Text>
        </Text>
        <Text style={styles.subline}>
          no account yet?{' '}
          <Text
            style={{ color: palette.accent, opacity: 1 }}
            onPress={() => router.push('/pages/signup')}
          >
            sign up →
          </Text>
        </Text>

        {/* email */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>email</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={15} color={palette.subtle} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={palette.subtle}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>
        </View>

        {/* password */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={15} color={palette.subtle} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              placeholderTextColor={palette.subtle}
              secureTextEntry={!showPassword}
              style={styles.input}
              ref={passwordRef}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                color={palette.subtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* forgot */}
        <TouchableOpacity style={styles.forgotRow}>
          <Text style={styles.forgotText}>forgot your password?</Text>
        </TouchableOpacity>

        {/* sign in button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={submitting}
          style={[styles.submitBtn, submitting && { opacity: 0.4 }]}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'one moment... ☕' : 'sign in ♡'}
          </Text>
        </TouchableOpacity>

      </View>

      {/* footer */}
      <Text style={styles.footer}>
        baton rouge · hammond · lafayette · metairie · new orleans
      </Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useTheme>['palette'], isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.bg,
    },

    // top bar — matches home & signup
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
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    content: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 56,
      justifyContent: 'center',
    },

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
      marginBottom: 48,
    },

    fieldWrapper: {
      marginBottom: 20,
    },
    fieldLabel: {
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: palette.subtle,
      opacity: 0.6,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + '88',
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 46,
    },
    input: {
      flex: 1,
      color: palette.text,
      fontSize: 14,
      letterSpacing: 0.3,
    },

    forgotRow: {
      alignSelf: 'flex-end',
      marginBottom: 32,
      marginTop: 4,
    },
    forgotText: {
      color: palette.subtle,
      fontSize: 11,
      letterSpacing: 0.5,
      opacity: 0.7,
    },

    submitBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: palette.accent + '18',
    },
    submitBtnText: {
      color: palette.accent,
      fontSize: 14,
      letterSpacing: 1.5,
      fontWeight: '400',
    },

    footer: {
      color: palette.subtle,
      fontSize: 11,
      letterSpacing: 1.5,
      textAlign: 'center',
      lineHeight: 20,
      paddingBottom: 32,
      opacity: 0.5,
    },
  });