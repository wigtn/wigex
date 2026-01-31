// Travel Helper v2.0 - Button Component

import React, { useMemo, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { useSettingsStore } from '../../lib/stores/settingsStore';
import { TOUCH_TARGET } from '../../lib/constants/layout';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
}

export const Button = React.memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityHint,
}: ButtonProps) {
  const { colors, borderRadius, spacing } = useTheme();
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const handlePress = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [hapticEnabled, onPress]);

  // 스타일 계산을 메모이제이션
  const { backgroundColor, textColor, borderColor, sizeStyles, textSize, iconSize } = useMemo(() => {
    // Background color
    let bg: string;
    if (disabled) {
      bg = colors.border;
    } else {
      switch (variant) {
        case 'primary':
          bg = colors.primary;
          break;
        case 'secondary':
          bg = colors.secondaryLight;
          break;
        case 'danger':
          bg = colors.error;
          break;
        case 'outline':
        case 'ghost':
          bg = 'transparent';
          break;
        default:
          bg = colors.primary;
      }
    }

    // Text color
    let text: string;
    if (disabled) {
      text = colors.textSecondary;
    } else {
      switch (variant) {
        case 'primary':
        case 'danger':
          text = colors.textInverse;
          break;
        case 'secondary':
          text = colors.secondary;
          break;
        case 'outline':
          text = colors.text;
          break;
        case 'ghost':
          text = colors.primary;
          break;
        default:
          text = colors.textInverse;
      }
    }

    // Border color
    const border = variant === 'outline' ? colors.border : 'transparent';

    // Size styles
    let sizeStyle: ViewStyle;
    let tSize: number;
    let iSize: number;
    switch (size) {
      case 'small':
        sizeStyle = { paddingVertical: spacing.sm, paddingHorizontal: spacing.base };
        tSize = 14;
        iSize = 16;
        break;
      case 'large':
        sizeStyle = { paddingVertical: spacing.base, paddingHorizontal: spacing.xl };
        tSize = 18;
        iSize = 24;
        break;
      default:
        sizeStyle = { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
        tSize = 16;
        iSize = 20;
    }

    return {
      backgroundColor: bg,
      textColor: text,
      borderColor: border,
      sizeStyles: sizeStyle,
      textSize: tSize,
      iconSize: iSize,
    };
  }, [colors, disabled, variant, size, spacing]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles,
        {
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor,
          borderRadius: borderRadius.md,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityHint={accessibilityHint}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: textSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={textColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET.MIN_SIZE,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
