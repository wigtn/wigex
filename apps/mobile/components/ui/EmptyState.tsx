// Travel Helper v2.0 - EmptyState Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState = React.memo(function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[styles.container, { padding: spacing['2xl'] }]}
      accessible={true}
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
      accessibilityRole="text"
    >
      <MaterialIcons
        name={icon}
        size={64}
        color={colors.textTertiary}
        style={styles.icon}
        importantForAccessibility="no"
      />
      <Text
        style={[
          styles.title,
          typography.titleMedium,
          { color: colors.text, marginTop: spacing.md },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            typography.bodyMedium,
            { color: colors.textSecondary, marginTop: spacing.sm },
          ]}
        >
          {description}
        </Text>
      )}
      {action && (
        <View style={{ marginTop: spacing.lg }}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
