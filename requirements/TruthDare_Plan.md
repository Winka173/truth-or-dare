# Truth or Dare — Implementation Plan

**For Claude Code** | Read `TruthDare_PRD.md` and `TruthDare_DataSchema.md` first.

---

## How to use this file

Work through phases in order. Each phase has:

- **Goal** — what done looks like
- **Tasks** — exact files to create/implement
- **Acceptance criteria** — how to verify before moving on

Start each session by telling Claude Code which phase you're working on.

---

## Phase 0 — Read UI/UX Design from Stitch

**Goal:** Extract all colors, typography, spacing, and component styles from the Stitch export before writing a single line of UI code.

> **Why this comes first:** All visual decisions — colors, fonts, spacing values, border radii, shadows — come from Stitch with Google, not from the PRD. The PRD describes structure and behavior. Stitch describes how it looks. Do not invent any visual styles.

### Tasks

#### 0.1 Export from Stitch

- [ ] Open your Stitch project at [stitch.withgoogle.com](https://stitch.withgoogle.com)
- [ ] Export the design for all screens: Home, Setup, Play (game), Results, Category Browser, Settings
- [ ] Copy the generated React Native / Expo component code from Stitch

#### 0.2 Extract design tokens into `constants/theme.ts`

From the Stitch export, extract and populate:

```typescript
// constants/theme.ts — fill ALL values from Stitch export
export const colors = {
  primary: {
    // Extract from Stitch: main action color (buttons, active states, FAB)
    default: "", // e.g. '#XXXXXX'
    light: "",
    lighter: "",
  },
  accent: {
    // Extract from Stitch: secondary accent color
    default: "",
    light: "",
  },
  semantic: {
    success: "",
    warning: "",
    error: "",
  },
  bg: {
    screen: "", // main background
    card: "", // card surface
    surface: "", // elevated surface
    input: "", // input field background
    game: "", // game screen background (likely dark)
  },
  text: {
    primary: "",
    secondary: "",
    muted: "",
    placeholder: "",
    inverse: "",
  },
  border: {
    light: "",
    medium: "",
  },
  // Category colors — map Stitch category colors to these keys
  category: {
    Work: "",
    Personal: "",
    Ideas: "",
    Tasks: "",
    Learning: "",
  },
};

export const spacing = {
  // Extract from Stitch spacing scale
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  "2xl": 0,
  "3xl": 0,
};

export const fontSize = {
  // Extract from Stitch type scale
  xs: 0,
  sm: 0,
  base: 0,
  lg: 0,
  xl: 0,
  "2xl": 0,
  "3xl": 0,
  "4xl": 0,
};

export const radius = {
  // Extract from Stitch border radius values
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  "2xl": 0,
  full: 9999,
};

export const shadow = {
  // Extract from Stitch shadow/elevation values
  card: {
    shadowOpacity: 0,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  elevated: {
    shadowOpacity: 0,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
};
```

#### 0.3 Extract font families

- [ ] Identify the fonts Stitch uses for headings, body, and monospace
- [ ] Update `constants/theme.ts` with font family names:

```typescript
export const fonts = {
  heading: "", // e.g. 'PlayfairDisplay_700Bold' — from Stitch
  body: "", // e.g. 'DMSans_400Regular'
  bodyMed: "", // e.g. 'DMSans_500Medium'
  bodySemi: "", // e.g. 'DMSans_600SemiBold'
  bodyBold: "", // e.g. 'DMSans_700Bold'
  mono: "", // e.g. 'DMMono_400Regular'
};
```

- [ ] Install the correct `@expo-google-fonts/*` packages for whichever fonts Stitch uses

#### 0.4 Copy Stitch component code

- [ ] For each screen Stitch exports, save the generated component code alongside the implementation plan
- [ ] These become the visual reference when implementing each screen in Phase 4

#### 0.5 Identify timer color states

- [ ] From Stitch, identify the three timer ring colors (full → warning → danger)
- [ ] Add them to `constants/theme.ts` under `colors.timer`:

```typescript
timer: {
  safe:    '',   // color when > 50% time remaining
  warning: '',   // color when 25–50% remaining
  danger:  '',   // color when < 25% remaining
}
```

### ✅ Acceptance criteria

- `constants/theme.ts` fully populated — zero placeholder empty strings
- Font families confirmed and correct packages installed
- Timer color states extracted
- Stitch component exports saved for reference during Phase 4

---

## Phase 1 — Foundation

**Goal:** Bare repo, all dependencies installed, fonts loading, design tokens in place, app renders without crashing.

### Tasks

#### 1.1 Project setup

- [ ] `npx create-expo-app@latest truth-or-dare --template blank-typescript`
- [ ] Configure `app.json`: name, slug, scheme, plugins for Reanimated + Gesture Handler
- [ ] Configure `babel.config.js`: add `react-native-reanimated/plugin` (must be last)
- [ ] Set `"strict": true` in `tsconfig.json`
- [ ] Add path aliases to `tsconfig.json`: `@/` → `./`

#### 1.2 Install all dependencies

```bash
npx expo install expo-router react-native-reanimated react-native-gesture-handler
npx expo install react-native-mmkv @reduxjs/toolkit react-redux
npx expo install lucide-react-native react-native-svg
npx expo install expo-haptics expo-av expo-in-app-purchases
npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono
# Note: install whichever font packages Stitch uses — adjust the above if different
```

#### 1.3 Design tokens

- [ ] `constants/theme.ts` — must already be fully populated from Phase 0 (Stitch export)
- [ ] Verify all values are filled in — no empty strings or placeholder zeros
- [ ] `constants/categories.ts` — use category colors extracted from Stitch in Phase 0

#### 1.4 Category constants

- [ ] `constants/categories.ts` — 32 entries, each with `id`, `label`, `icon`, `color`, `packId`, `explicit`

```typescript
// Example shape
export const CATEGORIES = [
  {
    id: "friendship",
    label: "Friendship",
    icon: "👫",
    color: "#FF6B9D",
    packId: null,
    explicit: false,
  },
  {
    id: "couples_edition",
    label: "Couples Edition",
    icon: "💑",
    color: "#EC4899",
    packId: "couples",
    explicit: false,
  },
  {
    id: "relationships_18plus",
    label: "Spicy Relationships",
    icon: "🌶️",
    color: "#EF4444",
    packId: "adult_18",
    explicit: true,
  },
  // ... all 32
];
```

#### 1.5 Config constants

- [ ] `constants/config.ts`

```typescript
export const GAME_CONFIG = {
  MAX_PLAYERS: 8,
  RECENT_IDS_LIMIT: 20,
  DEFAULT_AGE_GROUP: "teens",
  DEFAULT_MOOD: "party",
  DEFAULT_LANGUAGE: "en",
};
export const TIMER_DURATIONS = [0, 30, 60, 90] as const;
export const PACK_CONFIG = {
  couples: { price: 1.99, productId: "com.yourapp.pack_couples" },
  adult_life: { price: 1.99, productId: "com.yourapp.pack_adult_life" },
  deep_dive: { price: 1.99, productId: "com.yourapp.pack_deep_dive" },
  adult_18: { price: 2.99, productId: "com.yourapp.pack_adult_18" },
  all_packs: { price: 5.99, productId: "com.yourapp.pack_all" },
};
```

#### 1.6 Root layout scaffold

- [ ] `app/_layout.tsx` — Redux Provider, font loading with `useFonts`, `SplashScreen.preventAutoHideAsync()`, `ErrorBoundary`, `Toast`
- [ ] Load all font families identified in Phase 0 (from Stitch export)
- [ ] `components/ui/ErrorBoundary.tsx` — class component, crash fallback UI
- [ ] `components/ui/Toast.tsx` — lightweight toast (context + hook)

### ✅ Acceptance criteria

- App launches on iOS simulator and Android emulator without errors
- Fonts render correctly (can verify with a test screen)
- No TypeScript errors (`npx tsc --noEmit`)

---

## Phase 2 — Data Layer

**Goal:** Question data bundled and queryable, all types defined, MMKV working, Redux slices fully implemented.

### Tasks

#### 2.1 Bundle the data

- [ ] `mkdir data && cp truth_dare_v5.json data/questions.json`
- [ ] Add to `app/_layout.tsx`: import questions, dispatch to Redux on boot

```typescript
import questionsData from "../data/questions.json";
// In root layout, after store is ready:
dispatch(
  gameSlice.actions.loadQuestions(
    questionsData.categories.flatMap((c) => c.questions),
  ),
);
```

#### 2.2 Types

- [ ] `types/question.ts` — full `Question` interface matching schema (see DataSchema.md §2)
- [ ] `types/game.ts` — `Player`, `GameSession`, `GameConfig`, `TurnResult`, `QuestionHistory`
- [ ] `types/store.ts` — `RootState`, `AppDispatch`

#### 2.3 Utils

- [ ] `utils/questionFilter.ts`
  - `buildQuestionPool(config, unlockedPacks)` with age group inheritance
  - `matchesAgeGroup(questionAge, selectedAge)` using AGE_INCLUDES map
  - `isCategoryAccessible(question, unlockedPacks)`
  - `getCategoryId(questionId)` — extracts category prefix from question ID
- [ ] `utils/shuffle.ts`
  - `fisherYates<T>(arr: T[]): T[]`
  - `preparePool(pool, recentIds)` — dedup last 20, fallback if pool too small
- [ ] `utils/storage.ts` — MMKV wrapper
  - `saveSettings(settings)` / `loadSettings(): Settings`
  - `saveUnlockedPacks(packIds)` / `loadUnlockedPacks(): string[]`
  - `saveRecentIds(ids)` / `loadRecentIds(): string[]`
  - `saveLastPlayers(names)` / `loadLastPlayers(): string[]`
  - `saveLastConfig(config)` / `loadLastConfig(): GameConfig | null`
- [ ] `utils/errorHandler.ts` — `mapError(err): string`

#### 2.4 Redux slices

- [ ] `store/slices/gameSlice.ts`

```typescript
// State shape
interface GameState {
  allQuestions: Question[];     // loaded once from questions.json
  session: GameSession | null;
  history: QuestionHistory[];
  isActive: boolean;
}

// Actions to implement
loadQuestions(questions: Question[])
startGame(payload: { config: GameConfig; players: Player[] })
  // builds pool, shuffles, creates session
nextQuestion()
  // advances currentQuestionIndex + rotates currentPlayerIndex
completeQuestion(type: 'truth' | 'dare')
  // +2 for dare, +1 for truth; update streak; check streak bonus
skipQuestion()
  // -1 score; reset streak
endGame()
  // clears session, keeps history
resetGame()
  // full reset, same config, rebuilds pool
```

- [ ] `store/slices/settingsSlice.ts`

```typescript
// State: soundEnabled, hapticEnabled, defaultAgeGroup, defaultMood, language, theme
// On every change: write to MMKV
// On init: load from MMKV
```

- [ ] `store/slices/packsSlice.ts`

```typescript
// State: unlockedPackIds[], iapStatus
// Actions: unlock(packId), restore(packIds[]), setIapStatus
// On unlock: write to MMKV
// On init: load from MMKV
```

- [ ] `store/index.ts` — configure store with all three slices
- [ ] `store/hooks.ts` — typed `useAppDispatch` and `useAppSelector`

#### 2.5 Hooks

- [ ] `hooks/useGame.ts` — dispatches gameSlice actions, exposes `currentQuestion`, `currentPlayer`, `session`
- [ ] `hooks/useQuestions.ts` — selects `allQuestions` from Redux, exposes `buildPool`
- [ ] `hooks/usePacks.ts` — `isUnlocked(packId)`, `purchase(packId)`, `restore()`
- [ ] `hooks/useSettings.ts` — typed getters/setters for each settings field

### ✅ Acceptance criteria

- `buildQuestionPool({ ageGroup: 'teens', mood: 'party', ... }, [])` returns correct subset
- Age group inheritance works: `adult` config includes `young_adult` questions
- `18plus` age + locked pack = 0 explicit questions served
- MMKV save/load round-trip works for all 5 keys
- `startGame` → `nextQuestion` → `completeQuestion` → `endGame` flow works in Redux DevTools
- No TypeScript errors

---

## Phase 3 — UI Components

**Goal:** All reusable components built. Each renders correctly in isolation.

### Tasks

#### 3.1 Base UI components

- [ ] `components/ui/Button.tsx`
  - variants: `primary`, `secondary`, `destructive`
  - height: 52px, `full` border radius
  - spring press scale: 1 → 0.95 via Reanimated
  - `accessibilityLabel` prop required

- [ ] `components/ui/Input.tsx`
  - props: `label`, `error`, `maxLength`, `showCount`
  - character count fades in after 80% of `maxLength`

- [ ] `components/ui/ScreenHeader.tsx`
  - app wordmark (Playfair Display) + optional left/right icon buttons
  - `FadeInDown.springify()` 350ms entering animation

- [ ] `components/ui/EmptyState.tsx` — icon + title + subtitle + optional action button
- [ ] `components/ui/ConfirmSheet.tsx` — bottom sheet, title + message + confirm/cancel buttons
- [ ] `components/ui/Skeleton.tsx` — pulsing placeholder for loading states
- [ ] `components/ui/FABMenu.tsx`
  - main FAB: rotation 0° → 45° on open
  - pulse glow ring when closed (looping scale + opacity)
  - child items spring from behind FAB upward on open
  - dim overlay fades in behind menu

#### 3.2 Game-specific components

- [ ] `components/game/MoodChip.tsx`
  - pill shape, category color fill when selected
  - `FadeInRight` stagger by index
  - spring scale: 1 → 0.91 on press

- [ ] `components/game/AgeGroupPicker.tsx`
  - 5 option rows with label, age range, description
  - selected row: indigo accent
  - 18+ option: amber warning nudge text

- [ ] `components/game/PlayerSetup.tsx`
  - text input + Add button
  - animated list of player badges (FadeInDown stagger)
  - remove button on each badge

- [ ] `components/game/PlayerBadge.tsx`
  - player name + avatar circle
  - `FadeInDown.delay(index * 40)` entering per turn
  - current player: indigo border highlight

- [ ] `components/game/TimerRing.tsx`
  - SVG `Circle` with `strokeDasharray` / `strokeDashoffset`
  - Reanimated `withTiming` drives dashoffset
  - `interpolateColor`: teal → amber → red
  - center text: countdown in DM Mono 4xl
  - haptic pulse at 10s, rapid at 3s

- [ ] `components/game/StreakBadge.tsx`
  - shows streak count with flame emoji
  - `FadeIn` animation on appearance, `FadeOut` on reset

- [ ] `components/game/CategoryCard.tsx`
  - category color accent bar left (4px)
  - icon + label + question count + age badge
  - lock overlay if `is_premium` and not unlocked
  - spring press scale

- [ ] `components/game/ResultCard.tsx`
  - rank number + player name + score + truths/dares/skips stats
  - winner row: gold/amber highlight

#### 3.3 Pack components

- [ ] `components/packs/PackBadge.tsx` — small lock icon + "Premium" label overlay
- [ ] `components/packs/PackUnlockSheet.tsx`
  - bottom sheet
  - pack name, question count, price
  - "Unlock" button → triggers `usePacks.purchase()`
  - loading / success / error states

### ✅ Acceptance criteria

- All components render without errors
- Spring animations fire on press for all interactive components
- TimerRing animates and changes color correctly
- PackUnlockSheet renders in locked/unlocked states

---

## Phase 4 — Game Screens

**Goal:** Full game loop playable end-to-end from Home → Setup → Play → Results.

### Tasks

#### 4.1 Stack navigation

- [ ] `app/(main)/_layout.tsx` — Expo Router stack with transitions:
  - Default: `slide_from_right`, 280ms
  - Settings: `slide_from_bottom`, 340ms
  - Back/Home: `fade`, 220ms

#### 4.2 Home Screen — `app/(main)/index.tsx`

- [ ] App wordmark (Playfair Display xl) + tagline
- [ ] **Quick Start** button — loads last config from MMKV, starts game immediately
- [ ] **New Game** button — navigates to `/setup`
- [ ] **Browse Categories** button — navigates to `/categories`
- [ ] Settings icon in ScreenHeader → navigates to `/settings`
- [ ] FadeInDown entering on header, FadeInDown.delay(60) on buttons

#### 4.3 Game Setup Screen — `app/(main)/setup.tsx`

- [ ] Section 1: `PlayerSetup` component
- [ ] Section 2: `AgeGroupPicker` component
- [ ] Section 3: Mood selector row — 4 `MoodChip` components
- [ ] Section 4: Category picker (optional) — horizontal scroll of `CategoryCard` thumbnails
- [ ] Section 5: Advanced options (collapsible) — timer, questions per round, allow skips, type filter
- [ ] **Start Game** button — validates ≥1 player → dispatches `startGame` → navigates to `/play`
- [ ] Persist all selections to MMKV on Start

#### 4.4 Question Card — `components/game/QuestionCard.tsx`

This is the most complex component. Implement carefully:

```typescript
// Props
interface QuestionCardProps {
  question: Question;
  playerName: string;
  onFlip?: () => void;
  language: LanguageCode;
}

// State
const [isFlipped, setIsFlipped] = useState(false);

// Animation
const rotation = useSharedValue(0);

const frontStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotation.value}deg` }],
  backfaceVisibility: "hidden",
  opacity: rotation.value < 90 ? 1 : 0,
}));

const backStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotation.value - 180}deg` }],
  backfaceVisibility: "hidden",
  opacity: rotation.value >= 90 ? 1 : 0,
}));

const handlePress = () => {
  if (isFlipped) return;
  rotation.value = withSpring(180, { damping: 15, stiffness: 100 });
  setIsFlipped(true);
  impactMedium(); // expo-haptics
  onFlip?.();
};
```

- Front face: TRUTH/DARE label (Playfair 3xl, colored) + category chip + intensity dots (1–5)
- Back face: question text (Playfair 2xl) + `follow_up_question` (DM Sans sm, muted below)
- Chain banner: if `question.chain`, show `chain_prompt` after flip with `{player}` replaced
- Hot seat banner: if `question.hot_seat`, show group instruction
- Escalation badge: if `question.escalation_level`, show "Level X/5" in top corner

#### 4.5 Game Screen — `app/(main)/play.tsx`

- [ ] Header: current player badge (animated on each turn) + progress bar + "End Game" button
- [ ] Center: `QuestionCard` — new instance on each question, `FadeIn.delay(100)` entering
- [ ] If timer > 0: show `TimerRing` after card flip
- [ ] After flip: show **Done** and **Skip** (if allowed) buttons
  - Done → `completeQuestion` → `nextQuestion` or end if last question
  - Skip → `skipQuestion` → `nextQuestion`
