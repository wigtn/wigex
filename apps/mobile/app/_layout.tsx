// Travel Helper v2.0 - Root Layout (with Auth & Sync)

import { useEffect, useCallback, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../lib/theme";
import { useExchangeRateStore } from "../lib/stores/exchangeRateStore";
import { useTripStore } from "../lib/stores/tripStore";
import { useExpenseStore } from "../lib/stores/expenseStore";
import { useAuthStore } from "../lib/stores/authStore";
import { useSyncStore } from "../lib/stores/syncStore";
import { cleanupOldReceiptCache } from "../lib/utils/image";

function SplashScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.splash, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Auth state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initAuth = useAuthStore((state) => state.initialize);

  // Sync state
  const initSync = useSyncStore((state) => state.initialize);

  // Data stores - selector로 분리하여 불필요한 리렌더링 방지
  const loadRates = useExchangeRateStore((state) => state.loadRates);
  const loadTrips = useTripStore((state) => state.loadTrips);
  const loadAllDestinations = useTripStore((state) => state.loadAllDestinations);
  const activeTripId = useTripStore((state) => state.activeTrip?.id);
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);

  // 초기화 여부 추적 (중복 실행 방지)
  const hasInitializedAuth = useRef(false);
  const hasInitializedData = useRef(false);
  const syncCleanup = useRef<(() => void) | null>(null);

  // Initialize auth on app start (run once)
  useEffect(() => {
    if (hasInitializedAuth.current) return;
    hasInitializedAuth.current = true;

    initAuth();
    // Clean up old receipt cache (24+ hours old) - fire and forget
    cleanupOldReceiptCache().catch(() => {});
  }, [initAuth]);

  // Handle auth-based routing - segments 변경 최소화
  const currentSegment = segments[0];
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = currentSegment === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, redirect to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but on auth screen, redirect to main app
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, currentSegment, router]);

  // Initialize data when authenticated (한 번만 실행)
  useEffect(() => {
    if (!isAuthenticated || hasInitializedData.current) return;
    hasInitializedData.current = true;

    const initData = async () => {
      // Initialize sync
      syncCleanup.current = initSync();

      // 각각 독립적으로 실행 (하나가 실패해도 다른 것들은 실행됨)
      await Promise.allSettled([
        loadRates(),
        loadTrips(),
      ]);
    };
    initData();
  }, [isAuthenticated, initSync, loadRates, loadTrips]);

  // Reset data initialization flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasInitializedData.current = false;
      // Cleanup sync subscription
      if (syncCleanup.current) {
        syncCleanup.current();
        syncCleanup.current = null;
      }
    }
  }, [isAuthenticated]);

  // Load expenses when active trip changes
  useEffect(() => {
    if (!activeTripId || !isAuthenticated) return;
    loadExpenses(activeTripId);
  }, [activeTripId, isAuthenticated, loadExpenses]);

  // 네비게이션 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Show splash while initializing
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen
          name="trip/new"
          options={{
            title: "새 여행 만들기",
            presentation: "modal",
            headerLeft: () => (
              <TouchableOpacity
                onPress={handleBack}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="닫기"
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="trip/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="expense/new"
          options={{
            title: "지출 입력",
            presentation: "modal",
            headerLeft: () => (
              <TouchableOpacity
                onPress={handleBack}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="닫기"
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="calculator"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}
