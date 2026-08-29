import * as Sentry from "@sentry/react-native";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

// 1. Initialize Sentry at the top
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
});

type ContractorAccess = 'loading' | 'none' | 'approved' | 'unapproved';

const isProtectedPath = (pathname: string) =>
  pathname === '/my-requests' ||
  pathname === '/contractor-requests' ||
  /^\/contractor\/[^/]+\/request$/.test(pathname);

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

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [contractorAccess, setContractorAccess] =
    useState<ContractorAccess>('none');

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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

      if (!active) {
        return;
      }

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

  useEffect(() => {
    if (!sessionReady || contractorAccess === 'loading') {
      return;
    }

    const protectedPath = isProtectedPath(pathname);
    const contractorInboxPath = isContractorInboxPath(pathname);

    if (!session && protectedPath) {
      router.replace('/login');
      return;
    }

    if (session && pathname === '/login') {
      router.replace('/');
      return;
    }

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

// 2. Define the RootLayout function
function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthGate />
    </SafeAreaProvider>
  );
}

// 3. Wrap and Export
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