- [ ] Hardware back (Android): BackHandler shows `ConfirmSheet` "End this game?"
- [ ] Show `StreakBadge` when streak ≥ 3

#### 4.6 Results Screen — `app/(main)/results.tsx`

- [ ] Players sorted by score descending
- [ ] Winner row: special highlight + confetti animation
- [ ] Confetti: Reanimated particle system — 30 particles, random direction, scale + opacity fade

```typescript
// Confetti particle — run once on mount
useEffect(() => {
  particles.forEach((p) => {
    p.x.value = withDelay(p.delay, withTiming(p.targetX, { duration: 1200 }));
    p.y.value = withDelay(p.delay, withTiming(p.targetY, { duration: 1200 }));
    p.opacity.value = withDelay(
      p.delay + 800,
      withTiming(0, { duration: 400 }),
    );
  });
}, []);
```

- [ ] Per-player `ResultCard` with FadeInDown stagger
- [ ] Action buttons: **Play Again**, **New Game**, **Home**

#### 4.7 Category Browser — `app/(main)/categories.tsx`

- [ ] Grid (2 columns) of `CategoryCard` components — all 32
- [ ] Filter chips at top: All / Free / Premium / Kids / Teens / Adult
- [ ] Locked card: shows `PackBadge`, tap → `PackUnlockSheet`
- [ ] Unlocked card: tap → navigates to `/setup` with `categoryId` param pre-selected

