// Travel Helper v2.0 - SelectableListItem Component
// BottomSheet 내 선택 가능한 리스트 아이템 공통 컴포넌트

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { useSettingsStore } from '../../lib/stores/settingsStore';
import { TOUCH_TARGET } from '../../lib/constants/layout';

interface SelectableListItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const SelectableListItem = React.memo(function SelectableListItem({
  title,
  subtitle,
  onPress,
  selected = false,
  disabled = false,
  leftElement,
  rightElement,
  style,
  accessibilityLabel,
  accessibilityHint,
}: SelectableListItemProps) {
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
          backgroundColor: selected ? colors.primaryLight : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: borderRadius.md,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${title}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
    >
      {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
      <View style={styles.textContainer}>
        <Text
          style={[
            typography.titleSmall,
            { color: disabled ? colors.textTertiary : colors.text },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      {selected && !rightElement && (
        <MaterialIcons
          name="check"
          size={20}
          color={colors.primary}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: TOUCH_TARGET.MIN_SIZE,
  },
  leftElement: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  rightElement: {
    marginLeft: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
