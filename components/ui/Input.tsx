// Travel Helper v2.0 - Input Component

import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  leftElement,
  rightElement,
  style,
  ...props
}: InputProps) {
  const { colors, borderRadius, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, typography.labelMedium, { color: colors.text }]}>
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
          {...props}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error && (
        <Text style={[styles.error, typography.caption, { color: colors.error }]}>
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
}

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
    minHeight: 48,
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
