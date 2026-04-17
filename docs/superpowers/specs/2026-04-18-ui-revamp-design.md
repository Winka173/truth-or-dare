# Truth or Dare — Full UI Revamp Design Spec

**Date:** 2026-04-18
**Status:** Approved by user

---

## 1. Goals

- Replace all existing UI from scratch — nothing carried over from the old design
- Reduce tap-count from launch to first question to 5 taps
- Fix clunky flow: simplified home, 3-step wizard setup, full-screen player handoff
- Add splash + first-time onboarding
- Add TTS (auto-read questions aloud) with voice selection
- Add share results, custom questions, favorites viewer, sound effects
- Add interstitial ads between games
- Implement IAP for 18+ pack (already designed in packsSlice, needs installing)
- Enable OS-level cloud backup (Android Auto Backup → Google Drive, iOS iCloud)

---

## 2. Visual Language

### Gradient System

Every screen has its own gradient that creates an emotional arc through the game.

| Screen | Light gradient | Dark mode base |
|---|---|---|
| Splash / Onboarding | Coral `#FF6B6B` → Peach `#FFB347` | `#1A0A0A` → `#2D1515` |
| Home | Violet `#A855F7` → Pink `#EC4899` | `#0D0320` → `#1A0A1A` |
| Setup (all 3 steps) | Sky `#38BDF8` → Mint `#34D399` | `#020D1A` → `#021A12` |
| Handoff | Orange `#FB923C` → Yellow `#FBBF24` | `#1A0D02` → `#1A1502` |
| Play | Indigo `#6366F1` → Purple `#A855F7` | `#02020D` → `#0D021A` |
| Results | Pink `#EC4899` → Yellow `#FBBF24` | `#1A0212` → `#1A1502` |

Dark mode uses the same gradient colors as glows and accents on a deep charcoal base — not full-screen gradient fills.

### Cards

Frosted glass surface throughout:
- Light: `rgba(255,255,255,0.15)` background, `1px` border at `rgba(255,255,255,0.20)`, `16px` backdrop blur
- Dark: `rgba(255,255,255,0.08)` background, same border treatment

### Typography

**Completely fresh — no Playfair, DM Sans, or DM Mono.**

| Role | Font | Package |
|---|---|---|
| Headings / display | `Baloo2_800ExtraBold` | `@expo-google-fonts/baloo-2` |
| Body regular | `Outfit_400Regular` | `@expo-google-fonts/outfit` |
| Body semibold | `Outfit_600SemiBold` | `@expo-google-fonts/outfit` |
| Body bold | `Outfit_700Bold` | `@expo-google-fonts/outfit` |

Remove from `package.json`: `@expo-google-fonts/playfair-display`, `@expo-google-fonts/dm-sans`, `@expo-google-fonts/dm-mono`.

### Shape & Motion

- Border radius: `16px` (cards), `full` (buttons, chips) — no sharp corners anywhere
- Press animation: scale to `0.93`, spring `{ damping: 12, stiffness: 180 }` — bouncier than old design
- All `react-native` `Animated` usage replaced with Reanimated `useSharedValue` / `useAnimatedStyle`

---

## 3. Screen Map

10 screens total (Settings is a modal, not a full screen):

```
Splash (auto, 2s)
  └─ Onboarding (first launch only, 3 slides)
       └─ Home
            ├─ Settings (modal, slide_from_bottom)
            └─ Setup Step 1: Players
                 └─ Setup Step 2: Age Group
                      └─ Setup Step 3: Vibe (mood + categories)
                           └─ Handoff (before every question)
                                └─ Play
                                     └─ Results
                                          ├─ Handoff (Play Again)
                                          └─ Home (New Game)

Settings modal
  └─ Favorites (/(main)/favorites — full screen, slide_from_right)
```

**Tap count to first question:** Splash (auto) → Home (1) → Players (name + Next = 2) → Age (1) → Vibe (1) → **5 taps total.**

Category browser removed as standalone screen — lives inside Setup Step 3 only.

---

## 4. Screen Designs

### 4.1 Splash Screen

