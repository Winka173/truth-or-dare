# UI Revamp — Plan 5: Monetization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Enable revenue — AdMob interstitials between games, In-App Purchases for the 18+ pack (and 4 other packs), and OS-level cloud backup configuration.

**Architecture:** `react-native-google-mobile-ads` for interstitials (fires only on Results → Home transition, 3-minute cooldown). `expo-in-app-purchases` wraps the existing `packsSlice` / `usePacks`. Cloud backup enabled via `app.json` config — no SDK code required.

**Prerequisite:** Plan 4 complete.

---

## Task 1: Install and configure AdMob

**Files:** `package.json`, `app.json`, `constants/config.ts`

- [ ] **Step 1: Install**

```bash
npm install react-native-google-mobile-ads
```

- [ ] **Step 2: Add AdMob plugin to app.json**

Edit `app.json`. Add to the `plugins` array:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-3940256099942544~3347511713",
    "iosAppId": "ca-app-pub-3940256099942544~1458002511"
  }
]
```

These are Google's official test IDs. Replace with real AdMob App IDs before production release.

- [ ] **Step 3: Add ADS_CONFIG to constants/config.ts**

Append to `constants/config.ts`:

```typescript
export const ADS_CONFIG = {
  // Test IDs for development. Replace with production unit IDs before release.
  interstitialAndroid: __DEV__
    ? 'ca-app-pub-3940256099942544/1033173712'
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  interstitialIos: __DEV__
    ? 'ca-app-pub-3940256099942544/4411468910'
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  cooldownMs: 3 * 60 * 1000,
} as const;
```

- [ ] **Step 4: Rebuild native binary**

```bash
npx expo run:ios
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app.json constants/config.ts
git commit -m "chore: install react-native-google-mobile-ads, add AdMob config"
```

---

## Task 2: Create useAds hook

**Files:** Create `hooks/useAds.ts`

- [ ] **Step 1: Create the hook**

```typescript
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
    mobileAds().initialize().catch(() => { /* ignore init errors */ });

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
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useAds.ts
git commit -m "feat: useAds hook — interstitial with 3-minute cooldown"
```

---

## Task 3: Fire interstitial on Results → Home

**Files:** Modify `app/(main)/results.tsx`

- [ ] **Step 1: Call showInterstitialIfReady on "New Game"**

Add import:

```typescript
import { useAds } from '@/hooks/useAds';
```

Inside component:

```typescript
const { showInterstitialIfReady } = useAds();
```

Replace the New Game `TextButton` onPress:

```typescript
<TextButton
  label="New Game"
  onPress={() => {
    showInterstitialIfReady();
    reset();
    router.replace('/(main)');
  }}
  accessibilityLabel="Start a new game"
/>
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/results.tsx"
git commit -m "feat: show interstitial ad on Results → New Game transition"
```

---

## Task 4: Install expo-in-app-purchases

- [ ] **Step 1: Install**

```bash
npx expo install expo-in-app-purchases
```

- [ ] **Step 2: Rebuild native binary**

```bash
npx expo run:ios
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install expo-in-app-purchases for IAP"
```

---

## Task 5: Implement usePacks purchase/restore

**Files:** Modify `hooks/usePacks.ts`

- [ ] **Step 1: Replace usePacks**

```typescript
// hooks/usePacks.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add hooks/usePacks.ts
git commit -m "feat: usePacks — full IAP purchase + restore with MMKV persistence"
```

---

## Task 6: Create PackUnlockSheet

**Files:** `components/packs/PackUnlockSheet.tsx`, modify `app/(main)/setup/vibe.tsx`

- [ ] **Step 1: Create with new design system**

```typescript
// components/packs/PackUnlockSheet.tsx
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { usePacks } from '@/hooks/usePacks';
import { PACK_CONFIG } from '@/constants/config';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { fonts, spacing, radius, colors } from '@/constants/theme';
import type { PackId } from '@/types/question';

interface Props {
  visible: boolean;
  packId: Exclude<PackId, 'base'> | null;
  onClose: () => void;
}

export function PackUnlockSheet({ visible, packId, onClose }: Props) {
  const { purchase, iapStatus } = usePacks();

  if (!packId) return null;
  const cfg = PACK_CONFIG[packId];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>{cfg.label}</Text>
          <Text style={styles.description}>{cfg.description}</Text>
          <Text style={styles.price}>${cfg.price.toFixed(2)}</Text>

          {iapStatus === 'loading' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <GradientButton
              label={`Unlock for $${cfg.price.toFixed(2)}`}
              onPress={() => purchase(packId)}
              accessibilityLabel={`Unlock ${cfg.label}`}
            />
          )}
          {iapStatus === 'error' ? (
            <Text style={styles.error}>Purchase failed. Please try again.</Text>
          ) : null}
          <TextButton label="Close" onPress={onClose} accessibilityLabel="Close" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: { fontFamily: fonts.heading, fontSize: 26, color: '#FFFFFF', textAlign: 'center' },
  description: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.80)', textAlign: 'center' },
  price: { fontFamily: fonts.heading, fontSize: 36, color: colors.gold, textAlign: 'center', marginVertical: spacing.sm },
  error: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.error, textAlign: 'center' },
});
```

- [ ] **Step 2: Wire into Vibe screen**

In `app/(main)/setup/vibe.tsx`:

```typescript
import { PackUnlockSheet } from '@/components/packs/PackUnlockSheet';
import type { PackId } from '@/types/question';
```

```typescript
const [packToUnlock, setPackToUnlock] = useState<Exclude<PackId, 'base'> | null>(null);
```

Pass `setPackToUnlock` to the `CategoryChip` component as a prop. Inside `CategoryChip.handlePress` when locked, after the shake, call:

```typescript
if (locked) {
  // (existing shake animation)
  onOpenUnlock(cat.packId);
  return;
}
```

Add `onOpenUnlock` as a prop to `CategoryChip`.

Before the closing `</GradientScreen>`:

```typescript
<PackUnlockSheet
  visible={packToUnlock !== null}
  packId={packToUnlock}
  onClose={() => setPackToUnlock(null)}
