import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

// 1. Initialize Sentry at the top level
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
});

type ContractorAccess = 'loading' | 'none' | 'approved' | 'unapproved';

// Helper to check if a route requires a signed-in user
const isProtectedPath = (pathname: string) =>
  pathname === '/my-requests' ||
  pathname === '/contractor-requests' ||
  pathname === '/admin-contractors' ||
  /^\/contractor\/[^/]+\/request$/.test(pathname);

// Helper to check if a route is specifically for the contractor inbox
const isContractorInboxPath = (pathname: string) =>
  pathname === '/contractor-requests';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Checking your account...</Text>
    </View>
  );
}

/**
 * AuthGate handles session management and role-based routing.
 * It ensures that users are redirected to login for protected paths
 * and restricts access to contractor/admin screens based on profile data.
 */
function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [contractorAccess, setContractorAccess] = useState<ContractorAccess>('none');

  // Load and listen for Auth Session changes
  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (active) {
        setSession(data.session);
        setSessionReady(true);
      }
    };

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setSessionReady(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load Contractor Profile/Approval status
  useEffect(() => {
    let active = true;

    const loadContractorAccess = async () => {
      if (!session) {
        setContractorAccess('none');
        return;
      }

      setContractorAccess('loading');

      const { data, error } = await supabase
        .from('contractor_profiles')
        .select('approved')
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Could not load contractor profile:', error.message);
        setContractorAccess('none');
        return;
      }

      if (!data) {
        setContractorAccess('none');
        return;
      }

      setContractorAccess(data.approved ? 'approved' : 'unapproved');
    };

    void loadContractorAccess();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  // Handle Role-Based Redirection
  useEffect(() => {
    if (!sessionReady || contractorAccess === 'loading') return;

    const protectedPath = isProtectedPath(pathname);
    const contractorInboxPath = isContractorInboxPath(pathname);

    // Redirect to login if accessing protected path while signed out
    if (!session && protectedPath) {
      router.replace('/login');
      return;
    }

    // Redirect to home if accessing login while signed in
    if (session && pathname === '/login') {
      router.replace('/');
      return;
    }

    // Redirect to home if a normal customer tries to access the contractor inbox
    if (session && contractorInboxPath && contractorAccess === 'none') {
      router.replace('/');
    }
  }, [contractorAccess, pathname, router, session, sessionReady]);

  if (!sessionReady || contractorAccess === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="contractors" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="my-requests" />
      <Stack.Screen name="contractor-requests" />
      <Stack.Screen name="admin-contractors" />
    </Stack>
  );
}

/**
 * RootLayout provides the SafeAreaProvider and the AuthGate.
 * It is wrapped with Sentry for production error monitoring.
 */
function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthGate />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
});
