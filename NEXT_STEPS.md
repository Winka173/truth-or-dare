# NEXT_STEPS.md — User Action Items

Things the code cannot do for you. Ordered by urgency.

---

## 🚨 Before you can see the revamp running

These block every other checklist item below.

### 1. Build a fresh native dev client

The revamp added native modules: `react-native-reanimated@4.x`, `react-native-google-mobile-ads`, `expo-in-app-purchases`, `lottie-react-native`, `expo-blur`, `expo-linear-gradient`, `expo-speech`, `expo-audio`. The dev client you had before won't work.

**On Windows (you):**
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

**On Mac (if you get access):**
```bash
npx expo run:ios
npx expo run:android
```

The build takes 10–20 min on EAS. Install the resulting `.ipa` / `.apk` on a real device or simulator.

### 2. Smoke-test the full flow on device

No one has actually seen the revamped app run. Tests pass and typecheck is clean, but animations, asset sizing, and race conditions only surface on-device. Walk through:

- [ ] Splash → Onboarding (first launch)
- [ ] Splash → Home (returning launch)
- [ ] Home "Play Now" → Setup Players → Age → Vibe → Handoff → Play (complete 2–3 questions) → Handoff → Play → Results
- [ ] Results "Play Again" (should start fresh with same players/config)
- [ ] Results "New Game" (should show interstitial ad, then Home)
- [ ] Settings (toggle sound, toggle haptic, open voice picker if >1 voice available)
- [ ] Favorites: star a question in Play, open Favorites from Settings, verify it's there, remove it, confirm empty state shows Lottie + message
- [ ] Setup Vibe → tap a locked 🔒 category → shake animation + PackUnlockSheet opens
- [ ] Tap Add Your Own → type a dare → verify it appears in the session pool
- [ ] On Android, hardware back during Play → ConfirmSheet shows "End this game?"

Report any visual glitches or bugs — these are likely fixable with small follow-up commits.

---

## 📦 Before production release

### 3. Replace placeholder assets

**Lottie animations** — `assets/lottie/` contains 8 valid-but-empty JSON files. Until replaced, your splash, onboarding slides, confetti, drumroll, fire streak, and empty state will render blank.

Sources: [LottieFiles](https://lottiefiles.com) (free, MIT). See `assets/lottie/README.md` for suggested search terms per file. Keep filenames identical — just swap JSON content.

| File | Where it plays | Suggested search |
|---|---|---|
| `splash-logo.json` | App launch (2s) | "dice reveal" / "logo draw" |
| `onboarding-1.json` | Onboarding slide 1 | "people group" |
| `onboarding-2.json` | Onboarding slide 2 | "party celebration" |
| `onboarding-3.json` | Onboarding slide 3 | "devil smirk" |
| `confetti.json` | Results screen entrance | "confetti burst" |
| `fire.json` | Streak milestone (≥3 dares) | "fire flame badge" |
| `drumroll.json` | Handoff screen (loops) | "pulse rings loading" |
| `empty-state.json` | Favorites with 0 saved | "empty star placeholder" |

**Sound effects** — `assets/sounds/whoosh.mp3`, `cheer.mp3`, `drumroll.mp3` are 507-byte silent placeholders. Until replaced, the app is mute.

Sources: [freesound.org](https://freesound.org), [mixkit.co](https://mixkit.co). Keep under 50 KB each, mono, 44.1 kHz. Keep filenames identical.

### 4. Set up AdMob (replace test IDs)

**AdMob console:** [admob.google.com](https://admob.google.com) — create an app, then two interstitial ad units (one per platform).

Replace in **`app.json`** (inside the `react-native-google-mobile-ads` plugin tuple):
```json
"androidAppId": "ca-app-pub-YOURID~YOURID",
"iosAppId": "ca-app-pub-YOURID~YOURID"
```

Replace in **`constants/config.ts`** (the `XXXXXXXXXXXXXXXX` placeholders in `ADS_CONFIG`):
```typescript
interstitialAndroid: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-YOURID/YOURID',
interstitialIos:     __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-YOURID/YOURID',
```

`__DEV__` keeps Google's test IDs active in dev builds so you don't rack up fake impressions.

### 5. Create IAP products in the stores

**App Store Connect** ([appstoreconnect.apple.com](https://appstoreconnect.apple.com)) — create 5 non-consumable products:

| Product ID | Price |
|---|---|
| `com.winka.truthordare.pack_couples` | $1.99 |
| `com.winka.truthordare.pack_adult_life` | $1.99 |
| `com.winka.truthordare.pack_deep_dive` | $1.99 |
| `com.winka.truthordare.pack_adult_18` | $2.99 |
| `com.winka.truthordare.pack_all` | $5.99 |

These IDs match `PACK_CONFIG` in `constants/config.ts` — if you change one, change both.

**Google Play Console** ([play.google.com/console](https://play.google.com/console)) — create the same 5 products as "Managed products" with identical IDs and prices.

### 6. Test IAP in sandbox

- iOS: create a sandbox test user in App Store Connect → Users & Access → Sandbox Testers
- Android: upload a signed build to the internal testing track, add test accounts

Then in the app:
- [ ] Tap a locked category → PackUnlockSheet opens → Unlock → complete sandbox purchase → category becomes accessible immediately
- [ ] Force-quit + relaunch → category still unlocked (MMKV persistence)
- [ ] Settings → Restore Purchases → unlock restores from purchase history
- [ ] Purchase `all_packs` bundle → all 4 individual packs unlock together

### 7. Store listing prep

Both stores need:
- [ ] App icon (already in `assets/icon.png` — verify it still looks right at Apple's sizing)
- [ ] Screenshots at required device sizes (iOS: 6.9", 6.5", 12.9" iPad; Android: phone + tablet)
- [ ] App description, keywords, category
- [ ] Privacy policy URL (app is **"Data Not Collected"** — no network, no analytics, no user tracking)
- [ ] Age rating: **17+** (Adults Only pack contains mature suggestive themes)
- [ ] Support URL / email

---

## 🧹 Nice to have

### 8. README update

The current `README.md` still references the old architecture (Playfair Display fonts, old components, old screen structure). Worth a rewrite to match post-revamp state. `CLAUDE.md` is already accurate for Claude sessions; `README.md` is for humans on GitHub.

### 9. Custom-question filter bug

Minor: in `hooks/useGame.ts`, custom questions are merged into the session pool AFTER `buildQuestionPool` runs. This means if a user sets `typeFilter: 'truth'` and adds a custom `dare`, the dare still appears. Fix: apply the type filter to customs before merging, or drop customs if they don't match the filter.

Not a blocker — `typeFilter` is always `'both'` today.

### 10. End-to-end tests

Unit tests cover store slices and util functions. Nothing validates the full flow end-to-end. Consider [Maestro](https://maestro.mobile.dev) (YAML, low overhead) for regression protection on:
- Full happy-path game
- IAP sandbox purchase flow
- Restore purchases
- Language switch (especially Arabic RTL)

### 11. Analytics (optional)

App is currently 100% offline. If you want install/retention numbers eventually, the lightest option is [Expo Application Services Insights](https://docs.expo.dev/eas/insights/) — opt-in, no PII, still qualifies as "Data Not Collected" for store listing.

---

## Current repo status

- `main` has the full revamp (69 revamp commits)
- GitHub `origin/main` is in sync
- No feature branches remain (all 5 `revamp/*` branches deleted after merge)
- Working tree has some pre-existing uncommitted local changes (`.claude/settings.json`, `.gitignore`) — inspect and decide yourself
