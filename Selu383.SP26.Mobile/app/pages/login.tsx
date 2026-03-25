import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#1e1b4b',
  surface: '#2e2a6e',
  accent: '#a5b4fc',
  text: '#f1f0ff',
  subtle: '#4c4899',
};

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setSubmitting(true);
      // TODO: your auth logic here
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Sign in</Text>
        <TouchableOpacity>{/* onPress={() => router.push('/signup' as const)}> */}
          <Text style={styles.signupLink}>Don&apos;t have an account? Sign up</Text>##############################
        </TouchableOpacity>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.subtle}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.accent} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.subtle}
            secureTextEntry={!showPassword}
            style={styles.input}
            ref={passwordRef}
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={submitting}
          style={[styles.button, { opacity: submitting ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <TouchableOpacity>{/* onPress={() => router.push('/forgot-password' as const)}>*/}
          <Text style={styles.forgotText}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 8,
  },
  signupLink: {
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    color: COLORS.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.subtle,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 14,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.bg,
    fontWeight: '600',
    fontSize: 16,
  },
  forgotText: {
    color: COLORS.accent,
    textAlign: 'center',
    opacity: 0.8,
  },
});