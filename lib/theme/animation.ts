// Travel Helper v2.0 - Animation Configuration

export const animation = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    default: 'ease-out' as const,
  },
  spring: {
    tension: 50,
    friction: 7,
  },
};

export const animationPatterns = {
  press: {
    scale: 0.98,
    duration: animation.duration.instant,
  },
  pageEnter: {
    opacity: { from: 0, to: 1 },
    translateY: { from: 20, to: 0 },
    duration: animation.duration.slow,
  },
  modalEnter: {
    opacity: { from: 0, to: 1 },
    translateY: { from: 100, to: 0 },
    duration: animation.duration.slow,
  },
  expand: {
    duration: animation.duration.normal,
  },
  staggerDelay: 50,
};

export type Animation = typeof animation;
