/**
 * Real-time Sync Hook
 * Automatically refreshes the dashboard when sync completes
 */

'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function useRealtimeSync(userId: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel('sync-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'health_sync_status',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Refresh when sync completes successfully
          if (
            payload.new &&
            typeof payload.new === 'object' &&
            'last_successful_sync' in payload.new
          ) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);
}
