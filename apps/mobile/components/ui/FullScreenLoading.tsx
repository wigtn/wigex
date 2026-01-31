// Travel Helper v2.0 - FullScreenLoading Component
// 전체 화면 로딩 인디케이터 (앱 초기 로딩, 데이터 동기화 등에 사용)

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

interface FullScreenLoadingProps {
  message?: string;
  showIcon?: boolean;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}

export const FullScreenLoading = React.memo(function FullScreenLoading({
  message = '로딩 중...',
  showIcon = true,
  iconName = 'flight-takeoff',
}: FullScreenLoadingProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible={true}
      accessibilityLabel={message}
      accessibilityRole="progressbar"
    >
      <View style={styles.content}>
        {showIcon && (
          <MaterialIcons
            name={iconName}
            size={48}
            color={colors.primary}
            style={styles.icon}
          />
        )}
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: spacing.lg }}
        />
        {message && (
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 8,
  },
});
