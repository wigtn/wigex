// Main Screen Revamp - 글로벌 홈 화면
// PRD FR-101~FR-109: 지도 + 여행 리스트 + 자동 전환

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { useTripStore } from '../../lib/stores/tripStore';
import { Trip, getTripStatus } from '../../lib/types';
import { TripMapView } from '../../components/map';
import { TripCard } from '../../components/home';
import { Card, EmptyState, FullScreenLoading } from '../../components/ui';

export default function GlobalHomeScreen() {
  const { colors, spacing, typography, borderRadius } = useTheme();

  // 스토어에서 필요한 상태만 개별적으로 구독 (리렌더링 최소화)
  const trips = useTripStore((state) => state.trips);
  const destinations = useTripStore((state) => state.destinations);
  const error = useTripStore((state) => state.error);
  const loadTrips = useTripStore((state) => state.loadTrips);
  const hasAutoNavigatedToTrip = useTripStore((state) => state.hasAutoNavigatedToTrip);
  const setHasAutoNavigatedToTrip = useTripStore((state) => state.setHasAutoNavigatedToTrip);

  const [refreshing, setRefreshing] = useState(false);
  const [isFirstLoadComplete, setIsFirstLoadComplete] = useState(false);

  // 자동 네비게이션 실행 여부 추적 (ref로 관리하여 렌더링에 영향 없음)
  const hasTriggeredAutoNav = useRef(false);
  const hasStartedLoading = useRef(false);

  // 초기 데이터 로딩 - 컴포넌트에서 직접 관리
  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    loadTrips().finally(() => {
      setIsFirstLoadComplete(true);
    });
  }, [loadTrips]);

  // 여행을 상태별로 분류 - trips가 변경될 때만 재계산
  const categorizedTrips = useMemo(() => {
    const active: Trip[] = [];
    const upcoming: Trip[] = [];
    const past: Trip[] = [];

    for (const trip of trips) {
      const status = getTripStatus(trip);
      if (status === 'active') active.push(trip);
      else if (status === 'upcoming') upcoming.push(trip);
      else past.push(trip);
    }

    // 정렬: active는 시작일 순, upcoming은 시작일 순, past는 종료일 역순
    active.sort((a, b) => a.startDate.localeCompare(b.startDate));
    upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate));
    past.sort((a, b) => b.endDate.localeCompare(a.endDate));

    return { active, upcoming, past };
  }, [trips]);

  // 앱 실행 시 자동 여행 모드 전환 (앱 실행 중 1회만)
  // 의존성을 최소화하고 ref를 사용하여 무한 루프 방지
  useEffect(() => {
    // 초기 로딩 안됐거나, 이미 자동 네비게이션을 시도했으면 무시
    if (!isFirstLoadComplete || hasTriggeredAutoNav.current) return;

    // 스토어에서 이미 자동 네비게이션을 했다면 무시
    if (hasAutoNavigatedToTrip) {
      hasTriggeredAutoNav.current = true;
      return;
    }

    // 활성 여행이 있는 경우에만 자동 전환
    if (categorizedTrips.active.length > 0) {
      hasTriggeredAutoNav.current = true;
      const activeTrip = categorizedTrips.active[0];
      setHasAutoNavigatedToTrip(true);
      // 자동 전환 - 여행 메인 화면으로 이동
      router.replace(`/trip/${activeTrip.id}/main`);
    }
  }, [isFirstLoadComplete, hasAutoNavigatedToTrip, categorizedTrips.active.length, setHasAutoNavigatedToTrip]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTrips();
    } finally {
      setRefreshing(false);
    }
  }, [loadTrips]);

  const handleTripPress = useCallback((tripId: string) => {
    router.push(`/trip/${tripId}/main`);
  }, []);

  const handleMarkerPress = useCallback((tripId: string) => {
    router.push(`/trip/${tripId}/main`);
  }, []);

  const handleCreateTrip = useCallback(() => {
    router.push('/trip/new');
  }, []);

  // 초기 로딩 중 (아직 데이터를 한 번도 불러오지 않은 상태)
  if (!isFirstLoadComplete) {
    return <FullScreenLoading message="여행 정보를 불러오는 중..." iconName="flight-takeoff" />;
  }

  const hasTrips = trips.length > 0;
  const hasError = !!error && trips.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing.base }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 앱 헤더 */}
        <View style={styles.header}>
          <Text style={[typography.headlineLarge, { color: colors.text }]}>
            WIGEX
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            내 여행 경비 관리
          </Text>
        </View>

        {hasTrips ? (
          <>
            {/* 지도 영역 */}
            <Card variant="outlined" style={{ marginTop: spacing.lg, padding: 0, overflow: 'hidden' }}>
              <TripMapView
                trips={trips}
                destinations={destinations}
                onMarkerPress={handleMarkerPress}
                style={{ height: 200 }}
              />
            </Card>

            {/* 현재 여행 섹션 */}
            {categorizedTrips.active.length > 0 && (
              <>
                <SectionHeader
                  title="현재 여행"
                  icon="flight-takeoff"
                  iconColor={colors.primary}
                  count={categorizedTrips.active.length}
                  spacing={spacing}
                  typography={typography}
                  colors={colors}
                />
                {categorizedTrips.active.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    destinations={destinations}
                    status="active"
                    onPress={() => handleTripPress(trip.id)}
                  />
                ))}
              </>
            )}

            {/* 예정된 여행 섹션 */}
            {categorizedTrips.upcoming.length > 0 && (
              <>
                <SectionHeader
                  title="예정된 여행"
                  icon="event"
                  iconColor="#4DABF7"
                  count={categorizedTrips.upcoming.length}
                  spacing={spacing}
                  typography={typography}
                  colors={colors}
                />
                {categorizedTrips.upcoming.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    destinations={destinations}
                    status="upcoming"
                    onPress={() => handleTripPress(trip.id)}
                  />
                ))}
              </>
            )}

            {/* 과거 여행 섹션 */}
            {categorizedTrips.past.length > 0 && (
              <>
                <SectionHeader
                  title="과거 여행"
                  icon="history"
                  iconColor={colors.textTertiary}
                  count={categorizedTrips.past.length}
                  spacing={spacing}
                  typography={typography}
                  colors={colors}
                />
                {categorizedTrips.past.slice(0, 5).map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    destinations={destinations}
                    status="past"
                    onPress={() => handleTripPress(trip.id)}
                  />
                ))}
                {categorizedTrips.past.length > 5 && (
                  <TouchableOpacity
                    style={[styles.showMoreButton, { borderColor: colors.border }]}
                    onPress={() => {/* TODO: 전체 여행 목록 화면 */}}
                    accessibilityLabel={`과거 여행 ${categorizedTrips.past.length - 5}개 더보기`}
                    accessibilityRole="button"
                  >
                    <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                      더보기 ({categorizedTrips.past.length - 5}개)
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* 새 여행 만들기 버튼 */}
            <TouchableOpacity
              style={[
                styles.createTripButton,
                {
                  backgroundColor: colors.primaryLight,
                  borderRadius: borderRadius.lg,
                  marginTop: spacing.xl,
                },
              ]}
              onPress={handleCreateTrip}
              accessibilityLabel="새 여행 만들기"
              accessibilityRole="button"
            >
              <MaterialIcons name="add" size={24} color={colors.primary} />
              <Text style={[typography.labelLarge, { color: colors.primary }]}>
                새 여행 만들기
              </Text>
            </TouchableOpacity>
          </>
        ) : hasError ? (
          /* 에러 발생 시 */
          <EmptyState
            icon="error-outline"
            title="데이터를 불러올 수 없습니다"
            description={error || '네트워크 연결을 확인하고 다시 시도해주세요'}
            action={{
              label: '다시 시도',
              onPress: onRefresh,
            }}
          />
        ) : (
          /* 여행이 없을 때 */
          <EmptyState
            icon="flight-takeoff"
            title="여행을 시작해보세요"
            description="새 여행을 만들고 지출을 기록하세요"
            action={{
              label: '새 여행 만들기',
              onPress: handleCreateTrip,
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

// 섹션 헤더 컴포넌트 분리 (React.memo 적용)
import React from 'react';

interface SectionHeaderProps {
  title: string;
  icon: string;
  iconColor: string;
  count: number;
  spacing: any;
  typography: any;
  colors: any;
}

const SectionHeader = React.memo(function SectionHeader({
  title,
  icon,
  iconColor,
  count,
  spacing,
  typography,
  colors,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + '20' }]}>
          <MaterialIcons name={icon as any} size={16} color={iconColor} />
        </View>
        <Text style={[typography.titleMedium, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[typography.labelSmall, { color: colors.textTertiary }]}>{count}개</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  showMoreButton: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
});
