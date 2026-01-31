// Travel Helper v2.0 - Card Component

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable, AccessibilityRole } from 'react-native';
import { useTheme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'highlighted';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
}

export const Card = React.memo(function Card({
  children,
  variant = 'default',
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessible,
  accessibilityRole,
}: CardProps) {
  const { colors, borderRadius, spacing, shadows } = useTheme();

  const cardStyle = useMemo((): ViewStyle => {
    let variantStyle: ViewStyle;

    switch (variant) {
      case 'outlined':
        variantStyle = {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'elevated':
        variantStyle = {
          backgroundColor: colors.surfaceElevated,
          ...shadows.md,
        };
        break;
      case 'highlighted':
        variantStyle = {
          backgroundColor: colors.primaryLight,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        };
        break;
      default:
        variantStyle = {
          backgroundColor: colors.surface,
          ...shadows.sm,
        };
    }

    return {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...variantStyle,
    };
  }, [variant, colors, borderRadius, spacing, shadows]);

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[cardStyle, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
