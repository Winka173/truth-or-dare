# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # expo start --dev-client (requires rebuilt native binary)
npm run ios        # expo run:ios (rebuilds native iOS binary, Mac only)
npm run android    # expo run:android
npm run web        # expo start --web
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm test           # jest (unit tests only — no device needed)
```

Run a single test file:
```bash
npx jest store/slices/__tests__/gameSlice.test.ts
```

EAS build (Windows users or remote builds):
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

**Important:** `react-native-reanimated@4.x`, AdMob, IAP, Lottie, and BlurView are all native. After changing any native dependency, rebuild the dev client. `expo start --dev-client` alone will crash without a matching native binary.

## Architecture

### Data Flow

1. `data/questions.json` (1,943 questions, ~2.7 MB) is bundled at build time
2. On app boot (`app/_layout.tsx`), `safeFlattenQuestions()` flattens the DB and dispatches `loadQuestions` to Redux
3. The same boot sequence hydrates `settings`, `packs`, and `favorites` from MMKV
4. `useIapLifecycle()` also mounts in the root layout — it owns the single global IAP connection + purchase listener
5. All UI reads from Redux via typed hooks (`useAppSelector`, `useAppDispatch` from `store/hooks.ts`)
6. Mutations that need persistence call a utility in `utils/storage.ts` directly from the hook (not from Redux middleware)

### State Management

Redux Toolkit with 4 slices in `store/slices/`:

| Slice | Persisted | Key responsibility |
|---|---|---|
| `gameSlice` | No | Active session, question pool, turn history, scoring, custom questions |
| `settingsSlice` | MMKV | Sound, haptics, language, age group, mood, theme, onboardingComplete, ttsEnabled, preferredVoiceId |
| `packsSlice` | MMKV | Unlocked pack IDs, IAP status |
| `favoritesSlice` | MMKV | Starred question IDs |

MMKV persistence is manual (synchronous reads/writes in hooks), not middleware-based. Slices expose a `hydrate` action; the root layout dispatches it on boot.

### Hook Layer

Business logic lives in `hooks/`, not in components or slices:

- `useGame` — builds question pool via `buildQuestionPool()` + merges custom questions, manages turn cycle; supports `poolOverride` for favorites-only sessions
- `useSettings` / `usePacks` / `useFavorites` — thin wrappers dispatching slice actions + persisting to MMKV
- `usePacks` exposes real `purchase()` / `restore()` backed by `expo-in-app-purchases` (lifecycle handled separately)
- `useIapLifecycle` — mounted once in `app/_layout.tsx`, owns IAP connect/disconnect + purchase listener
- `useSpeech` — TTS via `expo-speech`, gated on `soundEnabled && ttsEnabled`
- `useSoundEffects` — short audio cues (whoosh/cheer/drumroll) via `expo-audio`; gracefully no-ops if placeholders don't decode
- `useAds` — AdMob interstitial with 3-minute cooldown, `showInterstitialIfReady()`
- `useSetupWizard` — module-level external store for ephemeral 3-step setup state (players → age → vibe)
- `useT` — i18n translation; resolves `locale → en → key` with `{placeholder}` substitution
- `useReduceMotion` — system accessibility flag; used by `FloatingEmojis`, `CardShimmer`, the glow pulse, confetti, and drumroll loop

### Navigation

Expo Router file-based routing. Root stack (`app/_layout.tsx`): splash → onboarding → (main). Main stack (`app/(main)/_layout.tsx`):

```
index          → home (single Play CTA, Browse Packs link, settings icon)
setup/players  → wizard step 1: add player names
setup/age      → wizard step 2: pick age group, auto-advance
setup/vibe     → wizard step 3: pick mood + optional categories + Add Your Own
handoff        → privacy gate between turns, "I'm Ready" CTA, drumroll Lottie
play           → question card (no flip), favorite star, TTS mute toggle, end confirm
results        → winner card, podium, share, play again, new game (triggers interstitial)
settings       → modal (slide_from_bottom)
favorites      → saved questions viewer, "Play Favorites" CTA
```

The `handoff`/`play`/`results` screens disable swipe-back (`gestureEnabled: false`). Screen transition types and durations are configured in `app/(main)/_layout.tsx`.

### Question Pipeline

```
questions.json
  → flattenQuestions()       (utils/questionLoader.ts)
  → buildQuestionPool()      (utils/questionFilter.ts)  — filters by age, mood, category, pack access
  → merge custom questions   (hooks/useGame.ts)          — session-only, from gameSlice.customQuestions
  → preparePool()            (utils/shuffle.ts)          — dedup recent 20, Fisher-Yates shuffle
  → prepareEscalatingPool()  (utils/shuffle.ts)          — for escalation series: preserves level 1→5 order
