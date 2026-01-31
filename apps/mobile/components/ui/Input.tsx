// Travel Helper v2.0 - Input Component

import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';
import { INPUT } from '../../lib/constants/layout';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.memo(function Input({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  leftElement,
  rightElement,
  style,
  accessibilityLabel,
  ...props
}: InputProps) {
  const { colors, borderRadius, typography } = useTheme();

  // 접근성 레이블 생성
  const a11yLabel = accessibilityLabel || label;
  const a11yHint = error || helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[styles.label, typography.labelMedium, { color: colors.text }]}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            borderRadius: borderRadius.md,
          },
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <TextInput
          style={[
            styles.input,
            typography.bodyLarge,
            {
              color: colors.text,
              flex: 1,
            },
            inputStyle,
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={a11yLabel}
          accessibilityHint={a11yHint}
          accessibilityState={{ disabled: props.editable === false }}
          {...props}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error && (
        <Text
          style={[styles.error, typography.caption, { color: colors.error }]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text style={[styles.helper, typography.caption, { color: colors.textSecondary }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: INPUT.MIN_HEIGHT,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftElement: {
    paddingLeft: 12,
  },
  rightElement: {
    paddingRight: 12,
  },
  error: {
    marginTop: 4,
  },
  helper: {
    marginTop: 4,
  },
});
