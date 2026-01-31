// Travel Helper v2.0 - useHaptic Hook
// 햅틱 피드백 공통 훅

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

export function useHaptic() {
  const hapticEnabled = useSettingsStore((state) => state.hapticEnabled);

  const impact = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (hapticEnabled) {
        Haptics.impactAsync(style);
      }
    },
    [hapticEnabled]
  );

  const notification = useCallback(
    (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
      if (hapticEnabled) {
        Haptics.notificationAsync(type);
      }
    },
    [hapticEnabled]
  );

  const selection = useCallback(() => {
    if (hapticEnabled) {
      Haptics.selectionAsync();
    }
  }, [hapticEnabled]);

  return {
    impact,
    notification,
    selection,
    hapticEnabled,
  };
}