/>
```

- [ ] **Step 3: Commit**

```bash
git add components/packs/PackUnlockSheet.tsx "app/(main)/setup/vibe.tsx"
git commit -m "feat: PackUnlockSheet — purchase flow for locked packs"
```

---

## Task 7: Restore purchases button in Settings

**Files:** Modify `app/(main)/settings.tsx`

- [ ] **Step 1: Change restore call**

The placeholder `restore([])` from Plan 2 needs to become `restore()` (new signature takes no args):

```typescript
<TextButton label="Restore Purchases" onPress={() => restore()} accessibilityLabel="Restore past purchases" />
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/settings.tsx"
git commit -m "feat: wire restore purchases to new usePacks.restore signature"
```

---

## Task 8: Enable Android Auto Backup

**Files:** Modify `app.json`

- [ ] **Step 1: Add allowBackup to android block**

```json
"android": {
  "adaptiveIcon": { /* existing */ },
  "edgeToEdgeEnabled": true,
  "predictiveBackGestureEnabled": false,
  "package": "com.winka.truthordare",
  "allowBackup": true
}
```

iOS iCloud Backup is on by default — no config required. MMKV data in app Documents directory is included automatically when users have iCloud Backup enabled.

- [ ] **Step 2: Commit**

```bash
git add app.json
git commit -m "feat: enable Android Auto Backup → Google Drive"
```

---

## Task 9: Verify 18+ double gate

**Files:** Inspect `utils/questionFilter.ts`

- [ ] **Step 1: Confirm isCategoryAccessible gates packs**

Open `utils/questionFilter.ts`. Confirm `isCategoryAccessible` returns `false` for categories with a `packId` that is not in `unlockedPackIds`.

- [ ] **Step 2: Confirm age gate in buildQuestionPool**

Confirm `buildQuestionPool` only includes questions with `age_group === '18plus'` when `config.ageGroup === '18plus'`.

Both checks together form the double gate:
- `adult_18` purchase alone → no explicit questions (age still required)
- `18plus` age alone → no pack categories (pack still required)
- Both → explicit content unlocked

- [ ] **Step 3: Commit any fixes (skip if gates already correct)**

---

## Task 10: Final typecheck + verification

- [ ] **Step 1: Typecheck**

```bash
npm run typecheck
```

Expected: Zero errors.

- [ ] **Step 2: Run tests**

```bash
npm test -- --no-coverage
```

Expected: All pass.

- [ ] **Step 3: Manual verification**

- Complete 2 games. On the 2nd game's New Game tap, an AdMob test interstitial shows
- Settings → Restore Purchases with no prior purchases → no-op, no crash
- Setup Vibe → tap a locked premium category → shake + PackUnlockSheet opens with price and description
- In sandbox/test env, test purchase completes → category unlocks immediately, persists across restart
- Select 18+ age without `adult_18` unlocked → no explicit questions appear
- Unlock `adult_18` + select 18+ → explicit content appears

- [ ] **Step 4: Pre-release checklist**

Before production App Store / Play Store submission:
- Replace AdMob test IDs in `constants/config.ts` and `app.json` with real production IDs
- Create 5 non-consumable IAP products in App Store Connect + Google Play Console:
  - `com.winka.truthordare.pack_couples` — $1.99
  - `com.winka.truthordare.pack_adult_life` — $1.99
  - `com.winka.truthordare.pack_deep_dive` — $1.99
  - `com.winka.truthordare.pack_adult_18` — $2.99
  - `com.winka.truthordare.pack_all` — $5.99
- Age rating: 17+ (mature suggestive themes, when adult_18 pack is available)
- Privacy: "Data Not Collected" — app has no network, no analytics

---

## Plan 5 Complete — Revamp Complete

All five plans delivered:

| Plan | File |
|---|---|
| 1 Foundation | `2026-04-18-revamp-01-foundation.md` |
| 2 Screens | `2026-04-18-revamp-02-screens.md` |
| 3 Animations | `2026-04-18-revamp-03-animations.md` |
| 4 Features | `2026-04-18-revamp-04-features.md` |
| 5 Monetization | `2026-04-18-revamp-05-monetization.md` |

Production-ready pending real AdMob IDs, IAP product creation, and App Store review.
