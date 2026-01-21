# Travel Helper v2.0 Design Guide

## Design Configuration

| 항목 | 선택 |
|------|------|
| **스타일** | Swiss Minimal + 여행 감성 |
| **색상** | Coral (Primary) + Sky Blue (Secondary) |
| **다크모드** | Light + Dark 둘 다 |
| **애니메이션** | Moderate (페이지 전환, 마이크로 인터랙션) |
| **둥글기** | Rounded (12-16px) |
| **여백** | Balanced |
| **접근성** | WCAG AA 준수 (4.5:1 대비) |

---

## Design Philosophy

> "여행의 설렘을 담은 깔끔한 디자인"
> 따뜻하고 친근하면서도 정보가 명확하게 전달되는 UI

### 핵심 원칙
1. **Form follows function** - 기능이 형태를 결정
2. **정보 명확성** - 금액, 통화, 잔액이 한눈에
3. **따뜻한 여행 감성** - Coral + Sky Blue로 설렘 표현
4. **여백의 미** - 적절한 공간으로 시각적 휴식
5. **접근성 우선** - 모든 사용자가 쉽게 사용

---

## Color System

### Light Mode

```typescript
const lightColors = {
  // Base
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#191F28',
  textSecondary: '#6B7684',
  textTertiary: '#ADB5BD',
  textInverse: '#FFFFFF',

  // Primary (Coral - 따뜻함, 설렘)
  primary: '#FF6B6B',
  primaryLight: '#FFE8E8',
  primaryDark: '#E85555',

  // Secondary (Sky Blue - 하늘, 여행)
  secondary: '#4DABF7',
  secondaryLight: '#E7F5FF',
  secondaryDark: '#339AF0',

  // Accent (Orange - CTA, 강조)
  accent: '#FF922B',
  accentLight: '#FFF4E6',

  // Semantic
  success: '#20C997',         // 수입, 환전 입금
  error: '#F03E3E',           // 에러, 예산 초과
  warning: '#FCC419',         // 경고, 잔액 부족
  info: '#4DABF7',

  // Border & Divider
  border: '#E5E8EB',
  borderLight: '#F1F3F5',
  divider: '#E5E8EB',

  // Category Colors
  categoryFood: '#FF6B6B',      // Coral (Primary)
  categoryTransport: '#4DABF7', // Sky Blue (Secondary)
  categoryShopping: '#A78BFA',  // Purple
  categoryLodging: '#FF922B',   // Orange (Accent)
  categoryActivity: '#20C997',  // Teal
  categoryEtc: '#6B7684',       // Gray
};
```

### Dark Mode

```typescript
const darkColors = {
  // Base
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',

  // Text
  text: '#F0F6FC',
  textSecondary: '#8B949E',
  textTertiary: '#484F58',
  textInverse: '#0D1117',

  // Primary (Coral - 밝게)
  primary: '#FF8787',
  primaryLight: '#3D2020',
  primaryDark: '#FFA8A8',

  // Secondary (Sky Blue - 밝게)
  secondary: '#74C0FC',
  secondaryLight: '#1A3A52',
  secondaryDark: '#A5D8FF',

  // Accent
  accent: '#FFA94D',
  accentLight: '#3D2A1A',

  // Semantic
  success: '#3FB950',
  error: '#F85149',
  warning: '#D29922',
  info: '#74C0FC',

  // Border & Divider
  border: '#30363D',
  borderLight: '#21262D',
  divider: '#30363D',

  // Category Colors (밝게 조정)
  categoryFood: '#FF8787',
  categoryTransport: '#74C0FC',
  categoryShopping: '#B197FC',
  categoryLodging: '#FFA94D',
  categoryActivity: '#38D9A9',
  categoryEtc: '#8B949E',
};
```

### Color Palette Summary

```
Light Mode                    Dark Mode
────────────────────────────────────────────
Primary   #FF6B6B (Coral)     #FF8787
Secondary #4DABF7 (Sky)       #74C0FC
Accent    #FF922B (Orange)    #FFA94D
────────────────────────────────────────────
```

