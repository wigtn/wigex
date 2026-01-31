// Travel Helper v2.0 - ProgressBar Component

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { useTheme } from '../../lib/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: 'default' | 'wallet' | 'budget';
  showLabel?: boolean;
  height?: number;
  color?: string;  // Custom color override
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const ProgressBar = React.memo(function ProgressBar({
  progress,
  variant = 'default',
  showLabel = false,
  height = 8,
  color,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const { colors, borderRadius } = useTheme();

  // 값 클램핑을 메모이제이션
  const { clampedProgress, percentage } = useMemo(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    return {
      clampedProgress: clamped,
      percentage: Math.round(clamped * 100),
    };
  }, [progress]);

  // 색상 계산을 메모이제이션
  const fillColor = useMemo(() => {
    // Custom color override
    if (color) return color;

    switch (variant) {
      case 'wallet':
        if (clampedProgress <= 0.1) return colors.error;
        if (clampedProgress <= 0.3) return colors.warning;
        return colors.primary;
      case 'budget':
        if (clampedProgress > 1) return colors.error;
        if (clampedProgress >= 0.8) return colors.warning;
        return colors.secondary;
      default:
        return colors.primary;
    }
  }, [color, variant, clampedProgress, colors]);

  // 상태 텍스트 생성
  const statusText = useMemo(() => {
    if (variant === 'budget') {
      if (clampedProgress > 1) return '예산 초과';
      if (clampedProgress >= 0.8) return '예산 경고';
      return '정상';
    }
    if (variant === 'wallet') {
      if (clampedProgress <= 0.1) return '잔액 부족';
      if (clampedProgress <= 0.3) return '잔액 주의';
      return '정상';
    }
    return '';
  }, [variant, clampedProgress]);

  const a11yLabel = accessibilityLabel || `진행률 ${percentage}%${statusText ? `, ${statusText}` : ''}`;

  return (
    <View
      style={style}
      accessible={true}
      accessibilityLabel={a11yLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: percentage, min: 0, max: 100 }}
    >
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: colors.borderLight,
            borderRadius: borderRadius.sm,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: fillColor,
              borderRadius: borderRadius.sm,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {percentage}%
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