```

Age group filtering uses inheritance: `adult` also includes `kids`, `teens`, `young_adult`. `18plus` requires BOTH the age selection AND the `adult_18` pack unlock (see the JSDoc on `buildQuestionPool`).

### Scoring

Defined in `constants/config.ts`, applied in `gameSlice`:
- Dare completed: +2 pts
- Truth completed: +1 pt
- Skipped: −1 pt
- Streak bonus: +1 pt for every completed dare after the 3rd consecutive dare

### Categories & Packs

32 categories in `constants/categories.ts`. Free categories have `packId: null`; premium ones reference a pack ID. Pack access is checked via `isCategoryAccessible()` in `questionFilter.ts`, which reads from `packsSlice`. Purchasing `all_packs` auto-unlocks the 4 individual packs (logic in `packsSlice`). Real IAP flow: `usePacks.purchase(packId)` → `PackUnlockSheet` auto-closes on `iapStatus === 'success'`.

### i18n

11 locales (`en`, `es`, `zh`, `hi`, `ar`, `pt`, `fr`, `id`, `vi`, `ja`, `de`) in `locales/`. RTL layout is synced on boot based on the active language. Each `Question` stores translations keyed by language code; `getTranslatedText()` falls back to English.

### Design System

- Theme tokens (gradients, colors, fonts, spacing, radius, animation) all in `constants/theme.ts`
- Gradient keys: `splash | home | setup | handoff | play | results` — each screen uses `<GradientScreen gradient="..." />`
- Shared UI components: `GradientScreen`, `FrostedCard`, `GradientButton`, `TextButton`, `ProgressDots`, `PlayerChip`, `ConfirmSheet`, `CardShimmer`, `FloatingEmojis`
- Fonts: Baloo2 ExtraBold (headings), Outfit (body, 3 weights)
- Animations: Moti for declarative entrance/exit, Reanimated for continuous/spring, Lottie for hero moments (splash logo, onboarding, confetti, drumroll, empty state, fire)

### Ads & IAP

- AdMob interstitial fires on Results → New Game transition. 3-minute cooldown in `ADS_CONFIG.cooldownMs` (`constants/config.ts`)
- Test AdMob App IDs in `app.json`; test Unit IDs gated on `__DEV__`
- Production IDs need to be filled in before store submission (see `NEXT_STEPS.md`)
- IAP products: `couples`, `adult_life`, `deep_dive`, `adult_18`, `all_packs` (see `PACK_CONFIG`)

### Cloud Backup

- Android: `app.json` has `android.allowBackup: true` → user data auto-backed up to Google Drive
- iOS: iCloud Backup is on by default; MMKV data in Documents directory is included

## Key Conventions

- Path alias `@/` maps to the repo root (configured in `tsconfig.json`)
- `react-native-mmkv` is mocked for Jest via `__mocks__/react-native-mmkv.ts`; call `__resetMockStorage()` between tests
- TypeScript strict mode is on — `noUnusedLocals`, `noImplicitReturns`, etc.
- Jest requires `__DEV__: true` in globals (set in `jest.config.js`) because `constants/config.ts` references it at module top-level
- Theme tokens are all in `constants/theme.ts` — do not hardcode values in components
- Lottie JSON files in `assets/lottie/` and MP3 files in `assets/sounds/` are placeholders — replace before release (see `NEXT_STEPS.md`)
