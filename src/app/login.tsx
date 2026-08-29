import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

type AuthMode = 'signIn' | 'signUp';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const isSignIn = mode === 'signIn';

  const getNormalizedEmail = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.');
      return null;
    }

    if (!normalizedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return null;
    }

    return normalizedEmail;
  };

  const handleSubmit = async () => {
    const normalizedEmail = getNormalizedEmail();

    setMessage('');
    setErrorMessage('');
    setShowResend(false);

    if (!normalizedEmail) {
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Your password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    const result = isSignIn
      ? await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
      : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

    setLoading(false);

    if (result.error) {
      const isEmailNotConfirmed = result.error.message
        .toLowerCase()
        .includes('email not confirmed');

      setErrorMessage(result.error.message);
      setShowResend(isEmailNotConfirmed);
      return;
    }

    if (!isSignIn && !result.data.session) {
      setMessage(
        'Account created. Check your email for a confirmation link before signing in.',
      );
      setShowResend(true);
      return;
    }

    router.replace('/');
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = getNormalizedEmail();

    setMessage('');
    setErrorMessage('');

    if (!normalizedEmail) {
      return;
    }

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    setResending(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setShowResend(false);
    setMessage(
      'A new confirmation email has been sent. Use the newest link from your inbox.',
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{isSignIn ? 'Welcome back' : 'Create account'}</Text>
        <Text style={styles.subtitle}>
          {isSignIn
            ? 'Sign in to submit and track quote requests.'
            : 'Create an account to save your quote requests.'}
        </Text>

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isSignIn ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {showResend ? (
          <TouchableOpacity
            style={[styles.resendButton, resending && styles.disabledButton]}
            onPress={handleResendConfirmation}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.resendText}>Resend confirmation email</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setMode(isSignIn ? 'signUp' : 'signIn');
            setMessage('');
            setErrorMessage('');
            setShowResend(false);
          }}
        >
          <Text style={styles.switchText}>
            {isSignIn
              ? 'Need an account? Create one'
              : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  messageText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
