// Travel Helper v2.0 - Card Component

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useTheme } from '../../lib/theme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'highlighted';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'default', onPress, style }: CardProps) {
  const { colors, borderRadius, spacing, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          ...shadows.md,
        };
      case 'highlighted':
        return {
          backgroundColor: colors.primaryLight,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.surface,
          ...shadows.sm,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...getCardStyle(),
  };

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
