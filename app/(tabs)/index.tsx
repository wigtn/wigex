// Travel Helper v2.0 - Home Screen

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { useTripStore } from '../../lib/stores/tripStore';
import { useExpenseStore } from '../../lib/stores/expenseStore';
import { useWalletStore } from '../../lib/stores/walletStore';
import { Card, FAB, ProgressBar, EmptyState, AmountDisplay, CategoryIcon } from '../../components/ui';
import { formatKRW, formatCurrency, getCurrencySymbol } from '../../lib/utils/currency';
import { formatDisplayDate, getDaysBetween } from '../../lib/utils/date';
import { getCurrencyInfo, CATEGORIES, PAYMENT_METHODS } from '../../lib/utils/constants';
import { Trip, Destination, WalletBalance } from '../../lib/types';

export default function HomeScreen() {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();
  const {
    activeTrip,
    activeTrips,
    trips,
    destinations,
    currentDestination,
    loadTrips,
    loadActiveTrips,
    setActiveTrip,
    getCurrentLocation,
  } = useTripStore();
  const { expenses, loadExpenses, getTodayTotal, getTotalByTrip, getExpensesByCurrency } = useExpenseStore();
  const { walletBalances, loadWallets } = useWalletStore();

  const [todayExpense, setTodayExpense] = useState<{ totalKRW: number; byCurrency: Record<string, number> }>({ totalKRW: 0, byCurrency: {} });
  const [totalExpense, setTotalExpense] = useState(0);
  const [expensesByCurrency, setExpensesByCurrency] = useState<Record<string, { amount: number; amountKRW: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [dayIndex, setDayIndex] = useState(1);

  const loadData = useCallback(async () => {
    if (activeTrip) {
      const today = await getTodayTotal(activeTrip.id);
      const total = await getTotalByTrip(activeTrip.id);
      const byCurrency = await getExpensesByCurrency(activeTrip.id);
      const location = await getCurrentLocation(activeTrip.id);

      setTodayExpense(today);
      setTotalExpense(total);
      setExpensesByCurrency(byCurrency);
      setDayIndex(location.dayIndex);
    }
  }, [activeTrip?.id]);

  useEffect(() => {
    loadData();
  }, [loadData, expenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    await loadActiveTrips();
    if (activeTrip) {
      await loadWallets(activeTrip.id);
      await loadExpenses(activeTrip.id);
    }
    await loadData();
    setRefreshing(false);
  };

  const handleTripSelect = (trip: Trip) => {
    setActiveTrip(trip);
  };

  const recentExpenses = expenses.slice(0, 5);
  const primaryCurrency = currentDestination?.currency || destinations[0]?.currency;
  const todayLocalAmount = primaryCurrency ? todayExpense.byCurrency[primaryCurrency] || 0 : 0;
  const totalLocalAmount = primaryCurrency ? expensesByCurrency[primaryCurrency]?.amount || 0 : 0;

  const getPaymentIcon = (method: string) => {
    const pm = PAYMENT_METHODS.find(p => p.id === method);
    return pm?.icon || 'payment';
  };

  const getPaymentLabel = (method: string) => {
    const pm = PAYMENT_METHODS.find(p => p.id === method);
    return pm?.label || method;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing.base }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTrips.length > 0 && activeTrip ? (
          <>
            {/* 여행 헤더 */}
            <View style={styles.tripHeader}>
              <Text style={[typography.headlineLarge, { color: colors.text }]}>
                {activeTrip.name}
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                {formatDisplayDate(activeTrip.startDate)} - {formatDisplayDate(activeTrip.endDate)} ({getDaysBetween(activeTrip.startDate, activeTrip.endDate)}일)
              </Text>
            </View>

            {/* 진행 중인 여행이 여러 개면 선택 탭 */}
            {activeTrips.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tripTabs}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                {activeTrips.map((trip) => {
                  const isSelected = activeTrip?.id === trip.id;
                  const dest = destinations.find(d => d.tripId === trip.id);
                  const flag = dest ? getCurrencyInfo(dest.currency)?.flag || '' : '';

                  return (
                    <TouchableOpacity
                      key={trip.id}
                      onPress={() => handleTripSelect(trip)}
                      style={[
                        styles.tripTab,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: borderRadius.lg,
                        },
                      ]}
                    >
                      <Text style={styles.tripTabFlag}>{flag}</Text>
                      <Text
                        style={[
                          typography.labelMedium,
                          { color: isSelected ? colors.primary : colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {trip.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* 현재 위치 + 오늘/총 지출 카드 */}
            <Card variant="elevated" style={{ marginTop: spacing.base }}>
              {/* 현재 위치 */}
              {currentDestination && (
                <View style={[styles.locationRow, { marginBottom: spacing.base }]}>
                  <Text style={styles.locationFlag}>
                    {getCurrencyInfo(currentDestination.currency)?.flag}
                  </Text>
                  <View>
                    <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                      현재 위치 (Day {dayIndex})
                    </Text>
                    <Text style={[typography.titleMedium, { color: colors.text }]}>
                      {currentDestination.city || currentDestination.country}
                    </Text>
                  </View>
                </View>
              )}

              {/* 오늘 지출 */}
              <View style={styles.expenseSection}>
                <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                  오늘 지출
                </Text>
                {primaryCurrency ? (
                  <AmountDisplay
                    amount={todayLocalAmount}
                    currency={primaryCurrency}
                    amountKRW={todayExpense.totalKRW}
                    size="large"
                    align="left"
                    primaryColor={colors.primary}
                    showFlag={false}
                  />
                ) : (
                  <Text style={[typography.displayMedium, { color: colors.primary }]}>
                    {formatKRW(todayExpense.totalKRW)}
                  </Text>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              {/* 총 지출 */}
              <View style={styles.expenseSection}>
                <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                  총 지출
                </Text>
                {primaryCurrency ? (
                  <AmountDisplay
                    amount={totalLocalAmount}
                    currency={primaryCurrency}
                    amountKRW={totalExpense}
                    size="medium"
                    align="left"
                    showFlag={false}
                  />
                ) : (
                  <Text style={[typography.titleLarge, { color: colors.text }]}>
                    {formatKRW(totalExpense)}
                  </Text>
                )}
              </View>

              {/* 예산 진행률 */}
              {activeTrip.budget && (
                <View style={{ marginTop: spacing.md }}>
                  <View style={styles.budgetRow}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      예산 {formatKRW(activeTrip.budget)}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {Math.round((totalExpense / activeTrip.budget) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={totalExpense / activeTrip.budget}
                    variant="budget"
                    height={6}
                  />
                </View>
              )}
            </Card>

            {/* 환전 지갑 */}
            {walletBalances.length > 0 && (
              <View style={{ marginTop: spacing.xl }}>
                <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.md }]}>
                  환전 지갑
                </Text>
                {walletBalances.map((wb) => {
                  const currencyInfo = getCurrencyInfo(wb.wallet.currency);
                  const usedAmount = wb.totalDeposit - wb.balance;
                  const progress = wb.totalDeposit > 0 ? wb.balance / wb.totalDeposit : 1;

                  return (
                    <Card
                      key={wb.wallet.id}
                      variant="outlined"
                      style={{ marginBottom: spacing.sm }}
                      onPress={() => router.push(`/trip/${activeTrip.id}`)}
                    >
                      <View style={styles.walletRow}>
                        <View style={styles.walletInfo}>
                          <View style={styles.walletHeader}>
                            <Text style={styles.walletFlag}>{currencyInfo?.flag}</Text>
                            <Text style={[typography.titleSmall, { color: colors.text }]}>
                              {wb.wallet.name || currencyInfo?.name || wb.wallet.currency}
                            </Text>
                          </View>
                          <Text style={[typography.titleMedium, { color: colors.text, marginTop: spacing.xs }]}>
                            {formatCurrency(wb.balance, wb.wallet.currency)}
                            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                              {' '}/ {formatCurrency(wb.totalDeposit, wb.wallet.currency)}
                            </Text>
                          </Text>
                        </View>
                        <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                          {Math.round(progress * 100)}%
                        </Text>
                      </View>
                      <ProgressBar
                        progress={progress}
                        variant="wallet"
                        height={6}
                        style={{ marginTop: spacing.sm }}
                      />
                    </Card>
                  );
                })}
              </View>
            )}

            {/* 최근 지출 */}
            <View style={{ marginTop: spacing.xl }}>
              <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.md }]}>
                최근 지출
              </Text>
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => {
                  const categoryInfo = CATEGORIES.find(c => c.id === expense.category);
                  const categoryColor = isDark ? categoryInfo?.darkColor : categoryInfo?.lightColor;

                  return (
                    <Card
                      key={expense.id}
                      variant="default"
                      style={{ marginBottom: spacing.sm }}
                      onPress={() => router.push(`/expense/${expense.id}`)}
                    >
                      <View style={styles.expenseRow}>
                        <CategoryIcon category={expense.category} size="medium" />
                        <View style={styles.expenseInfo}>
                          <Text style={[typography.titleSmall, { color: colors.text }]}>
                            {categoryInfo?.label}
                          </Text>
                          <View style={styles.expenseMeta}>
                            {expense.time && (
                              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                                {expense.time}
                              </Text>
                            )}
                            <Text style={[typography.caption, { color: colors.textTertiary }]}>
                              {getPaymentLabel(expense.paymentMethod)}
                            </Text>
                          </View>
                          {expense.memo && (
                            <Text
                              style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}
                              numberOfLines={1}
                            >
                              {expense.memo}
                            </Text>
                          )}
                        </View>
                        <AmountDisplay
                          amount={expense.amount}
                          currency={expense.currency}
                          amountKRW={expense.amountKRW}
                          size="small"
                          showFlag={false}
                        />
                      </View>
                    </Card>
                  );
                })
              ) : (
                <Card variant="outlined">
                  <View style={styles.emptyExpense}>
                    <MaterialIcons name="receipt-long" size={32} color={colors.textTertiary} />
                    <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                      아직 지출이 없어요
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          </>
        ) : (
          // 진행 중인 여행이 없을 때
          <EmptyState
            icon="flight-takeoff"
            title="여행을 시작해보세요"
            description="새 여행을 만들고 지출을 기록하세요"
            action={{
              label: '새 여행 만들기',
              onPress: () => router.push('/trip/new'),
            }}
          />
        )}

        {/* 지난 여행 */}
        {activeTrips.length === 0 && trips.length > 0 && (
          <View style={{ marginTop: spacing['2xl'] }}>
            <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.md }]}>
              지난 여행
            </Text>
            {trips.slice(0, 3).map((trip) => {
              const dest = destinations.find(d => d.tripId === trip.id);
              const flag = dest ? getCurrencyInfo(dest.currency)?.flag : '';

              return (
                <Card
                  key={trip.id}
                  variant="outlined"
                  style={{ marginBottom: spacing.sm }}
                  onPress={() => router.push(`/trip/${trip.id}`)}
                >
                  <View style={styles.pastTripRow}>
                    <Text style={styles.pastTripFlag}>{flag || '✈️'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.titleSmall, { color: colors.text }]}>
                        {trip.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {formatDisplayDate(trip.startDate)} - {formatDisplayDate(trip.endDate)}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB - 빠른 지출 입력 */}
      {activeTrips.length > 0 && (
        <FAB icon="add" onPress={() => router.push('/expense/new')} />
      )}
    </View>
  );
}

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
  tripHeader: {
    marginBottom: 8,
  },
  tripTabs: {
    marginVertical: 12,
  },
  tripTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
  },
  tripTabFlag: {
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationFlag: {
    fontSize: 32,
  },
  expenseSection: {
    marginVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletFlag: {
    fontSize: 20,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  emptyExpense: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pastTripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pastTripFlag: {
    fontSize: 28,
  },
});
