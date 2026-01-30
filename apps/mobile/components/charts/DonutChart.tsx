// Travel Helper v1.1 - Donut Chart Component
// 카테고리별 지출 비율을 도넛 차트로 표시

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../lib/theme';
import { formatKRW } from '../../lib/utils/currency';
import { Category } from '../../lib/utils/constants';

interface DonutChartData {
  category: Category;
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  totalAmount: number;
  size?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function DonutChart({ data, totalAmount, size = 140 }: DonutChartProps) {
  const { colors, typography, spacing } = useTheme();

  const strokeWidth = size * 0.18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // 각 세그먼트의 dash array 계산
  const segments = React.useMemo(() => {
    let cumulativePercentage = 0;
    return data.map((item) => {
      const startAngle = cumulativePercentage * 3.6; // 퍼센트를 각도로 (360/100 = 3.6)
      const dashLength = (item.percentage / 100) * circumference;
      const gapLength = circumference - dashLength;
      const rotation = -90 + (cumulativePercentage / 100) * 360;
      cumulativePercentage += item.percentage;
      return {
        ...item,
        dashArray: `${dashLength} ${gapLength}`,
        rotation,
      };
    });
  }, [data, circumference]);

  // 빈 데이터일 경우
  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartSection}>
        {/* 도넛 차트 */}
        <View style={[styles.chartWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            {/* 배경 원 */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* 각 카테고리 세그먼트 */}
            {segments.map((segment, index) => (
              <Circle
                key={segment.category}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={segment.dashArray}
                strokeLinecap="butt"
                rotation={segment.rotation}
                origin={`${center}, ${center}`}
              />
            ))}
          </Svg>
          {/* 중앙 텍스트 */}
          <View style={styles.centerText}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>총 지출</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatKRW(totalAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* 범례 */}
      <View style={[styles.legendSection, { marginLeft: spacing.md }]}>
        {data.slice(0, 5).map((item) => (
          <View key={item.category} style={[styles.legendItem, { marginBottom: spacing.xs }]}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendTextWrapper}>
              <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                {item.percentage}%
              </Text>
            </View>
          </View>
        ))}
        {data.length > 5 && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            외 {data.length - 5}개
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  legendSection: {
    flex: 1,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '400',
  },
});