- Full-screen coral→peach gradient
- App logo: game emoji + "Truth or Dare" in Baloo2 ExtraBold, white, centered
- Entrance: logo scales from `0.6` with spring bounce
- Auto-transitions after 2s: to Onboarding (first launch) or Home (returning)
- No skip button

### 4.2 Onboarding (first launch only)

- Same gradient as splash
- 3 swipeable slides:
  1. "Pick your players 👥" — subtitle: "Add up to 8 friends"
  2. "Choose your vibe 🎉" — subtitle: "Party, chill, intimate, or icebreaker"
  3. "Dare each other 😈" — subtitle: "Truth or Dare — your rules"
- Dot indicators at bottom
- Skip button top-right (jumps to Home, marks onboarding complete)
- Final slide: "Let's Play 🔥" CTA button
- Completion stored as `settingsSlice.onboardingComplete: boolean` in MMKV

### 4.3 Home

- Violet→pink gradient
- Settings icon top-right
- Center: "Truth or Dare" in Baloo2 ExtraBold 48px, white
- Tagline in Outfit 16px below title
- Single primary frosted-glass CTA: "Play Now 🎉"
- Small secondary text link below: "Browse Packs"
- `FadeInDown.springify()` on title, `FadeInDown.delay(120)` on button

### 4.4 Setup — Step 1: Players

- Sky→mint gradient, progress dots (1 of 3) at top
- Text input + "Add" button (pill shaped)
- Player name chips appear below with `FadeInDown.delay(index * 40)`
- Each chip has × remove button
- "Next →" CTA at bottom, disabled until ≥ 1 player added
- Keyboard avoidance: `KeyboardAvoidingView behavior="padding"` (iOS) / `"height"` (Android)

### 4.5 Setup — Step 2: Age Group

- Sky→mint gradient, progress dots (2 of 3)
- 5 large frosted cards (one per age group): label + age range + short description
- Tap selects and auto-advances after 400ms
- 18+ card: amber warning chip "Requires Adults Only pack"
- Back arrow top-left

### 4.6 Setup — Step 3: Vibe

- Sky→mint gradient, progress dots (3 of 3)
- 4 mood buttons at top (pill shaped, each with its own accent color when selected)
- Scrollable category chip grid below — only shows categories accessible for selected age + packs
- Locked categories show lock icon; tap → PackUnlockSheet
- "Start Game 🔥" CTA at bottom
- Back arrow top-left

### 4.7 Handoff

- Orange→yellow gradient
- Full screen. Previous player cannot see question — this is the privacy gate.
- Large Baloo2: "[Player Name]'s Turn 👀"
- Subtitle Outfit: "Ready for your challenge?"
- One giant frosted "I'm Ready" button, centered
- `FadeInDown.springify()` on name, `FadeInUp.delay(200)` on button

### 4.8 Play

- Indigo→purple gradient
- Top bar: player name chip (small) + "Q X of Y" counter + "End" button (top-right, small, requires ConfirmSheet)
- Center: frosted glass question card
  - Question type label (TRUTH / DARE) in Baloo2, colored
  - Question text in Outfit 22px, white
  - Follow-up text below in Outfit 14px muted (if present)
  - Escalation badge top-right (if applicable)
  - Speaker icon top-left — mute toggle for TTS
  - Star icon bottom-right — favorite toggle
- TTS auto-reads question text on screen appear (see Section 6)
- Bottom: "Done ✅" (primary) + "Skip 😅" (secondary, if skips enabled)
- No flip mechanic — question visible immediately after handoff
- Streak badge appears above card when streak ≥ 3
- Android back button → ConfirmSheet "End this game?"

### 4.9 Results

- Pink→yellow gradient
- Confetti burst on enter (30 Reanimated particles)
- "Winner! 🏆" header in Baloo2
- Ranked frosted player cards: gold/silver/bronze tints for top 3
- Per-card stats: score, truths, dares, skips
- Bottom buttons:
  - Primary: "Play Again" → Handoff for same config
  - Secondary text link: "New Game" → Home
