// Travel Helper v2.0 - Spacing System
// Base Unit: 4px

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

export const componentSpacing = {
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  section: {
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  screen: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
};

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