#### 4.8 Settings Screen — `app/(main)/settings.tsx`

- [ ] Toggle rows: Sound Effects, Haptic Feedback
- [ ] Picker rows: Default Age Group, Default Mood, Language (10 options)
- [ ] "Restore Purchases" button → `usePacks.restore()`
- [ ] Version info at bottom (from `app.json`)
- [ ] FadeInDown.springify() on each section

### ✅ Acceptance criteria

- Complete game loop: Home → Setup → Play (3+ turns) → Results → Play Again
- Card flip animation works on both iOS and Android
- Timer counts down and changes color correctly
- Results show correct scores for all players
- Hardware back on Android shows confirm sheet
- Category browser correctly shows locked/unlocked state

---

## Phase 5 — Animations

**Goal:** Every animation from PRD §3.4 implemented. 60fps confirmed on mid-range Android.

### Tasks

- [ ] **Screen transitions** — verify all 3 modes in `_layout.tsx` (slide, fade, bottom)
- [ ] **ScreenHeader entering** — `FadeInDown.springify()` 350ms on all screens
- [ ] **Setup section stagger** — `FadeInDown.delay(n * 60)` per section row
- [ ] **Mood/category chips** — `FadeInRight.delay(index * 50)` stagger on mount
- [ ] **QuestionCard 3D flip** — rotateY spring + shadow intensification + haptic
- [ ] **TimerRing** — withTiming strokeDashoffset + interpolateColor (teal→amber→red) + haptic pulses at 10s and 3s
- [ ] **PlayerBadge** — `FadeInDown.delay(index * 40)` per turn change
- [ ] **Results confetti** — 30 particle system, delay stagger, fade out
- [ ] **ResultCard stagger** — `FadeInDown.delay(index * 80)` per card
- [ ] **FABMenu** — rotation 45° open, pulse glow ring closed, spring child items
- [ ] **Press scales** — verify all components: buttons (0.95), chips (0.91), cards (0.97), back buttons (0.88)
- [ ] **Chain question banner** — `FadeInDown` after card flip reveals chain prompt

