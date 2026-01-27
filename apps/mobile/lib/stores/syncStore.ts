import { create } from 'zustand';
import { syncApi, SyncConflict, SyncChange } from '../api/sync';
import * as queries from '../db/queries';
import { networkService } from '../services/networkService';
import { Trip, Destination, Expense } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  sync: () => Promise<void>;
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  resolveConflict: (
    conflict: SyncConflict,
    resolution: 'keep_local' | 'keep_server'
  ) => Promise<void>;
  queueChange: (
    entityType: 'trip' | 'destination' | 'expense',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ) => Promise<void>;
  clearError: () => void;
}

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastSyncedAt: null,
  pendingChanges: 0,
  conflicts: [],
  error: null,

  initialize: async () => {
    const lastSyncedAt = await queries.getLastSyncedAt();
    const pendingChanges = await queries.getSyncQueueCount();
    const isConnected = networkService.getIsConnected();

    set({
      lastSyncedAt,
      pendingChanges,
      status: isConnected ? 'idle' : 'offline',
    });

    // Subscribe to network changes
    networkService.subscribe((isConnected) => {
      if (isConnected) {
        set({ status: get().pendingChanges > 0 ? 'idle' : 'idle' });
        // Auto-sync when reconnected
        if (get().pendingChanges > 0) {
          get().sync();
        }
      } else {
        set({ status: 'offline' });
      }
    });
  },

  sync: async () => {
    const { status } = get();
    if (status === 'syncing') return;

    if (!networkService.getIsConnected()) {
      set({ status: 'offline' });
      return;
    }

    set({ status: 'syncing', error: null });

    try {
      // Push local changes first
      await get().pushToServer();
      // Then pull server changes
      await get().pullFromServer();

      set({ status: 'idle' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sync failed';
      set({
        status: 'error',
        error: message,
      });
    }
  },

  pushToServer: async () => {
    const queue = await queries.getSyncQueue();
    if (queue.length === 0) return;

    const changes: SyncChange[] = queue.map((item) => ({
      entityType: item.entityType,
      entityId: item.entityId,
      action: item.action,
      data: item.data,
      localUpdatedAt: item.localUpdatedAt,
    }));

    const lastSyncedAt = get().lastSyncedAt;
    const { data } = await syncApi.push({
      changes,
      lastSyncedAt: lastSyncedAt || undefined,
    });

    const response = data.data;

    // Clear successfully applied changes from queue
    if (response.applied.length > 0) {
      await queries.clearSyncQueue(response.applied);
    }

    // Handle conflicts
    if (response.conflicts.length > 0) {
      set({ conflicts: response.conflicts });
    }

    // Update last synced timestamp
    await queries.setLastSyncedAt(response.syncedAt);

    const newPendingCount = await queries.getSyncQueueCount();
    set({
      lastSyncedAt: response.syncedAt,
      pendingChanges: newPendingCount,
    });
  },

  pullFromServer: async () => {
    const lastSyncedAt = get().lastSyncedAt;
    const { data } = await syncApi.pull(lastSyncedAt || undefined);
    const response = data.data;

    // Apply server changes to local DB
    for (const change of response.serverChanges) {
      await applyServerChange(change);
    }

    await queries.setLastSyncedAt(response.syncedAt);
    set({ lastSyncedAt: response.syncedAt });
  },

  resolveConflict: async (conflict, resolution) => {
    await syncApi.resolve({
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      resolution,
    });

    if (resolution === 'keep_server') {
      // Apply server data locally
      await applyServerChange({
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        action: 'update',
        data: conflict.serverData,
        localUpdatedAt: conflict.serverUpdatedAt,
      });
    } else {
      // Re-queue local change to push again
      await get().queueChange(
        conflict.entityType,
        conflict.entityId,
        'update',
        conflict.localData
      );
    }

    // Remove from conflicts
    set({
      conflicts: get().conflicts.filter(
        (c) => c.entityId !== conflict.entityId
      ),
    });
  },

  queueChange: async (entityType, entityId, action, data) => {
    await queries.addToSyncQueue(entityType, entityId, action, data);
    const pendingChanges = await queries.getSyncQueueCount();
    set({ pendingChanges });

    // Debounced auto-sync if online
    if (networkService.getIsConnected()) {
      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
      }
      syncDebounceTimer = setTimeout(() => {
        get().sync();
      }, 2000);
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper to apply server changes locally
async function applyServerChange(change: SyncChange): Promise<void> {
  const { entityType, entityId, action, data } = change;

  switch (entityType) {
    case 'trip':
      if (action === 'create' || action === 'update') {
        await queries.upsertTrip({ ...data, id: entityId } as Trip);
      } else if (action === 'delete') {
        await queries.deleteTrip(entityId);
      }
      break;
    case 'destination':
      if (action === 'create' || action === 'update') {
        await queries.upsertDestination({
          ...data,
          id: entityId,
        } as Destination);
      } else if (action === 'delete') {
        await queries.deleteDestination(entityId);
      }
      break;
    case 'expense':
      if (action === 'create' || action === 'update') {
        await queries.upsertExpense({ ...data, id: entityId } as Expense);
      } else if (action === 'delete') {
        await queries.deleteExpense(entityId);
      }
      break;
  }
}
