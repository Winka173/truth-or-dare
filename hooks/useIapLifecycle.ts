// hooks/useIapLifecycle.ts
// Connects to the IAP service, registers the global purchase listener, and
// ensures clean disconnect on app unmount. Must be mounted ONCE in the root
// layout. Consumer screens use `usePacks` for purchase/restore actions.

import { useEffect } from 'react';
import * as IAP from 'expo-in-app-purchases';
import { useAppDispatch } from '@/store/hooks';
import {
  unlock as unlockAction,
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

export function useIapLifecycle() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    IAP.connectAsync().catch(() => {
      /* ignore */
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
}