### Performance check

```bash
# On Android emulator or physical device:
# Open Flipper or React Native DevTools
# Play a full round — check JS thread stays < 16ms
# All animations should show "UI thread" in profiler
```

### ✅ Acceptance criteria

- All animations from PRD §3.4 present and working
- No janky transitions on Android emulator (API 30)
- Card flip feels snappy (< 300ms total)
- TimerRing color transition is smooth

---

## Phase 6 — IAP & Monetisation

**Goal:** All packs purchasable. Unlocks persisted. Restore purchases working.

### Tasks

#### 6.1 Product setup (do before coding)

- [ ] Create 5 product IDs in App Store Connect (consumable → non-consumable one-time)
- [ ] Create 5 product IDs in Google Play Console (one-time products)
- [ ] Update `PACK_CONFIG` in `constants/config.ts` with real product IDs

#### 6.2 `usePacks.ts` — full implementation

```typescript
import * as IAP from "expo-in-app-purchases";

export function usePacks() {
  const dispatch = useAppDispatch();
  const { unlockedPackIds, iapStatus } = useAppSelector((s) => s.packs);

  const purchase = async (packId: PackId) => {
    dispatch(setIapStatus("loading"));
    try {
      await IAP.connectAsync();
      const productId = PACK_CONFIG[packId].productId;
      await IAP.purchaseItemAsync(productId);
      // IAP.setPurchaseListener handles the result
    } catch (e) {
      dispatch(setIapStatus("error"));
    }
  };

  const restore = async () => {
    const history = await IAP.getPurchaseHistoryAsync();
    const restored = history.results
      ?.map((p) => getPackIdFromProductId(p.productId))
      .filter(Boolean) as string[];
    dispatch(packsSlice.actions.restore(restored));
  };

  const isUnlocked = (packId: string) => unlockedPackIds.includes(packId);

  return { purchase, restore, isUnlocked, iapStatus };
}
```