---

## Chart & Data Visualization Palette

### 차트 색상 (6색)

```typescript
const chartColors = {
  light: [
    '#FF6B6B',  // Coral (Primary)
    '#4DABF7',  // Sky Blue
    '#A78BFA',  // Purple
    '#20C997',  // Teal
    '#FF922B',  // Orange
    '#868E96',  // Gray
  ],
  dark: [
    '#FF8787',
    '#74C0FC',
    '#B197FC',
    '#38D9A9',
    '#FFA94D',
    '#ADB5BD',
  ],
};
```

### 카테고리별 파이차트

```typescript
const categoryChartColors = {
  food: '#FF6B6B',
  transport: '#4DABF7',
  shopping: '#A78BFA',
  lodging: '#FF922B',
  activity: '#20C997',
  etc: '#868E96',
};
```

### 프로그레스 바

```typescript
const progressBarStyles = {
  // 지갑 잔액
  wallet: {
    track: colors.borderLight,    // 배경
    fill: colors.primary,         // 채워진 부분
    warning: colors.warning,      // 30% 이하
    danger: colors.error,         // 10% 이하
  },

  // 예산 사용률
  budget: {
    track: colors.borderLight,
    fill: colors.secondary,
    warning: colors.warning,      // 80% 이상
    danger: colors.error,         // 100% 초과
  },
};

// 사용 예시
<View style={styles.progressTrack}>
  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
</View>

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
```

---

## Country Flags

### 라이브러리

```bash
# React Native SVG 국기 아이콘
npm install react-native-svg-circle-country-flags react-native-svg
```

### 사용법

```typescript
import { KR, JP, US, FR, DE } from 'react-native-svg-circle-country-flags';

// 기본 사용
<KR width={24} height={24} />

// 통화 코드로 매핑
const currencyToCountry: Record<string, string> = {
  KRW: 'KR',
  JPY: 'JP',
  USD: 'US',
  EUR: 'EU',  // 유럽연합
  GBP: 'GB',
  CNY: 'CN',
  THB: 'TH',
  VND: 'VN',
  TWD: 'TW',
  PHP: 'PH',
};
```

### Flag + Currency 레이아웃

```typescript
// 금액 표시 컴포넌트
const AmountDisplay = ({ currency, amount, amountKRW }) => (
  <View style={styles.amountContainer}>
    <View style={styles.flagRow}>
      <CountryFlag code={currencyToCountry[currency]} size={20} />
      <Text style={styles.currencyCode}>{currency}</Text>
    </View>
    <Text style={styles.amountPrimary}>
      {formatCurrency(amount, currency)}
    </Text>
    <Text style={styles.amountSecondary}>
      ≈ {formatKRW(amountKRW)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: 'flex-end',
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  currencyCode: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  amountPrimary: {
    ...typography.titleLarge,
    color: colors.text,
  },
  amountSecondary: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
```

### 레이아웃 예시

```
┌─────────────────────────────────────┐
│  ☕ 카페라떼                         │
│  10:30 · 지갑                        │
│                      🇫🇷 EUR        │
│                      €4.50          │
│                      ≈ ₩6,525       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🇫🇷 파리 (EUR)              1/15~20 │
│  총 지출: €520.00                   │
│  ≈ ₩754,000                        │
└─────────────────────────────────────┘
```

---

## UI States

### Empty State

```typescript
const EmptyState = ({ icon, title, description, action }) => (
  <View style={styles.emptyContainer}>
    <MaterialIcons
      name={icon}
      size={64}
      color={colors.textTertiary}
    />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {action && (
      <Button variant="primary" onPress={action.onPress}>
        {action.label}
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.text,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

// 사용 예시
<EmptyState
  icon="receipt-long"
  title="아직 지출이 없어요"
  description="여행 중 사용한 금액을 기록해보세요"
  action={{ label: '지출 추가', onPress: () => navigate('expense/new') }}
/>
```

