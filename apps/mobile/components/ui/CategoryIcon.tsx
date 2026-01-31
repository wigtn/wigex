// Travel Helper v2.0 - CategoryIcon Component

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { Category, CATEGORIES } from '../../lib/utils/constants';

interface CategoryIconProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
}

// 사이즈 상수
const SIZES = {
  small: { container: 32, icon: 16 },
  medium: { container: 40, icon: 20 },
  large: { container: 56, icon: 28 },
} as const;

export const CategoryIcon = React.memo(function CategoryIcon({
  category,
  size = 'medium',
  showLabel = false,
  style,
}: CategoryIconProps) {
  const { colors, borderRadius, isDark } = useTheme();

  const categoryInfo = useMemo(() => {
    return CATEGORIES.find(c => c.id === category);
  }, [category]);

  if (!categoryInfo) return null;

  const categoryColor = isDark ? categoryInfo.darkColor : categoryInfo.lightColor;
  const dimensions = SIZES[size];

  return (
    <View
      style={[styles.wrapper, style]}
      accessible={true}
      accessibilityLabel={categoryInfo.label}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.container,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderRadius: borderRadius.lg,
            backgroundColor: categoryColor + '20', // 20% opacity
          },
        ]}
      >
        <MaterialIcons
          name={categoryInfo.icon as keyof typeof MaterialIcons.glyphMap}
          size={dimensions.icon}
          color={categoryColor}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {categoryInfo.label}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
