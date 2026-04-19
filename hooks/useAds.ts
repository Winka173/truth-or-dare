// hooks/useAds.ts
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import mobileAds, { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from '@/constants/config';

const unitId = Platform.OS === 'ios' ? ADS_CONFIG.interstitialIos : ADS_CONFIG.interstitialAndroid;

let lastShownAtMs = 0;

export function useAds() {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(() => {
        /* ignore init errors */
      });

    const ad = InterstitialAd.createForAdRequest(unitId);
    interstitialRef.current = ad;

    const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      ad.load();
    });

    ad.load();

    return () => {
      onLoaded();
      onClosed();
    };
  }, []);

  const showInterstitialIfReady = useCallback(() => {
    const now = Date.now();
    if (now - lastShownAtMs < ADS_CONFIG.cooldownMs) return false;
    if (!loadedRef.current || !interstitialRef.current) return false;
    try {
      interstitialRef.current.show();
      lastShownAtMs = now;
      return true;
    } catch {
      return false;
    }
  }, []);

  return { showInterstitialIfReady };
}