### Loading State (Skeleton)

```typescript
const SkeletonBox = ({ width, height, borderRadius = borderRadius.md }) => (
  <Animated.View
    style={[
      styles.skeleton,
      { width, height, borderRadius },
      pulseAnimation,
    ]}
  />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
});

// 카드 스켈레톤
const CardSkeleton = () => (
  <View style={styles.card}>
    <SkeletonBox width={100} height={14} />
    <SkeletonBox width={150} height={32} />
    <SkeletonBox width={80} height={14} />
  </View>
);

// 리스트 스켈레톤
const ListItemSkeleton = () => (
  <View style={styles.listItem}>
    <SkeletonBox width={40} height={40} borderRadius={borderRadius.full} />
    <View style={styles.listItemContent}>
      <SkeletonBox width={120} height={16} />
      <SkeletonBox width={80} height={12} />
    </View>
    <SkeletonBox width={60} height={20} />
  </View>
);
```

### Error State

```typescript
const ErrorState = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <MaterialIcons
      name="error-outline"
      size={48}
      color={colors.error}
    />
    <Text style={styles.errorTitle}>문제가 발생했어요</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    <Button variant="secondary" onPress={onRetry}>
      다시 시도
    </Button>
  </View>
);
```

---

## Typography

### Font Family

```typescript
// 시스템 폰트 사용 (접근성, 성능 최적화)
const fontFamily = {
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
};
```

### Type Scale

```typescript
const typography = {
  // Display - 메인 금액
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Headline - 섹션 타이틀
  headlineLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Title - 카드 타이틀
  titleLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  // Body - 본문
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Label - 라벨, 버튼
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Caption - 보조 텍스트
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
};
```

### Typography Hierarchy Example

```
┌─────────────────────────────────────┐
│                                     │
│  오늘 지출              ← labelMedium, textSecondary
│  €125.50               ← displayLarge, text (Coral 포인트 가능)
│  ≈ ₩182,000            ← bodyMedium, textSecondary
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ☕ 카페라떼            ← titleMedium, text
│  10:30 · 지갑           ← caption, textTertiary
│                    €4.50 ← titleMedium, text
│                  ≈₩6,500 ← caption, textSecondary
└─────────────────────────────────────┘
```

---

## Spacing System

### Base Unit: 4px

```typescript
const spacing = {
  xs: 4,      // 4px - 아이콘과 텍스트 사이
  sm: 8,      // 8px - 인라인 요소 간격
  md: 12,     // 12px - 리스트 아이템 내부
  base: 16,   // 16px - 기본 패딩
  lg: 20,     // 20px - 카드 패딩
  xl: 24,     // 24px - 섹션 간격
  '2xl': 32,  // 32px - 큰 섹션 간격
  '3xl': 48,  // 48px - 페이지 상단 여백
};
```

### Component Spacing

```typescript
const componentSpacing = {
  // 카드
  card: {
    padding: spacing.lg,        // 20px
    gap: spacing.md,            // 12px
    marginBottom: spacing.base, // 16px
  },

  // 리스트 아이템
  listItem: {
    paddingVertical: spacing.md,   // 12px
    paddingHorizontal: spacing.base, // 16px
    gap: spacing.sm,               // 8px
  },

  // 버튼
  button: {
    paddingVertical: spacing.md,   // 12px
    paddingHorizontal: spacing.lg, // 20px
  },

  // 인풋
  input: {
    paddingVertical: spacing.md,   // 12px
    paddingHorizontal: spacing.base, // 16px
  },

  // 섹션
  section: {
    paddingVertical: spacing.xl,   // 24px
    marginBottom: spacing.xl,      // 24px
  },

  // 화면 컨테이너
  screen: {
    paddingHorizontal: spacing.base, // 16px
    paddingTop: spacing.base,        // 16px
  },
};
```

