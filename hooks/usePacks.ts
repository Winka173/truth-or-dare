import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restore as restoreAction, unlock as unlockAction } from '@/store/slices/packsSlice';
import { storageApi } from '@/utils/storage';
import type { PackId } from '@/types/question';

export function usePacks() {
  const dispatch = useAppDispatch();
  const unlockedPackIds = useAppSelector((s) => s.packs.unlockedPackIds);
  const iapStatus = useAppSelector((s) => s.packs.iapStatus);

  const isUnlocked = useCallback(
    (packId: PackId): boolean => unlockedPackIds.includes(packId),
    [unlockedPackIds],
  );

  const devUnlock = useCallback(
    (packId: PackId) => {
      dispatch(unlockAction(packId));
      const next = Array.from(new Set([...unlockedPackIds, packId]));
      storageApi.saveUnlockedPacks(next);
    },
    [dispatch, unlockedPackIds],
  );

  const devRestore = useCallback(
    (packIds: PackId[]) => {
      dispatch(restoreAction(packIds));
      const next = Array.from(new Set([...unlockedPackIds, ...packIds]));
      storageApi.saveUnlockedPacks(next);
    },
    [dispatch, unlockedPackIds],
  );

  return { unlockedPackIds, iapStatus, isUnlocked, devUnlock, devRestore };
}