- [ ] Set up `IAP.setPurchaseListener` in root `_layout.tsx` — handles purchase results globally
- [ ] On purchase success → `dispatch(unlock(packId))` → MMKV write
- [ ] On app boot → `loadUnlockedPacks()` from MMKV → dispatch to Redux

#### 6.3 PackUnlockSheet — full flow

- [ ] Shows pack name, category list, question count, price
- [ ] "Unlock for $X.XX" button → `purchase(packId)`
- [ ] Loading spinner during purchase
- [ ] Success: sheet closes, `CategoryCard` unlocks immediately (Redux state update)
- [ ] Error: show error toast, dismiss sheet

#### 6.4 All-packs bundle SKU

- [ ] `all_packs` product unlocks all 4 individual packs simultaneously

### ✅ Acceptance criteria

- Purchase flow completes in IAP sandbox (iOS) and test environment (Android)
- Unlock persists across app restarts (MMKV)
- Restore purchases re-unlocks previously purchased packs
- Locked categories become accessible immediately after purchase without restart
- Explicit categories still require 18+ age selection even after adult_18 purchase

---

## Phase 7 — Polish & QA

**Goal:** Production-ready. Accessible, edge cases handled, tested.

### Tasks

#### 7.1 Accessibility

- [ ] Audit: every `Pressable`, `TouchableOpacity`, button → add `accessibilityLabel`
- [ ] All icons → add `accessibilityLabel` or `accessibilityRole="image"` + `accessibilityHidden`
- [ ] `TimerRing` → `accessibilityLabel="X seconds remaining"`
- [ ] `QuestionCard` → `accessibilityLabel` updates after flip
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

