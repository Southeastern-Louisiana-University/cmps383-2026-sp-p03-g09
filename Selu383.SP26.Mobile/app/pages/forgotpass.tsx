import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/theme-context';

export default function ForgotPasswordScreen() {
  const { palette, theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'oled';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('oops', 'please enter your email ☕');
      return;
    }
    try {
      setSubmitting(true);
      // TODO: your password reset logic here
      setSent(true);
    } catch (e: any) {
      Alert.alert('something went wrong', e?.message || 'unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.bg}
      />

      {/* top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.backBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>

        {!sent ? (
          <>
            <Text style={styles.headline}>
              {'forgot\n'}
              <Text style={{ color: palette.accent }}>password? ☕</Text>
            </Text>
            <Text style={styles.subline}>
              coffee will fix that.
            </Text>
            <Text style={styles.subline}>
              we&apos;ll send a reset link to your email.
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
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleReset}
              disabled={submitting}
              style={[styles.submitBtn, submitting && { opacity: 0.4 }]}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'one moment... ☕' : 'send reset link ♡'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace('/pages/login')}>
              <Text style={styles.backToLoginText}>back to sign in →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.headline}>
              {'check your\n'}
              <Text style={{ color: palette.accent }}>email. ♡</Text>
            </Text>
            <Text style={styles.subline}>
              we sent a reset link to{' '}
              <Text style={{ color: palette.text, opacity: 1 }}>{email}</Text>
              {'. it may take a minute.'}
            </Text>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => router.replace('/pages/login')}
            >
              <Text style={styles.submitBtnText}>back to sign in ♡</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLogin} onPress={() => { setSent(false); setEmail(''); }}>
              <Text style={styles.backToLoginText}>try a different email →</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footer}>
          new orleans · hammond · new york
        </Text>
      </View>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useTheme>['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.bg,
    },
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
    logo: { color: palette.accent, fontSize: 14, fontFamily: 'Tiempos-Regular', letterSpacing: 1 },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
    content: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 56,
      justifyContent: 'center',
    },
    headline: {
      color: palette.text,
      fontSize: 42,
      fontFamily: 'Tiempos-Regular',
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subline: {
      color: palette.text,
      fontSize: 13,
      letterSpacing: 0.5,
      opacity: 0.75,
      marginBottom: 20,
    },
    fieldWrapper: {
      marginBottom: 20,
    },
    fieldLabel: {
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: palette.text,
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
    submitBtn: {
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: palette.accent + '18',
      marginTop: 12,
    },
    submitBtnText: {
      color: palette.accent,
      fontSize: 14,
      letterSpacing: 1.5,
    },
    backToLogin: {
      alignSelf: 'center',
      marginTop: 20,
    },
    backToLoginText: {
      color: palette.text,
      fontSize: 11,
      letterSpacing: 0.5,
      opacity: 0.7,
    },
    footer: {
      color: palette.accent,
      fontSize: 15,
      letterSpacing: 1.5,
      textAlign: 'center',
      lineHeight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      opacity: 1,
    },
  });