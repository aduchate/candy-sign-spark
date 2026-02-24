import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineSync } from '@/lib/offlineSync';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setPendingCount(offlineSync.getPendingCount());
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && wasOffline) {
      // Back online - sync progress
      const doSync = async () => {
        const count = offlineSync.getPendingCount();
        if (count === 0) {
          setWasOffline(false);
          return;
        }

        setIsSyncing(true);
        const result = await offlineSync.sync();
        setIsSyncing(false);
        setWasOffline(false);
        setPendingCount(offlineSync.getPendingCount());

        if (result.synced > 0) {
          toast.success(`${result.synced} progrès synchronisé(s) avec succès`);
        }
        if (result.failed > 0) {
          toast.error(`${result.failed} élément(s) n'ont pas pu être synchronisés`);
        }
      };
      doSync();
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !isSyncing && !wasOffline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-center text-sm font-medium transition-all ${
      isOnline 
        ? 'bg-green-500/90 text-white' 
        : 'bg-amber-500/90 text-white'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {!isOnline && (
          <>
            <span>Mode hors ligne — Les données en cache sont utilisées</span>
            {pendingCount > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} en attente de sync
              </span>
            )}
          </>
        )}
        {isOnline && isSyncing && (
          <>
            <span>Synchronisation des progrès...</span>
          </>
        )}
        {isOnline && !isSyncing && wasOffline && (
          <>
            <span>Connexion rétablie</span>
          </>
        )}
      </div>
    </div>
  );
};