- "Share Results 📤" button → `Share.share()` with text summary (see Section 7.1)
- AdMob interstitial fires when leaving Results → Home via "New Game" (see Section 9)

### 4.10 Settings (modal)

- Slide up from bottom, `slide_from_bottom` 340ms
- Toggle rows: Sound Effects, Haptic Feedback, Dark Mode
- Picker rows: Default Age Group, Default Mood, Language (11 options)
- TTS row: "Reading Voice" — only shown if device has >1 voice for active language; opens voice picker sheet
- "Restore Purchases" button
- Version info at bottom
- Dismiss by swipe-down or × button

---

## 5. Navigation

```typescript
// app/(main)/_layout.tsx transition config
// index, setup/*, handoff: slide_from_right 280ms
// results: fade 220ms
// settings: slide_from_bottom 340ms, modal presentation
// play: gestureEnabled: false (no swipe-back during game)
```

Setup screens are nested under `app/(main)/setup/` — `players.tsx`, `age.tsx`, `vibe.tsx`. Wizard state (player names, selected age, selected mood/categories) is passed forward via Expo Router params, not Redux, until "Start Game" is tapped.

---

## 6. Text-to-Speech

**Package:** `expo-speech` (install: `npx expo install expo-speech`)

**Behavior:**
- When Play screen mounts, call `Speech.speak(translatedText, { language: activeLanguage, voice: preferredVoiceId ?? undefined })`
- TTS only fires if `settingsSlice.soundEnabled === true` and `settingsSlice.ttsEnabled === true`
- Speaker icon on question card toggles `ttsEnabled` for all remaining questions in the current session (muting once stops TTS for the rest of the game; does not persist — resets to `true` next game)
- If user taps skip/done mid-speech: `Speech.stop()` before advancing

**Voice selection (Settings):**
- Load `Speech.getAvailableVoicesAsync()` filtered to active language code
- If result length ≤ 1: hide "Reading Voice" row entirely
- If result length > 1: show row, tap opens bottom sheet list, selection saved to `settingsSlice.preferredVoiceId`

**New settingsSlice fields:**
```typescript
ttsEnabled: boolean           // default true
preferredVoiceId: string | null  // default null
```

**New translation keys** (all 11 locales):
```
'settings.voice'         → "Reading Voice"
'settings.voiceDefault'  → "System Default"
'play.muteVoice'         → "Mute"
'play.unmuteVoice'       → "Unmute"
```

---

## 7. New Features

### 7.1 Share Results

- Button on Results screen: "Share Results 📤"
- Uses `Share.share()` from `react-native` — no extra package
- Share text format:
  ```
  🎉 [Winner Name] won Truth or Dare with [N] points!
  [Player2]: [score]pts  [Player3]: [score]pts
  Played with Truth or Dare app 🔥
  ```
- Text only — works on all platforms

### 7.2 Custom Questions

- "Add your own" text link inside Setup Step 3 (Vibe screen), below category grid
- Opens a bottom sheet: text input, TRUTH / DARE toggle, "Add" button
- Custom questions stored in `gameSlice.customQuestions: CustomQuestion[]`
- Cleared on `resetGame()` — session-only, not persisted
- Injected into question pool during `startGame`, not subject to age/mood/pack filters

### 7.3 Favorites Viewer

- "Saved Questions" row in Settings → navigates to `/(main)/favorites`
- Lists all starred question IDs from `favoritesSlice`
- Each row: question text + type badge + remove star button
- "Play Favorites" CTA at bottom → starts game using only favorited questions, skipping Setup wizard

### 7.4 Sound Effects

- `expo-audio` already installed
- 3 short audio cues bundled in `assets/sounds/`:
  - `whoosh.mp3` — plays when question card appears on Play screen
  - `cheer.mp3` — plays on streak milestone (streak ≥ 3)
  - `drumroll.mp3` — plays on Handoff screen, stops when "I'm Ready" tapped
- All gated behind `settingsSlice.soundEnabled`
- Files: < 50KB each, mono, 44.1kHz

---

## 8. Cloud Backup (No Backend)

**Approach:** OS Auto Backup — zero SDK, zero user action required.

