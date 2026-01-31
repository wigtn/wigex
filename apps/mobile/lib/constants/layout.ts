// Layout Constants - 터치 타겟 및 UI 크기 상수

// 터치 타겟 최소 크기 (iOS Human Interface Guidelines: 44pt)
export const TOUCH_TARGET = {
  MIN_SIZE: 44,
  MIN_SIZE_LARGE: 48,
} as const;

// 입력 필드 상수
export const INPUT = {
  MIN_HEIGHT: 48,
  PADDING_HORIZONTAL: 16,
  PADDING_VERTICAL: 12,
} as const;

// FAB (Floating Action Button) 상수
export const FAB_CONSTANTS = {
  SIZE: 56,
  SIZE_SMALL: 40,
  BOTTOM_POSITION: 24,
  RIGHT_POSITION: 16,
} as const;

// 헤더 버튼 스타일 (공통)
export const HEADER_BUTTON = {
  SIZE: 44,
  HIT_SLOP: { top: 10, bottom: 10, left: 10, right: 10 },
} as const;

// 애니메이션 상수
export const ANIMATION = {
  SPRING_TENSION: 100,
  SPRING_FRICTION: 10,
} as const;