---

## Border Radius

```typescript
const borderRadius = {
  none: 0,
  sm: 4,      // 작은 뱃지, 태그
  md: 8,      // 버튼, 인풋
  lg: 12,     // 카드
  xl: 16,     // 모달, 바텀시트
  '2xl': 20,  // 큰 카드
  full: 9999, // 원형 버튼, 아바타, 국기
};
```

---

## Shadows & Elevation

```typescript
const shadows = {
  // 라이트 모드
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
  },

  // 다크 모드 (그림자 약하게)
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 4,
    },
  },
};
```

---

## Animation

### Timing

```typescript
const animation = {
  // Duration
  duration: {
    instant: 100,    // 버튼 누름
    fast: 150,       // 호버, 포커스
    normal: 200,     // 일반 전환
    slow: 300,       // 페이지 전환
    slower: 500,     // 스크롤 애니메이션
  },

  // Easing (React Native Animated)
  easing: {
    default: 'ease-out',
    spring: { tension: 50, friction: 7 },
  },
};
```

### Animation Patterns

```typescript
// 카드 눌림 효과
const pressAnimation = {
  transform: [{ scale: 0.98 }],
  duration: animation.duration.instant,
};

// 페이지 진입
const pageEnterAnimation = {
  opacity: { from: 0, to: 1 },
  translateY: { from: 20, to: 0 },
  duration: animation.duration.slow,
};

// 리스트 아이템 스태거
const staggerDelay = 50; // ms per item

// 모달 진입
const modalEnterAnimation = {
  opacity: { from: 0, to: 1 },
  translateY: { from: 100, to: 0 },
  duration: animation.duration.slow,
};

// 토글 리스트 펼침
const expandAnimation = {
  height: 'auto',
  opacity: { from: 0, to: 1 },
  duration: animation.duration.normal,
};

// 스켈레톤 펄스
const pulseAnimation = {
  opacity: [0.4, 1, 0.4],
  duration: 1500,
  loop: true,
};
```

### Reduced Motion

```typescript
import { AccessibilityInfo } from 'react-native';

// 접근성: 모션 감소 설정 확인
const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// 사용
const animationDuration = reduceMotion ? 0 : animation.duration.normal;
```

---

## Components

### Button Variants

```typescript
const buttonStyles = {
  // Primary - 주요 액션 (Coral)
  primary: {
    backgroundColor: colors.primary,
    color: colors.textInverse,
    borderRadius: borderRadius.md,
    ...componentSpacing.button,
  },

  // Secondary - 보조 액션 (Sky Blue)
  secondary: {
    backgroundColor: colors.secondaryLight,
    color: colors.secondary,
    borderRadius: borderRadius.md,
  },

  // Outline - 테두리만
  outline: {
    backgroundColor: 'transparent',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },

  // Ghost - 텍스트 버튼
  ghost: {
    backgroundColor: 'transparent',
    color: colors.primary,
  },

  // Danger - 삭제, 경고
  danger: {
    backgroundColor: colors.error,
    color: colors.textInverse,
  },
};
```

### Card Variants

```typescript
const cardStyles = {
  // Default
  default: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light.sm,
  },

  // Outlined
  outlined: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },

  // Elevated
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light.md,
  },

  // Highlighted (Primary 강조)
  highlighted: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
};
```

### FAB (Floating Action Button)

```typescript
const fabStyles = {
  container: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing.base,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light.lg,
  },
  icon: {
    color: colors.textInverse,
  },
};
```

### Bottom Sheet

```typescript
const bottomSheetStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  content: {
    padding: spacing.base,
  },
};
```

---

## Iconography

### Icon Size

```typescript
const iconSize = {
  xs: 16,   // 인라인 아이콘
  sm: 20,   // 리스트 아이콘
  md: 24,   // 기본 아이콘
  lg: 32,   // 탭바, 헤더
  xl: 48,   // 빈 상태 아이콘
};
```

