// Travel Helper - Settings Screen

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { useTripStore } from '../../lib/stores/tripStore';
import { useWalletStore } from '../../lib/stores/walletStore';
import { useExchangeRateStore } from '../../lib/stores/exchangeRateStore';
import { Card, Button, BottomSheet, ProgressBar } from '../../components/ui';
import { formatCurrency, getCurrencyFlag, getCurrencySymbol } from '../../lib/utils/currency';
import { CURRENCIES } from '../../lib/utils/constants';
import { Wallet } from '../../lib/types';

export default function SettingsScreen() {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();
  const { trips, activeTrip, destinations } = useTripStore();
  const { wallets, walletBalances, createWallet, loadWallets, addDeposit } = useWalletStore();
  const { lastUpdated, loadRates } = useExchangeRateStore();

  // 지갑 추가 모달
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [walletName, setWalletName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');

  // 입금 모달
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositExchangeRate, setDepositExchangeRate] = useState('');

  const handleRefreshRates = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadRates();
    Alert.alert('완료', '환율이 업데이트되었습니다');
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '없음';
    const date = new Date(lastUpdated);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddWallet = () => {
    if (!activeTrip) {
      Alert.alert('알림', '먼저 여행을 선택해주세요');
      return;
    }
    // 여행의 방문지 통화들 중 아직 지갑이 없는 것들 필터링
    const tripCurrencies = destinations.map(d => d.currency);
    const existingCurrencies = wallets.map(w => w.currency);
    const availableCurrencies = [...new Set(tripCurrencies)].filter(
      c => !existingCurrencies.includes(c)
    );

    if (availableCurrencies.length > 0) {
      setSelectedCurrency(availableCurrencies[0]);
    } else if (CURRENCIES.length > 0) {
      setSelectedCurrency(CURRENCIES[0].code);
    }

    setWalletName('');
    setInitialAmount('');
    setShowWalletModal(true);
  };

  const handleSaveWallet = async () => {
    if (!activeTrip || !selectedCurrency) return;

    try {
      const wallet = await createWallet({
        tripId: activeTrip.id,
        currency: selectedCurrency,
        name: walletName.trim() || undefined,
      });

      // 초기 금액이 있으면 입금 처리
      if (initialAmount && parseFloat(initialAmount) > 0) {
        const rate = depositExchangeRate ? parseFloat(depositExchangeRate) : undefined;
        await addDeposit(wallet.id, parseFloat(initialAmount), rate, '초기 입금');
      }

      // 지갑 목록 새로고침
      await loadWallets(activeTrip.id);

      setShowWalletModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('오류', '지갑 생성에 실패했습니다');
    }
  };

  const handleOpenDeposit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setDepositAmount('');
    setDepositExchangeRate('');
    setShowDepositModal(true);
  };

  const handleSaveDeposit = async () => {
    if (!selectedWallet || !depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('알림', '입금액을 입력해주세요');
      return;
    }

    try {
      const rate = depositExchangeRate ? parseFloat(depositExchangeRate) : undefined;
      await addDeposit(selectedWallet.id, parseFloat(depositAmount), rate, '환전 입금');
      setShowDepositModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('오류', '입금에 실패했습니다');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { padding: spacing.base }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 지갑 관리 */}
      {activeTrip && (
        <>
          <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm }]}>
            지갑 관리
          </Text>
          <Card style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={[typography.titleSmall, { color: colors.text }]}>
                {activeTrip.name} 지갑
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
                onPress={handleAddWallet}
              >
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {wallets.length === 0 ? (
              <View style={[styles.emptyWallet, { borderColor: colors.border }]}>
                <MaterialIcons name="account-balance-wallet" size={32} color={colors.textTertiary} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  아직 지갑이 없습니다
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>
                  환전한 현금을 관리하려면 지갑을 추가하세요
                </Text>
              </View>
            ) : (
              wallets.map((wallet) => {
                const balance = walletBalances.find(wb => wb.wallet.id === wallet.id);
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleOpenDeposit(wallet)}
                  >
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletFlag}>{getCurrencyFlag(wallet.currency)}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyMedium, { color: colors.text }]}>
                          {wallet.name || `${wallet.currency} 지갑`}
                        </Text>
                        <Text style={[typography.titleMedium, { color: colors.primary }]}>
                          {formatCurrency(balance?.balance || 0, wallet.currency)}
                        </Text>
                        {balance && balance.totalDeposit > 0 && (
                          <ProgressBar
                            progress={balance.balance / balance.totalDeposit}
                            color={colors.primary}
                            height={4}
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </View>
                      <MaterialIcons name="add-circle-outline" size={24} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>
        </>
      )}

      {/* 여행 관리 */}
      <Text style={[typography.labelMedium, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        여행 관리
      </Text>
      <Card style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/trip/new')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </View>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>새 여행 만들기</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </TouchableOpacity>

        {trips.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.base, marginTop: spacing.sm }]}>
              여행 목록
            </Text>
            {trips.map((trip, index) => (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripItem,
                  index < trips.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
                onPress={() => router.push(`/trip/${trip.id}`)}
              >
                <View style={styles.tripInfo}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>
                    {trip.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {trip.startDate} ~ {trip.endDate}
                  </Text>
                </View>
                {activeTrip?.id === trip.id && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.activeBadgeText}>활성</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </Card>

      {/* 환율 */}
      <Text style={[typography.labelMedium, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        환율
      </Text>
      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondaryLight }]}>
              <MaterialIcons name="currency-exchange" size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>환율 정보</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                마지막 업데이트: {formatLastUpdated()}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.menuItem} onPress={handleRefreshRates}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
              <MaterialIcons name="refresh" size={20} color={colors.accent} />
            </View>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>환율 새로고침</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </TouchableOpacity>
      </Card>

      {/* 앱 정보 */}
      <Text style={[typography.labelMedium, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
        앱 정보
      </Text>
      <Card style={styles.menuCard}>
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="info" size={20} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>버전</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>2.0.0</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="palette" size={20} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>테마</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {isDark ? '다크 모드' : '라이트 모드'} (시스템 설정)
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* 도움말 */}
      <Card style={[styles.helpCard, { backgroundColor: colors.surface, marginTop: spacing.lg }]}>
        <MaterialIcons name="lightbulb" size={24} color={colors.warning} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600' }]}>
            알고 계셨나요?
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            환율은 하루에 한 번 자동으로 업데이트됩니다.{'\n'}
            지갑에 환전 금액을 기록하면 잔액을 쉽게 관리할 수 있어요.
          </Text>
        </View>
      </Card>

      {/* 하단 여백 */}
      <View style={{ height: 100 }} />

      {/* 지갑 추가 모달 */}
      <BottomSheet
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="지갑 추가"
      >
        <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm }]}>
          통화 선택
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {CURRENCIES.slice(0, 10).map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.currencyChip,
                {
                  backgroundColor: selectedCurrency === c.code ? colors.primaryLight : colors.surface,
                  borderColor: selectedCurrency === c.code ? colors.primary : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
              onPress={() => setSelectedCurrency(c.code)}
            >
              <Text style={styles.currencyChipFlag}>{c.flag}</Text>
              <Text
                style={[
                  typography.labelSmall,
                  { color: selectedCurrency === c.code ? colors.primary : colors.text },
                ]}
              >
                {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm }]}>
          지갑 이름 (선택)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.md },
          ]}
          value={walletName}
          onChangeText={setWalletName}
          placeholder={`예: ${selectedCurrency} 현금`}
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md }]}>
          초기 금액 (선택)
        </Text>
        <View style={styles.inputRow}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            {getCurrencySymbol(selectedCurrency)}
          </Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.md, marginLeft: spacing.sm },
            ]}
            value={initialAmount}
            onChangeText={setInitialAmount}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>

        <Button
          title="지갑 추가"
          onPress={handleSaveWallet}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </BottomSheet>

      {/* 입금 모달 */}
      <BottomSheet
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={`${selectedWallet?.name || selectedWallet?.currency} 지갑에 입금`}
      >
        <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm }]}>
          입금액
        </Text>
        <View style={styles.inputRow}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            {getCurrencySymbol(selectedWallet?.currency || 'USD')}
          </Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.md, marginLeft: spacing.sm },
            ]}
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <Text style={[typography.labelMedium, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md }]}>
          환전 환율 (선택)
        </Text>
        <View style={styles.inputRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            1 {selectedWallet?.currency} =
          </Text>
          <TextInput
            style={[
              styles.input,
              { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: borderRadius.md, marginLeft: spacing.sm },
            ]}
            value={depositExchangeRate}
            onChangeText={setDepositExchangeRate}
            placeholder="환율 입력"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
            원
          </Text>
        </View>

        <Button
          title="입금하기"
          onPress={handleSaveDeposit}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  walletCard: {
    padding: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWallet: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  walletItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingLeft: 64,
  },
  tripInfo: {
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  currencyChipFlag: {
    fontSize: 18,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
