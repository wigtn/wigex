// Travel Helper v2.0 - FAB (Floating Action Button) Component

import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { useSettingsStore } from '../../lib/stores/settingsStore';
import { FAB_CONSTANTS } from '../../lib/constants/layout';

interface FABProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'small';
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const FAB = React.memo(function FAB({
  icon = 'add',
  onPress,
  variant = 'primary',
  size = 'normal',
  style,
  accessibilityLabel = '추가',
  accessibilityHint,
}: FABProps) {
  const { colors, shadows, borderRadius } = useTheme();
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handlePress = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [hapticEnabled, onPress]);

  const fabSize = size === 'small' ? FAB_CONSTANTS.SIZE_SMALL : FAB_CONSTANTS.SIZE;
  const iconSize = size === 'small' ? 20 : 24;

  const backgroundColor = variant === 'primary' ? colors.primary : colors.secondary;
  const iconColor = colors.textInverse;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: borderRadius.full,
          backgroundColor,
          ...shadows.lg,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
    >
      <MaterialIcons name={icon} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: FAB_CONSTANTS.BOTTOM_POSITION,
    right: FAB_CONSTANTS.RIGHT_POSITION,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
