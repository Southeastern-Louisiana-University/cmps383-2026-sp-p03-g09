import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Switch,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme, ThemePalette } from '@/app/theme-context';

// tiny labelled field 
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity: 0.5,
        marginBottom: 8,
        color: "#888",
      }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function Signup() {
  const { palette, theme, setTheme } = useTheme();
  const isDark = theme === "dark" || theme === "oled";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [strength, setStrength] = useState(0);

  const lastNameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmRef = useRef<TextInput | null>(null);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isValid = Object.values(checks).every(Boolean) && passwordsMatch;

  useEffect(() => {
    if (!password.length) { setStrength(0); return; }
    let s = Math.min(30, password.length * 4);
    if (checks.upper) s += 15;
    if (/[a-z]/.test(password)) s += 10;
    if (checks.number) s += 15;
    if (checks.special) s += 20;
    const repeats = password.length - new Set(password.split("")).size;
    setStrength(Math.max(0, Math.min(100, s - repeats * 5)));
  }, [password]);

  const strengthColor = strength >= 80 ? "#4CAF50" : strength >= 50 ? "#FF9800" : strength >= 30 ? "#FF5722" : "#F44336";
  const strengthLabel = strength >= 80 ? "strong ✦" : strength >= 50 ? "medium" : strength >= 30 ? "weak" : "very weak";

  const isFormValid = () =>
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    isValid;

  const handleSignup = async () => {
    if (!isFormValid()) {
      Alert.alert("oops", "please fill everything in correctly ☕");
      return;
    }
    try {
      setSubmitting(true);
      // TODO: hook up your auth registration here
      Alert.alert("welcome! ♡", "registration successful. check your email to confirm.");
      router.replace("/pages/login");
    } catch (e: any) {
      Alert.alert("registration failed", e?.message || "unable to register. check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={palette.bg} />

      {/*top bar*/}
      <View style={styles.topBar}>
        <Text style={styles.logo}>caffeinated lions</Text>
        <View style={styles.topBarRight}>
          <Ionicons name="sunny-outline" size={13} color={palette.subtle} style={{ opacity: 0.6 }} />
          <Switch
            value={isDark}
            onValueChange={val => setTheme(val ? "dark" : "light")}
            trackColor={{ false: palette.subtle + "88", true: palette.accent + "88" }}
            thumbColor={isDark ? palette.accent : palette.elevated}
            ios_backgroundColor={palette.subtle + "88"}
          />
          <Ionicons name="moon-outline" size={13} color={palette.subtle} style={{ opacity: 0.6 }} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={12} color={palette.text} opacity={0.8} />
            <Text style={styles.backBtnText}>back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.headline}>
          {"join the\n"}
          <Text style={{ color: palette.accent }}>pride.</Text>
        </Text>
        <Text style={styles.subline}>
          already one of us?{" "}
          <Text style={{ color: palette.accent }} onPress={() => router.replace("/pages/login")}>
            sign in →
          </Text>
        </Text>

        {/* name */}
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Field label="first name">
              <TextInput
                style={styles.input}
                placeholder="first"
                placeholderTextColor={palette.subtle}
                value={firstName}
                onChangeText={setFirstName}
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                textContentType={Platform.OS === "ios" ? "givenName" : "none"}
                autoComplete="name-given"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="last name">
              <TextInput
                style={styles.input}
                placeholder="last"
                placeholderTextColor={palette.subtle}
                value={lastName}
                onChangeText={setLastName}
                autoCorrect={false}
                ref={lastNameRef}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
                textContentType={Platform.OS === "ios" ? "familyName" : "none"}
                autoComplete="name-family"
              />
            </Field>
          </View>
        </View>

        {/* email */}
        <Field label="email">
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={palette.subtle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            ref={emailRef}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
            textContentType={Platform.OS === "ios" ? "emailAddress" : "none"}
            autoComplete="email"
          />
        </Field>

        {/* password */}
        <Field label="password">
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, { paddingRight: 48 }]}
              placeholder="password"
              placeholderTextColor={palette.subtle}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              autoCorrect={false}
              ref={passwordRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmRef.current?.focus()}
              textContentType={Platform.OS === "ios" ? "newPassword" : "none"}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={palette.subtle} />
            </TouchableOpacity>
          </View>

          {password.length > 0 && (
            <View style={{ marginTop: 10, gap: 4 }}>
              {([
                { ok: checks.length,  label: "8+ characters" },
                { ok: checks.upper,   label: "uppercase letter" },
                { ok: checks.number,  label: "number" },
                { ok: checks.special, label: "special character" },
              ] as { ok: boolean; label: string }[]).map(({ ok, label }) => (
                <Text key={label} style={{ fontSize: 11, letterSpacing: 0.5, color: ok ? "#4CAF50" : palette.subtle, opacity: ok ? 1 : 0.6 }}>
                  {ok ? "✓ " : "○ "}{label}
                </Text>
              ))}
              <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1, height: 2, backgroundColor: palette.subtle + "44", borderRadius: 1 }}>
                  <View style={{ height: 2, borderRadius: 1, backgroundColor: strengthColor, width: `${strength}%` }} />
                </View>
                <Text style={{ fontSize: 10, letterSpacing: 1, color: strengthColor }}>{strengthLabel}</Text>
              </View>
            </View>
          )}
        </Field>

        {/* confirm password */}
        <Field label="confirm password">
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, confirmPassword !== "" && !passwordsMatch && styles.inputError, { paddingRight: 48 }]}
              placeholder="confirm password"
              placeholderTextColor={palette.subtle}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              secureTextEntry={!showConfirmPassword}
              autoCorrect={false}
              ref={confirmRef}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
              textContentType={Platform.OS === "ios" ? "newPassword" : "none"}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(s => !s)} style={styles.eyeBtn}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color={palette.subtle} />
            </TouchableOpacity>
          </View>
          {confirmPassword !== "" && !passwordsMatch && (
            <Text style={{ color: "#FF5722", fontSize: 11, marginTop: 4, letterSpacing: 0.5 }}>passwords don&apos;t match</Text>
          )}
          {passwordsMatch && (
            <Text style={{ color: "#4CAF50", fontSize: 11, marginTop: 4, letterSpacing: 0.5 }}>✓ passwords match</Text>
          )}
        </Field>

        {/* submit */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={!isFormValid() || submitting}
          style={[styles.submitBtn, (!isFormValid() || submitting) && { opacity: 0.4 }]}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "one moment... ☕" : "create account ♡"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          baton rouge · hammond · lafayette · metairie · new orleans
        </Text>

      </ScrollView>
    </View>
  );
}

