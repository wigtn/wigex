// Travel Helper v3.0 - Sync Store (Network status only)
// 오프라인 동기화 기능 제거 - 서버 전용 모드

import { create } from 'zustand';
import { networkService } from '../services/networkService';

export type SyncStatus = 'online' | 'offline';

interface SyncState {
  // isOnline 하나로 통합 (중복 필드 제거)
  isOnline: boolean;

  // Actions
  initialize: () => () => void; // cleanup 함수 반환
  checkConnection: () => Promise<boolean>;
}

// 구독 해제 함수 저장
let networkUnsubscribe: (() => void) | null = null;
let isInitialized = false;

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,

  initialize: () => {
    // 중복 초기화 방지
    if (isInitialized && networkUnsubscribe) {
      return networkUnsubscribe;
    }

    isInitialized = true;
    const isConnected = networkService.getIsConnected();
    set({ isOnline: isConnected });

    // Subscribe to network changes
    networkUnsubscribe = networkService.subscribe((isConnected) => {
      set({ isOnline: isConnected });
    });

    // cleanup 함수 반환
    return () => {
      if (networkUnsubscribe) {
        networkUnsubscribe();
        networkUnsubscribe = null;
        isInitialized = false;
      }
    };
  },

  checkConnection: async () => {
    const isConnected = await networkService.checkConnection();
    set({ isOnline: isConnected });
    return isConnected;
  },
}));

// 하위 호환성을 위한 status getter (deprecated)
// 새로운 코드에서는 isOnline 사용 권장
export const getSyncStatus = (): SyncStatus => {
  return useSyncStore.getState().isOnline ? 'online' : 'offline';
};