#### 7.2 Edge cases

- [ ] **Empty question pool** — all categories locked + mood/age combo has 0 matches
  - Show `EmptyState` in GameSetup with message "No questions match these settings. Try changing your age group, mood, or unlocking a pack."
- [ ] **Single player** — no player rotation, just sequential questions, no scores shown
- [ ] **questions.json parse failure** — wrap `JSON.parse` in try-catch → `ErrorBoundary` with "Please reinstall the app" message
- [ ] **IAP unavailable** — device with no payment setup → catch error, show informative message
- [ ] **Quick Start with no saved config** — fallback to default config gracefully
- [ ] **Dedup exhaustion** — all questions recently played → reset recent IDs, shuffle entire pool

#### 7.3 Platform QA

**iOS**

- [ ] Safe area insets correct on all screen sizes (iPhone SE to Pro Max)
- [ ] Keyboard avoidance works in player name input
- [ ] Haptics work correctly (not too aggressive)
- [ ] IAP sandbox purchase completes end-to-end

**Android**

- [ ] Hardware back button on game screen shows confirm sheet
- [ ] Keyboard avoidance works with `behavior="height"`
- [ ] Status bar: translucent on game screen, normal on others
- [ ] No touch-clipping issues on any interactive elements
- [ ] Screen transitions are smooth (no flicker on `slide_from_right`)

