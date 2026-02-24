/**
 * Offline sync service.
 * Queues learning progress changes when offline and syncs to Supabase when back online.
 */

import { supabase } from '@/integrations/supabase/client';

const SYNC_QUEUE_KEY = 'lsfb_offline_sync_queue';

export interface SyncItem {
  id: string;
  table: string;
  operation: 'upsert';
  data: Record<string, any>;
  timestamp: number;
}

export const offlineSync = {
  /** Add an item to the sync queue */
  enqueue(item: Omit<SyncItem, 'id' | 'timestamp'>): void {
    const queue = this.getQueue();
    queue.push({
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  /** Get the current sync queue */
  getQueue(): SyncItem[] {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Get count of pending items */
  getPendingCount(): number {
    return this.getQueue().length;
  },

  /** Process the sync queue - call when back online */
  async sync(): Promise<{ synced: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remaining: SyncItem[] = [];

    for (const item of queue) {
      try {
        if (item.table === 'user_progress') {
          const { error } = await supabase
            .from('user_progress')
            .upsert({
              ...item.data,
              user_id: session.user.id,
            }, { onConflict: 'user_id,lesson_id' });

          if (error) {
            console.error('Sync error for user_progress:', error);
            remaining.push(item);
            failed++;
          } else {
            synced++;
          }
        }
      } catch (e) {
        console.error('Sync failed for item:', item, e);
        remaining.push(item);
        failed++;
      }
    }

    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    return { synced, failed };
  },

  /** Clear the sync queue */
  clearQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  },
};
