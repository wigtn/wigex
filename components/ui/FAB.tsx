// Travel Helper v2.0 - FAB (Floating Action Button) Component

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

interface FABProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'small';
  style?: ViewStyle;
}

export function FAB({
  icon = 'add',
  onPress,
  variant = 'primary',
  size = 'normal',
  style,
}: FABProps) {
  const { colors, shadows, borderRadius, spacing } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getSize = () => (size === 'small' ? 48 : 56);
  const getIconSize = () => (size === 'small' ? 20 : 24);

  const backgroundColor = variant === 'primary' ? colors.primary : colors.secondary;
  const iconColor = colors.textInverse;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: getSize(),
          height: getSize(),
          borderRadius: borderRadius.full,
          backgroundColor,
          ...shadows.lg,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon} size={getIconSize()} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