#### 7.4 Dark mode

- [ ] Game screen already dark (`bg.game = #0F0F1A`)
- [ ] Other screens: add `useColorScheme()` detection
- [ ] Swap `bg.screen`, `bg.card`, text colors based on scheme
- [ ] Test all screens in dark mode

#### 7.5 Font scaling

- [ ] Test app at `Text Size: Larger Accessibility Sizes` (iOS Settings)
- [ ] Ensure no text truncation on question cards at 1.5× scale
- [ ] `maxFontSizeMultiplier={1.3}` on TimerRing and small labels

#### 7.6 Unit tests

```bash
npx jest --init  # if not already set up
```

- [ ] `utils/questionFilter.ts` — test age inheritance, mood filter, explicit gate, pack unlock
- [ ] `utils/shuffle.ts` — test Fisher-Yates distribution, dedup logic
- [ ] `utils/storage.ts` — mock MMKV, test save/load round-trips
- [ ] `store/slices/gameSlice.ts` — test startGame, scoring, streak bonus, endGame
- [ ] `store/slices/settingsSlice.ts` — test all settings mutations

#### 7.7 App Store preparation

- [ ] Screenshots for all required device sizes (iOS: 6.9", 6.5", 12.9" iPad)
- [ ] Screenshots for Android (phone + tablet)
- [ ] App description, keywords, privacy policy URL
- [ ] Age rating: 17+ (frequent/intense mature suggestive themes) for 18+ pack
- [ ] Privacy: no data collected, no network access at runtime → "Data Not Collected"

### ✅ Acceptance criteria

- All screens pass VoiceOver navigation without skipping elements
- Empty pool edge case shows helpful message instead of crashing
- Hardware back on Android never exits game without confirmation
- All unit tests pass
- No TypeScript errors: `npx tsc --noEmit`
- App submitted to TestFlight / Internal Testing

---

## Quick Reference

### File creation order (within each phase)

1. Types first — needed by everything else
2. Utils — pure functions, no dependencies
3. Redux slices — depend on types
4. Hooks — depend on slices
5. Components — depend on hooks + utils
6. Screens — depend on all of the above

### Key rules for Claude Code

- **Never** invent colors, spacing, or visual styles. All visual tokens come from the Stitch export in `constants/theme.ts`.
- **Never** add any `fetch()`, `axios`, or network calls. Zero network at runtime.
- **Never** use `Animated` from `react-native`. Always `useSharedValue` / `useAnimatedStyle` from Reanimated.
- **Always** read from `question.translations[lang] ?? question.text` — never hardcode English only.
- **Always** check `isCategoryAccessible()` before serving a question from a premium category.
- **Always** use `useAppSelector` and `useAppDispatch` typed hooks, never raw `useSelector`/`useDispatch`.
- **Always** add `accessibilityLabel` to every `Pressable` and button.
- The data file is **read-only** at runtime. Never mutate `questions.json`. Store all state in Redux + MMKV.

### Asking Claude Code to implement a specific task

Example prompts:

```
"Implement Phase 2, task 2.3 — utils/questionFilter.ts.
Use the AGE_INCLUDES map from the plan and the Question type from types/question.ts."

"Implement the QuestionCard component from Phase 4.4.
The 3D flip must use rotateY withSpring as specified in the plan."

"Implement gameSlice.ts. It needs loadQuestions, startGame (which calls buildQuestionPool
from utils/questionFilter.ts), nextQuestion, completeQuestion with streak bonus, skipQuestion, endGame."
```