**Android:** Enable in `app.json`:
```json
"android": { "allowBackup": true }
```
Android automatically backs up app data (including MMKV storage) to the user's Google Drive. Restores on reinstall.

**iOS:** iCloud Backup is on by default. MMKV data in the app's Documents directory is included automatically.

No "Backup now" button — the OS handles it silently.

---

## 9. Ads

**Package:** `react-native-google-mobile-ads`

**Placement:** Single interstitial, fires when user taps "New Game" on Results → navigates to Home.

**Rules:**
- Never show during Handoff or Play screens
- Never show on the first game of a session
- Minimum 3-minute cooldown between interstitials
- Ad unit IDs stored in `constants/config.ts` as `ADS_CONFIG`

**Implementation:**
- `hooks/useAds.ts` — manages cooldown timer, exposes `showInterstitialIfReady()`
- Called once inside Results screen on "New Game" tap

---

## 10. IAP

**Package:** `expo-in-app-purchases` (not yet installed — `npx expo install expo-in-app-purchases`)

Existing `packsSlice`, `PACK_CONFIG`, and `usePacks` hook carry forward unchanged.

**18+ unlock:** `adult_18` pack at $2.99 — already in `PACK_CONFIG`. Unlocking grants access to 5 explicit categories. Age group must also be set to `18plus` in Setup Step 2 for explicit questions to appear (double gate — IAP alone is not enough).

---

## 11. Component Architecture

### New shared components (built from scratch)

| Component | Purpose |
|---|---|
| `GradientScreen` | Wraps every screen; `gradient` prop selects colors; handles safe area |
| `FrostedCard` | Universal card surface (rgba + blur + border) |
| `GradientButton` | Primary full-width CTA |
| `TextButton` | Secondary action (text only) |
| `ProgressDots` | Wizard step indicator (used across all 3 setup screens) |
| `PlayerChip` | Name pill with × remove (Setup Step 1) |
| `ConfirmSheet` | Bottom sheet with confirm/cancel |

### Deleted components (all old — nothing reused except logic)

`QuestionCard`, `TimerRing`, `Button`, `ScreenHeader`, `MoodChip`, `AgeGroupPicker`, `PlayerSetup`, `CategoryCard`, `ResultCard`, `PackBadge`, `FABMenu`, `Skeleton`, `EmptyState` — all replaced.

`ErrorBoundary` and `Toast` are kept (logic reusable, restyled only).

### State additions to existing slices

**settingsSlice** (new fields):
```typescript
onboardingComplete: boolean      // default false
ttsEnabled: boolean              // default true
preferredVoiceId: string | null  // default null
```

**gameSlice** (new field):
```typescript
customQuestions: CustomQuestion[]  // default []
```

---

## 12. Build & Dependency Changes

**Install:**
```bash
npx expo install expo-speech
npx expo install expo-in-app-purchases
npx expo install @expo-google-fonts/baloo-2 @expo-google-fonts/outfit
npm install react-native-google-mobile-ads
```

**Remove from package.json:**
```
@expo-google-fonts/playfair-display
@expo-google-fonts/dm-sans
@expo-google-fonts/dm-mono
```

**app.json additions:**
```json
"android": { "allowBackup": true },
"plugins": [...existing..., "react-native-google-mobile-ads"]
```

After any native dependency change: `npx expo run:ios` or `eas build --profile development` required.

---

## 13. What Does NOT Change

- `store/slices/gameSlice.ts` — scoring logic, turn cycle, undo, history (new `customQuestions` field added)
- `store/slices/packsSlice.ts` — pack unlock logic unchanged
- `store/slices/favoritesSlice.ts` — favorites logic unchanged
- `utils/questionFilter.ts` — age inheritance, pool building unchanged
- `utils/shuffle.ts` — Fisher-Yates, dedup unchanged
- `utils/storage.ts` — MMKV wrapper unchanged
- `locales/` — all 11 locale catalogs (4 new keys added, nothing removed)
- `hooks/useT.ts` — translation hook unchanged
- `data/questions.json` — question bank unchanged
- `types/` — all types unchanged (new fields additive only)