const createStyles = (palette: ThemePalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    topBar: {
      position: "absolute",
      top: 0, left: 0, right: 0,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 32,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: palette.bg,
      borderBottomWidth: 1,
      borderBottomColor: palette.subtle + "40",
    },
    logo: { color: palette.accent, fontSize: 14, fontWeight: "300", letterSpacing: 1 },
    topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: palette.subtle,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    backBtnText: { color: palette.text, fontSize: 11, letterSpacing: 0.5, opacity: 0.8 },
    scroll: { paddingHorizontal: 32, paddingTop: 116, paddingBottom: 64 },
    headline: {
      color: palette.text,
      fontSize: 42,
      fontWeight: "300",
      lineHeight: 50,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    subline: {
      color: palette.subtle,
      fontSize: 13,
      letterSpacing: 0.5,
      opacity: 0.75,
      marginBottom: 40,
    },
    nameRow: { flexDirection: "row", gap: 12 },
    input: {
      height: 46,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.subtle + "88",
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: palette.text,
      letterSpacing: 0.3,
    },
    inputError: { borderColor: "#FF5722" },
    eyeBtn: { position: "absolute", right: 14, top: 14 },
    submitBtn: {
      marginTop: 32,
      borderWidth: 1,
      borderColor: palette.accent,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: palette.accent + "18",
    },
    submitBtnText: { color: palette.accent, fontSize: 14, letterSpacing: 1.5, fontWeight: "400" },
    footer: {
      color: palette.subtle,
      fontSize: 11,
      letterSpacing: 1.5,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 24,
      opacity: 0.5,
    },
  });