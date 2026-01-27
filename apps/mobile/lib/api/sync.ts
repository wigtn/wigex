import { apiClient } from './client';

// ============ Types ============

export interface SyncChange {
  entityType: 'trip' | 'destination' | 'expense';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  localUpdatedAt: string;
}

export interface SyncConflict {
  entityType: 'trip' | 'destination' | 'expense';
  entityId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  localUpdatedAt: string;
  serverUpdatedAt: string;
}

export interface SyncPushDto {
  changes: SyncChange[];
  lastSyncedAt?: string;
}

export interface SyncPushResponse {
  applied: string[];
  conflicts: SyncConflict[];
  serverChanges: SyncChange[];
  syncedAt: string;
}

export interface SyncPullResponse {
  applied: string[];
  conflicts: SyncConflict[];
  serverChanges: SyncChange[];
  syncedAt: string;
}

export interface SyncResolveConflictDto {
  entityType: 'trip' | 'destination' | 'expense';
  entityId: string;
  resolution: 'keep_local' | 'keep_server';
}

// ============ API Functions ============

export const syncApi = {
  push: (dto: SyncPushDto) =>
    apiClient.post<{ success: true; data: SyncPushResponse }>('/sync/push', dto),

  pull: (lastSyncedAt?: string) =>
    apiClient.get<{ success: true; data: SyncPullResponse }>('/sync/pull', {
      params: lastSyncedAt ? { lastSyncedAt } : undefined,
    }),

  resolve: (dto: SyncResolveConflictDto) =>
    apiClient.post<{ success: true; data: { success: boolean } }>(
      '/sync/resolve',
      dto
    ),
};
