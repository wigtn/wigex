// Travel Helper v2.0 - AmountDisplay Component
// 현지 통화 우선 표시 + 원화 참고용

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';
import { getCurrencyInfo } from '../../lib/utils/constants';
import { formatCurrency, formatKRW } from '../../lib/utils/currency';

interface AmountDisplayProps {
  amount: number;
  currency: string;
  amountKRW?: number;
  size?: 'small' | 'medium' | 'large';
  showFlag?: boolean;
  align?: 'left' | 'right' | 'center';
  style?: ViewStyle;
  primaryColor?: string;
}

export function AmountDisplay({
  amount,
  currency,
  amountKRW,
  size = 'medium',
  showFlag = true,
  align = 'right',
  style,
  primaryColor,
}: AmountDisplayProps) {
  const { colors, typography, spacing } = useTheme();
  const currencyInfo = getCurrencyInfo(currency);

  const getTextStyles = () => {
    switch (size) {
      case 'small':
        return {
          primary: typography.titleSmall,
          secondary: typography.caption,
        };
      case 'large':
        return {
          primary: typography.displayMedium,
          secondary: typography.bodyMedium,
        };
      default:
        return {
          primary: typography.titleLarge,
          secondary: typography.caption,
        };
    }
  };

  const textStyles = getTextStyles();
  const textAlign = align;

  return (
    <View style={[styles.container, { alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }, style]}>
      {showFlag && currencyInfo && (
        <View style={styles.flagRow}>
          <Text style={styles.flag}>{currencyInfo.flag}</Text>
          <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>
            {currency}
          </Text>
        </View>
      )}
      <Text
        style={[
          textStyles.primary,
          { color: primaryColor || colors.text, textAlign },
        ]}
      >
        {formatCurrency(amount, currency)}
      </Text>
      {amountKRW !== undefined && (
        <Text
          style={[
            textStyles.secondary,
            { color: colors.textTertiary, textAlign },
          ]}
        >
          {formatKRW(amountKRW)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  flag: {
    fontSize: 14,
  },
});
