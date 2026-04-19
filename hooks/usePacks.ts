import { useEffect, useCallback } from 'react';
import * as IAP from 'expo-in-app-purchases';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  unlock as unlockAction,
  restore as restoreAction,
  setIapStatus,
} from '@/store/slices/packsSlice';
import { storageApi } from '@/utils/storage';
import { PACK_CONFIG } from '@/constants/config';
import type { PackId } from '@/types/question';

function productIdToPackId(productId: string): PackId | null {
  for (const [packId, cfg] of Object.entries(PACK_CONFIG)) {
    if (cfg.productId === productId) return packId as PackId;
  }
  return null;
}

export function usePacks() {
  const dispatch = useAppDispatch();
  const { unlockedPackIds, iapStatus } = useAppSelector((s) => s.packs);

  useEffect(() => {
    IAP.connectAsync().catch(() => {
      /* connection failure — restore handles it */
    });

    IAP.setPurchaseListener(({ responseCode, results }) => {
      if (responseCode !== IAP.IAPResponseCode.OK || !results) {
        dispatch(setIapStatus('error'));
        return;
      }
      for (const purchase of results) {
        if (purchase.acknowledged) continue;
        const packId = productIdToPackId(purchase.productId);
        if (packId) {
          dispatch(unlockAction(packId));
          const current = storageApi.loadUnlockedPacks();
          storageApi.saveUnlockedPacks([...new Set([...current, packId])]);
        }
        IAP.finishTransactionAsync(purchase, false).catch(() => {});
      }
      dispatch(setIapStatus('success'));
    });

    return () => {
      IAP.disconnectAsync().catch(() => {});
    };
  }, [dispatch]);

  const purchase = useCallback(
    async (packId: PackId) => {
      const cfg = PACK_CONFIG[packId as Exclude<PackId, 'base'>];
      if (!cfg) return;
      dispatch(setIapStatus('loading'));
      try {
        await IAP.purchaseItemAsync(cfg.productId);
      } catch {
        dispatch(setIapStatus('error'));
      }
    },
    [dispatch],
  );

  const restore = useCallback(async () => {
    dispatch(setIapStatus('loading'));
    try {
      const { results } = await IAP.getPurchaseHistoryAsync();
      const restored = (results ?? [])
        .map((p) => productIdToPackId(p.productId))
        .filter((id): id is PackId => id !== null);
      dispatch(restoreAction(restored));
      const current = storageApi.loadUnlockedPacks();
      storageApi.saveUnlockedPacks([...new Set([...current, ...restored])]);
      dispatch(setIapStatus('success'));
    } catch {
      dispatch(setIapStatus('error'));
    }
  }, [dispatch]);

  const isUnlocked = useCallback(
    (packId: string) => unlockedPackIds.includes(packId as PackId),
    [unlockedPackIds],
  );

  return { unlockedPackIds, iapStatus, purchase, restore, isUnlocked };
}
