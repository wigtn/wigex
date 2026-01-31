// Travel Helper v2.0 - SelectorButton Component
// 날짜, 시간, 카테고리 등 선택 버튼 공통 컴포넌트

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { useSettingsStore } from '../../lib/stores/settingsStore';
import { TOUCH_TARGET } from '../../lib/constants/layout';

interface SelectorButtonProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  showChevron?: boolean;
  leftElement?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const SelectorButton = React.memo(function SelectorButton({
  icon,
  label,
  onPress,
  disabled = false,
  style,
  showChevron = false,
  leftElement,
  accessibilityLabel,
  accessibilityHint,
}: SelectorButtonProps) {
  const { colors, borderRadius, typography, spacing } = useTheme();
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handlePress = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [hapticEnabled, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {leftElement}
      {icon && !leftElement && (
        <MaterialIcons
          name={icon}
          size={20}
          color={colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          typography.labelMedium,
          styles.label,
          { color: disabled ? colors.textTertiary : colors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {showChevron && (
        <MaterialIcons
          name="expand-more"
          size={20}
          color={colors.textSecondary}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: TOUCH_TARGET.MIN_SIZE,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