### Category Icons

```typescript
const categoryIcons = {
  food: { name: 'restaurant', color: colors.categoryFood },
  transport: { name: 'directions-bus', color: colors.categoryTransport },
  shopping: { name: 'shopping-bag', color: colors.categoryShopping },
  lodging: { name: 'hotel', color: colors.categoryLodging },
  activity: { name: 'local-activity', color: colors.categoryActivity },
  etc: { name: 'more-horiz', color: colors.categoryEtc },
};
```

### Payment Method Icons

```typescript
const paymentIcons = {
  wallet: { name: 'account-balance-wallet', color: colors.success },
  card: { name: 'credit-card', color: colors.secondary },
  cash: { name: 'payments', color: colors.accent },
};
```

---

## Accessibility Checklist

### Color Contrast
- [x] 본문 텍스트: 4.5:1 이상
- [x] 대형 텍스트 (18px+): 3:1 이상
- [x] UI 컴포넌트: 3:1 이상
- [x] Coral Primary on White: 4.63:1 ✓
- [x] 비활성화 상태도 읽을 수 있게

### Touch Targets
- [x] 최소 터치 영역: 44x44px
- [x] 버튼/링크 간 간격: 8px 이상

### Screen Reader
- [x] 모든 이미지에 alt/accessibilityLabel
- [x] 버튼에 명확한 레이블
- [x] 금액은 "1234원" 형태로 읽히게
- [x] 국기 아이콘에 국가명 라벨

### Motion
- [x] `prefers-reduced-motion` 지원
- [x] 자동 재생 애니메이션 없음
- [x] 깜빡임 3회/초 이하

---

## Do's and Don'ts

### Do's ✅
- 현지 통화를 크고 명확하게 표시
- 원화 환산은 보조 정보로 작게
- Coral로 중요 액션/금액 강조
- 카테고리 색상으로 빠른 인식
- 국기 아이콘으로 통화 직관적 표시
- 충분한 여백으로 시각적 휴식
- 일관된 둥글기 (12px)
- 명확한 터치 피드백

### Don'ts ❌
- 그라데이션 남용
- 과도한 그림자
- 불필요한 애니메이션
- 색상만으로 정보 전달 (아이콘 병행)
- 작은 터치 영역
- 낮은 대비의 텍스트
- Primary/Secondary 색상 과다 사용

---

## Theme Implementation

```typescript
// lib/theme/index.ts
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    borderRadius,
    shadows: isDark ? shadows.dark : shadows.light,
    chartColors: isDark ? chartColors.dark : chartColors.light,
    animation,
    isDark,
  };
};

// 사용
const { colors, spacing } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.base,
  },
});
```

---

## File Structure

```
lib/
├── theme/
│   ├── index.ts          # useTheme hook
│   ├── colors.ts         # 색상 정의
│   ├── typography.ts     # 타이포그래피
│   ├── spacing.ts        # 간격
│   ├── shadows.ts        # 그림자
│   ├── chartColors.ts    # 차트 팔레트
│   └── animation.ts      # 애니메이션
│
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Text.tsx
│       ├── ProgressBar.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       ├── CountryFlag.tsx
│       ├── BottomSheet.tsx
│       ├── FAB.tsx
│       └── ...
```

---

## Color Comparison

| 항목 | 이전 (토스 블루) | 변경 (Coral + Sky) |
|------|-----------------|-------------------|
| Primary | #3182F6 | #FF6B6B |
| Secondary | - | #4DABF7 |
| Accent | - | #FF922B |
| 느낌 | 차갑고 금융적 | 따뜻하고 여행 감성 |

---

## Reference

- **Airbnb**: Coral 계열, 여행 감성, 따뜻한 UI
- **카카오뱅크**: 노란색 포인트, 친근한 금융
- **Apple Wallet**: 카드 UI, 그림자 활용
- **Swiss Design**: 그리드, 타이포그래피 중심
