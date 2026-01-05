import { useState, useEffect, useCallback } from 'react';
import { addSyncListener, isOnline, updatePendingCount, type SyncStatus } from '@/lib/syncService';

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to sync status
    const unsubscribe = addSyncListener((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);
    });

    // Initial pending count
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  return { online, syncStatus, pendingCount };
}
