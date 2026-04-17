# Truth or Dare — Party Game

## Product Requirements Document

**Version:** 1.0.0 | **Type:** Offline-First Mobile Game | **Platforms:** iOS & Android

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system) — sourced from Stitch with Google
4. [Project Structure](#4-project-structure)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Specifications](#6-technical-specifications)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Platform Compatibility](#8-platform-compatibility)
9. [Development Milestones](#9-development-milestones)
10. [Risk Management](#10-risk-management)
11. [Appendix](#11-appendix)

---

## 1. Project Overview

**App Name:** `Truth or Dare — Party Game`

**Objective:** A fully offline-first mobile Truth or Dare game for iOS and Android. No account, no internet, no backend — everything runs entirely on device. Players pick an age group and mood, and the app serves questions from a local JSON database of 1,943 questions across 32 categories.

> **Core Principle:** This app has zero network calls at runtime. All game data (questions, progress, settings) is stored locally on device using MMKV. The app works identically on a phone in airplane mode.

**Core Value Props:**

- 1,943 questions across 32 categories — kids through 18+ — all bundled at install time
- Fully offline — zero internet required, ever
- No account, no login, no signup — open and play immediately
- 5 age groups with automatic question filtering
- 4 game moods: Party, Intimate, Chill, Icebreaker
- Premium categories unlockable via one-time in-app purchase (no subscription)
- Chain questions, Hot Seat mode, Escalating Series — unique mechanics
- 10-language support — all translations bundled locally
- Animations powered by React Native Reanimated v3

**Target Platforms:**

| Platform | Minimum               | Notes                                                     |
| -------- | --------------------- | --------------------------------------------------------- |
| iOS      | 15+                   | SafeAreaView + native navigation defaults                 |
| Android  | API 30+ (Android 11+) | BackHandler, explicit slide_from_right, overflow handling |

---

## 2. Tech Stack

| Layer            | Technology                   | Version | Purpose                                             |
| ---------------- | ---------------------------- | ------- | --------------------------------------------------- |
| Framework        | Expo (managed workflow)      | SDK 54  | Cross-platform React Native                         |
| Navigation       | Expo Router                  | v3      | File-based routing, screen transitions              |
| State Management | Redux Toolkit (RTK)          | v2      | Global state, game session, settings                |
| Local Storage    | MMKV                         | v2      | All game data, settings, unlock state — synchronous |
| Animations       | React Native Reanimated      | v3      | All spring/entering/interpolation animations        |
| Gestures         | React Native Gesture Handler | v2      | Swipe gestures on answer cards                      |
| Styling          | StyleSheet.create            | —       | Design tokens from `constants/theme.ts`             |
| Icons            | Lucide React Native          | latest  | Consistent iconography throughout                   |
| Fonts            | Expo Google Fonts            | latest  | Playfair Display, DM Sans, DM Mono                  |
| IAP              | expo-in-app-purchases        | latest  | One-time pack unlocks (iOS + Android)               |
| Haptics          | expo-haptics                 | latest  | Subtle feedback on card flip, answer reveal         |
| Audio            | expo-av                      | latest  | Optional sound effects (timer, flip, reveal)        |

> **Deliberately NOT included:** No Supabase, no network calls, no auth, no analytics SDK. The app has no runtime dependency on any external service.

---

## 3. Design System

> **Design Source:** UI/UX design is sourced from **Stitch with Google**. Before implementing any screen, export the design from Stitch and use the generated component code, colors, spacing, and typography directly. Do not invent styles — always follow the Stitch export.

### 3.1 Typography

```
Display / Titles : "Playfair Display" — Bold, Bold Italic
  — App wordmark, question card text, screen headings

Body / UI        : "DM Sans" — Regular (400), Medium (500), SemiBold (600), Bold (700)
  — All body text, labels, buttons, meta, UI copy

Monospace        : "DM Mono" — Regular (400)
  — Timer display, question ID badge, category code labels
```

**Type Scale:**

```
xs   : 11px — timestamps, tag labels, question ID
sm   : 13px — category chip text, meta info
base : 15px — body text, default UI
lg   : 18px — section labels, card previews
xl   : 22px — screen titles
2xl  : 28px — question text on card (main game)
3xl  : 36px — dare/truth heading on game card
4xl  : 48px — timer countdown
```

### 3.2 Spacing & Layout

```
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px

Border radius:
sm: 4px | md: 8px | lg: 12px | xl: 16px | 2xl: 24px | full: 9999px
```

### 3.3 Motion & Animation

All animations use **React Native Reanimated v3**. No `Animated` from React Native core.

**Screen transitions** (`app/(main)/_layout.tsx`):

- Home → Game Setup: `slide_from_right`, 280ms
- Game Setup → Playing: `slide_from_right`, 280ms
- Any screen → Settings: `slide_from_bottom` (modal feel), 340ms
- Back to Home: `fade`, 220ms

**Page-level entering animations:**

- `ScreenHeader`: `FadeInDown.springify()` 350ms
- Setup screen option rows: `FadeInDown.delay(n * 60)` staggered per row
- Category filter chips: `FadeInRight` staggered 50ms per index on mount
- Game card (new question): `FadeIn.delay(100)` 320ms
- Player name badges: `FadeInDown.delay(index * 40)` staggered
- Settings sections: `FadeInDown.delay(80).springify()` 380ms

**Interactive press animations** (all via `withSpring`):

- Setup option buttons: scale 1 → 0.95
- Category chips: scale 1 → 0.91
- Game card press: scale 1 → 0.97
- Back buttons, icon buttons: scale 1 → 0.88
- FAB: scale + rotation 0° → 45° on open + pulse glow when closed
- Pass / Done buttons: scale 1 → 0.93

**Game card flip animation:**

- 3D flip via `rotateY`: 0° → 90° (hide front) → 90° → 0° (reveal back), spring interpolation
- Card shadow intensifies during flip
- `expo-haptics` impactMedium on reveal

**Timer ring:**

- Circular SVG progress ring — Reanimated `withTiming` drives `strokeDashoffset`
- Color interpolates from safe → warning → danger as time depletes (colors from Stitch)
- Haptic pulse at 10 seconds remaining, rapid at 3 seconds

### 3.4 Component Style Rules

> Colors, exact spacing values, and visual styling come from the Stitch export. The rules below define layout structure, behavior, and font usage — not specific color values.

**QuestionCard:**

- Dark background card in game screen, light card in browse mode
- `TRUTH` / `DARE` label in Playfair Display Bold, 3xl, colored per type (from Stitch)
- Question text in Playfair Display Bold, 2xl, inverse text color
- Follow-up question shown smaller below in DM Sans Regular, sm, muted color
- Elevated shadow on dark background
- Front face shows type label + category chip + intensity dots (1–5)
- Back face reveals question text + follow_up_question

**Buttons (Button.tsx):**

- Primary: filled background (primary color), white text
- Secondary: transparent background, primary-color border + text
- Destructive: error-color background, white text
- Height: 52px, full border radius

**CategoryCard:**

- Light card, category color accent bar on left side (4px wide)
- Icon (emoji) + label + question count + age range badge
- Premium: lock icon overlay, tapping opens `PackUnlockSheet`

**TimerRing:**

- SVG circle, `strokeDashoffset` animated by Reanimated
- Radius 36, stroke width 4
- Center text: countdown in DM Mono Regular, 4xl

---

## 4. Project Structure

```
/
├── app/
│   ├── _layout.tsx                  # Root layout: Redux provider, fonts, ErrorBoundary, Toast
│   └── (main)/
│       ├── _layout.tsx              # Stack with screen transitions (slide/fade/bottom)
│       ├── index.tsx                # HomeScreen — app entry point, quick start
│       ├── setup.tsx                # GameSetupScreen — players, age, mood, category, options
│       ├── play.tsx                 # GameScreen — card flip, question, timer, scoring
│       ├── results.tsx              # ResultsScreen — round summary, ranking, play again
│       ├── categories.tsx           # CategoryBrowser — all 32 categories, pack unlock
│       └── settings.tsx             # SettingsScreen — sound, haptics, language, IAP restore
│
├── components/
│   ├── game/
│   │   ├── QuestionCard.tsx         # Flippable card — truth/dare label + question text + flip animation
│   │   ├── PlayerBadge.tsx          # Animated per-turn player indicator
│   │   ├── TimerRing.tsx            # Circular SVG countdown (Reanimated withTiming)
│   │   ├── MoodChip.tsx             # Mood selector chip (Party/Intimate/Chill/Icebreaker)
│   │   ├── AgeGroupPicker.tsx       # Age group selector with description text
│   │   ├── PlayerSetup.tsx          # Add/remove/rename player list
│   │   ├── CategoryCard.tsx         # Category browser card (icon, name, count, lock badge)
│   │   ├── ResultCard.tsx           # Per-player result row on results screen
│   │   └── StreakBadge.tsx          # Consecutive completed dares streak counter
│   ├── packs/
│   │   ├── PackUnlockSheet.tsx      # IAP bottom sheet — price + unlock button
│   │   └── PackBadge.tsx            # 'Premium' lock icon overlay on category cards
│   └── ui/
│       ├── Button.tsx               # Primary / secondary / destructive variants
│       ├── Input.tsx                # Text input with label + error display
│       ├── ScreenHeader.tsx         # App wordmark + icon buttons (FadeInDown entry)
│       ├── EmptyState.tsx           # Empty / no-results state with action button
│       ├── ErrorBoundary.tsx        # Global crash fallback UI
│       ├── Toast.tsx                # Lightweight toast notification system
│       ├── ConfirmSheet.tsx         # Confirmation bottom sheet
│       ├── Skeleton.tsx             # Skeleton loaders
│       └── FABMenu.tsx              # Expandable animated FAB
│
├── store/
│   ├── index.ts                     # Redux store config
│   ├── hooks.ts                     # useAppDispatch / useAppSelector (typed)
│   └── slices/
│       ├── gameSlice.ts             # Session: players, question pool, history, scores
│       ├── settingsSlice.ts         # Sound, haptics, defaultAge, defaultMood, language, theme
│       └── packsSlice.ts            # Unlocked pack IDs (persisted to MMKV)
│
├── hooks/
│   ├── useGame.ts                   # Game session logic: nextQuestion, complete, skip, end
│   ├── useQuestions.ts              # Filter + shuffle question pool from bundled data
│   ├── usePacks.ts                  # Check unlock status, trigger IAP purchase
│   └── useSettings.ts              # Read/write settings from Redux + MMKV
│
├── data/
│   └── questions.json               # Bundled question database (truth_dare_v5.json — 2.7MB)
│
├── constants/
│   ├── categories.ts                # CATEGORIES array: id, label, color, icon, packId
│   ├── theme.ts                     # Design tokens: colors, spacing, fontSize, radius
│   └── config.ts                    # GAME_CONFIG, TIMER_DURATIONS, PACK_CONFIG
│
├── types/
│   ├── game.ts                      # Player, GameSession, GameConfig, TurnResult
│   ├── question.ts                  # Question, CategoryId, AgeGroup, Mood, PackId
│   └── store.ts                     # RootState, AppDispatch
│
├── utils/
│   ├── questionFilter.ts            # Filter by age, mood, category, relationship_type
│   ├── shuffle.ts                   # Fisher-Yates shuffle + dedup last 20 served IDs
│   ├── storage.ts                   # MMKV: saveSettings, loadSettings, saveUnlocks, saveRecentIds
│   └── errorHandler.ts              # mapError for crash boundary
│
├── app.json
├── babel.config.js
└── tsconfig.json                    # strict: true, zero any
```

---

## 5. Functional Requirements

### 5.1 Home Screen (`index.tsx`)

- App wordmark (Playfair Display) + subtitle
- **Quick Start** button — starts game instantly with last-used settings from MMKV
- **New Game** button — navigates to GameSetup screen
- **Browse Categories** button — opens category browser
- Settings icon in header (top right)
- Zero loading state — instant render, no network check, no auth check

### 5.2 Game Setup Screen (`setup.tsx`)

#### Player Setup

- Add up to 8 players — name input + Add button
- Each player shown as animated badge with remove button
- Default: single player called "Player 1" — game works with 1 person
- Player names saved to MMKV as last-used

#### Age Group Selector

- 5 options with labels and age ranges:
  - **Kids** (6–12) — wholesome only, intensity 1–2
  - **Teens** (13–17) — school and social, intensity 1–3
  - **Young Adult** (18–24) — college/social life, intensity 1–4
  - **Adult** (25–40) — career and relationships, intensity 1–4
  - **18+** — all content including explicit categories, intensity 1–5
- Selecting 18+ shows age confirmation nudge (UI only, no hard gate)
- Explicit categories (`explicit: true`) only served when 18+ is selected
- Last-used age group persisted to MMKV

#### Age Group Inheritance (question filtering):

```
kids        → questions where age_group === 'kids'
teens       → age_group in ['kids', 'teens']
young_adult → age_group in ['kids', 'teens', 'young_adult']
adult       → age_group in ['kids', 'teens', 'young_adult', 'adult']
18plus      → all age groups including 18plus
```

#### Mood Selector

- 4 chips: **Party** 🎉, **Intimate** 💫, **Chill** 🌿, **Icebreaker** 👋
- One-line description shown below the chip row
- Filters question pool by `mood` field on question objects
- `FadeInRight` stagger animation on chip row mount

#### Category Selection (optional)

- Default: "All Categories" — uses entire unlocked question pool
- Optional: select one or more specific categories
- Premium (locked) categories show lock icon — tapping opens `PackUnlockSheet`

#### Advanced Options (collapsible section)

- **Timer:** Off / 30s / 60s / 90s
- **Questions per round:** 5 / 10 / 15 / 20 / Unlimited
- **Allow skips:** On / Off
- **Type filter:** Mixed (default) / Truth only / Dare only

### 5.3 Game Screen (`play.tsx`)

#### Player Turn Flow

1. Header shows current player name badge — `FadeInDown` on each turn change
2. Large `QuestionCard` in center — initially shows front face (type + category)
3. Player taps card → 3D flip reveals question text
4. Timer ring starts after flip (if timer enabled)
5. Two action buttons after flip: **✓ Done** and **⟳ Skip** (if skips allowed)
6. On Done/Skip: next player, new question animates in

#### QuestionCard Behavior

- **Front face:** TRUTH or DARE label + category chip + intensity indicator (1–5 dots)
- **Back face:** Question text (Playfair Display 2xl) + `follow_up_question` (DM Sans sm, muted)
- **Chain question** (`chain === true`): after answer, show `chain_prompt` banner to next player with current player's name substituted for `{player}`
- **Hot seat** (`hot_seat === true`): show group prompt banner — "Everyone fires questions at [player] for [duration_seconds] seconds"
- **Escalation level** (`escalation_level !== null`): show badge "Level X/5" on card

#### Scoring

| Action                                   | Points   |
| ---------------------------------------- | -------- |
| Completed dare                           | +2       |
| Completed truth                          | +1       |
| Skipped (if allowed)                     | −1       |
| Streak bonus (every 3 consecutive dares) | +1 extra |

Scores live in Redux `gameSlice` — no MMKV persistence needed.

#### Game Progress

- Progress bar at top: `currentQuestionIndex / totalQuestionsInRound`
- "End Game" button in header (with confirm sheet)
- Round ends automatically when question count reached → navigates to ResultsScreen

### 5.4 Results Screen (`results.tsx`)

- Players ranked by score (highest first)
- Winner row highlighted with confetti animation (Reanimated particles)
- Each player row: name, total score, truths completed, dares completed, skips used
- Three action buttons: **Play Again** (same settings), **New Game** (back to setup), **Home**

### 5.5 Category Browser (`categories.tsx`)

- Grid of `CategoryCard` components — all 32 categories
- Each card: emoji icon, label, question count, age range badge, free/premium badge
- Premium cards: lock icon overlay — tap to open `PackUnlockSheet`
- Filter chips at top: All / Free / Premium / By Age Group
- Tapping a free/unlocked category → navigates to GameSetup with that category pre-selected

### 5.6 Settings Screen (`settings.tsx`)

- **Sound effects:** On / Off toggle
- **Haptic feedback:** On / Off toggle
- **Default age group:** picker (saved to MMKV)
- **Default mood:** picker (saved to MMKV)
- **Language:** picker — 10 options (en, es, zh, hi, ar, pt, fr, id, vi, ja, de)
- **Restore Purchases:** button (calls IAP restore)
- App version + question database version displayed at bottom

### 5.7 Question Serving Logic

```typescript
// Load once at app boot in root _layout.tsx
import questions from "../data/questions.json";
// Parse once → dispatch to Redux → never re-parse

// Per game start — build and shuffle pool
function buildPool(config: GameConfig, unlockedPacks: string[]): Question[] {
  return questions
    .filter((q) => matchesAgeGroup(q.age_group, config.ageGroup)) // age inheritance
    .filter((q) => !config.mood || q.mood === config.mood)
    .filter((q) => !q.flagged)
    .filter((q) => isCategoryAccessible(q, unlockedPacks)) // free or unlocked
    .filter((q) => config.typeFilter === "both" || q.type === config.typeFilter)
    .filter(
      (q) =>
        config.categoryIds === "all" ||
        config.categoryIds.includes(getCategoryId(q.id)),
    );
}

// Shuffle + dedup
function preparePool(pool: Question[], recentIds: string[]): Question[] {
  const deduped = pool.filter((q) => !recentIds.includes(q.id));
  return fisherYates(deduped.length > 10 ? deduped : pool); // fallback if dedup too aggressive
}
```

- **Language serving:** `question.translations[selectedLang] ?? question.text` (always fallback to English)
- **Recent IDs:** last 20 served question IDs stored in MMKV — excluded from next pool build
- **Related questions:** after an answer, optionally surface `related_questions[0]` as a "bonus prompt" shown beneath Done button

---

## 6. Technical Specifications

### 6.1 Redux Store Shape

```typescript
interface RootState {
  game: {
    session: GameSession | null; // active game or null
    history: QuestionHistory[]; // questions served this session
    isActive: boolean;
  };
  settings: {
    soundEnabled: boolean; // default: true
    hapticEnabled: boolean; // default: true
    defaultAgeGroup: AgeGroup; // default: 'teens'
    defaultMood: Mood; // default: 'party'
    language: LanguageCode; // default: 'en'
    theme: "light" | "dark" | "system"; // default: 'system'
  };
  packs: {
    unlockedPackIds: string[]; // persisted to MMKV on every change
    iapStatus: "idle" | "loading" | "success" | "error";
  };
}
```

### 6.2 Key Data Types

```typescript
// types/question.ts
export type AgeGroup = "kids" | "teens" | "young_adult" | "adult" | "18plus";
export type Mood = "party" | "intimate" | "chill" | "icebreaker";
export type LanguageCode =
  | "en"
  | "es"
  | "zh"
  | "hi"
  | "ar"
  | "pt"
  | "fr"
  | "id"
  | "vi"
  | "ja"
  | "de";
export type PackId = "couples" | "adult_life" | "deep_dive" | "adult_18";

export interface Question {
  id: string;
  type: "truth" | "dare";
  age_group: AgeGroup;
  text: string;
  tags: string[];
  sub_tags: string[];
  group_size: "solo" | "pair" | "group";
  intensity: 1 | 2 | 3 | 4 | 5;
  duration_seconds: number | null;
  seasonal: string;
  flagged: boolean;
  mood: Mood;
  props: string[];
  relationship_type: string[];
  chain: boolean;
  chain_prompt: string | null;
  hot_seat: boolean;
  escalation_level: number | null;
  screenshot_moment: boolean;
  reaction_prompt: string | null;
  follow_up_question: string;
  related_questions: string[];
  bundle_id: string | null;
  translations: Partial<Record<LanguageCode, string>>;
  analytics: {
    times_played: number;
    times_skipped: number;
    times_completed: number;
    avg_reaction: number | null;
    skip_rate: number | null;
    completion_rate: number | null;
  };
}

// types/game.ts
export interface Player {
  id: string;
  name: string;
  score: number;
  truthsCompleted: number;
  daresCompleted: number;
  skips: number;
  streak: number; // consecutive dares completed
}

export interface GameConfig {
  ageGroup: AgeGroup;
  mood: Mood;
  categoryIds: string[] | "all";
  timer: 0 | 30 | 60 | 90;
  questionsPerRound: number | "unlimited";
  allowSkips: boolean;
  typeFilter: "both" | "truth" | "dare";
}

export interface GameSession {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  config: GameConfig;
  questionPool: Question[];
  currentQuestionIndex: number;
  startedAt: Date;
}
```

### 6.3 MMKV Persistence Keys

| Key                   | Type            | Description                                             |
| --------------------- | --------------- | ------------------------------------------------------- |
| `settings`            | JSON object     | Full settings object — written on every settings change |
| `unlocked_packs`      | JSON string[]   | Array of unlocked pack IDs                              |
| `recent_question_ids` | JSON string[]   | Last 20 served question IDs for dedup                   |
| `last_players`        | JSON string[]   | Last-used player names for Quick Start                  |
| `last_game_config`    | JSON GameConfig | Last GameConfig for Quick Start                         |

### 6.4 In-App Purchase Structure

| Pack ID      | Price | Categories Unlocked                                                                     | Questions |
| ------------ | ----- | --------------------------------------------------------------------------------------- | --------- |
| `couples`    | $1.99 | Couples Edition                                                                         | 58        |
| `adult_life` | $1.99 | Work & Career, Money & Status                                                           | 85        |
| `deep_dive`  | $1.99 | Dream vs Reality, Confessions, Escalating Series                                        | 81        |
| `adult_18`   | $2.99 | Spicy Relationships, After Dark, Dark Secrets, Chemistry & Attraction, Desire & Honesty | 203       |
| `all_packs`  | $5.99 | All 4 packs (bundle discount)                                                           | 427       |

**IAP Flow:**

1. User taps locked category card → `PackUnlockSheet` opens
2. Sheet shows pack name, price, question count, "Unlock" button
3. Tap Unlock → `expo-in-app-purchases` purchase flow
4. On success → dispatch `packsSlice.unlock(packId)` → write to MMKV → sheet closes → category accessible immediately
5. Settings screen: "Restore Purchases" calls IAP restore → re-unlocks all previously purchased packs

### 6.5 Category Accessibility Logic

```typescript
// constants/categories.ts — each category has a packId field
// packId: null = free, 'couples' | 'adult_life' | 'deep_dive' | 'adult_18' = premium

function isCategoryAccessible(
  question: Question,
  unlockedPacks: string[],
): boolean {
  const category = CATEGORIES.find((c) => c.id === getCategoryId(question.id));
  if (!category) return false;
  if (!category.packId) return true; // free category
  return unlockedPacks.includes(category.packId); // check unlock
}
```

### 6.6 gameSlice Actions

```typescript
// store/slices/gameSlice.ts
startGame(config: GameConfig, players: Player[])     // builds pool, shuffles, sets session
nextQuestion()                                         // advances currentQuestionIndex + currentPlayerIndex
completeQuestion(type: 'truth' | 'dare')              // +1 or +2 score, update streak
skipQuestion()                                         // -1 score, reset streak
endGame()                                              // clears session, keeps history
resetGame()                                            // full reset for Play Again
```

---

## 7. Non-Functional Requirements

| Requirement           | Target               | Implementation                                                                          |
| --------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| App cold start        | < 1.5 seconds        | questions.json parsed at boot, MMKV synchronous read — first frame has no loading state |
| Question render       | < 50ms               | Pool pre-filtered and shuffled on game start, not per question                          |
| Animation performance | 60fps on mid-range   | All animations on UI thread via Reanimated v3                                           |
| TypeScript            | Strict, zero `any`   | `"strict": true` in tsconfig.json                                                       |
| Accessibility         | WCAG 2.1 AA          | `accessibilityLabel` on all interactive elements, 44×44pt minimum touch targets         |
| Offline               | 100% — no exceptions | No network calls at runtime, ever. Works in airplane mode.                              |
| Bundle size           | < 25MB               | questions.json ~2.7MB, assets optimized                                                 |
| IAP security          | Platform-validated   | expo-in-app-purchases handles receipt validation natively                               |

---

## 8. Platform Compatibility

### iOS (15+)

- `SafeAreaView` + `edges` prop on all screens
- `KeyboardAvoidingView behavior="padding"` in player name input
- `BackHandler` not needed — swipe navigation handles back
- Haptics via `expo-haptics`: `impactLight`, `impactMedium`, `notificationSuccess`
- IAP via `expo-in-app-purchases` (StoreKit 2 compatible)

### Android (API 30+)

- `KeyboardAvoidingView behavior="height"` in player name input
- `BackHandler.addEventListener("hardwareBackPress")` on game screen — shows "End Game?" confirm sheet
- `slide_from_right` animation explicitly set in `_layout.tsx`
- `overflow: "hidden"` not used on interactive containers (clips touch events)
- Status bar: translucent on game screen (dark immersive), normal elsewhere

### Shared Rules

- All animations via Reanimated on UI thread — no JS-thread jank
- `questions.json` parsed once at app boot — never re-parsed on navigation
- No `Animated` from React Native core (Reanimated only)
- No runtime network calls under any circumstances

---

## 9. Development Milestones

### Phase 1 — Foundation

- [ ] Expo SDK 54 + TypeScript strict + Expo Router v3
- [ ] Install: Reanimated v3, Gesture Handler v2, MMKV v2, Redux Toolkit v2
- [ ] Install: Lucide React Native, react-native-svg
- [ ] Install: expo-haptics, expo-av, expo-in-app-purchases
- [ ] Install: @expo-google-fonts/playfair-display, /dm-sans, /dm-mono
- [ ] `constants/theme.ts` — all design tokens
- [ ] `constants/categories.ts` — all 32 category definitions with packId
- [ ] `constants/config.ts` — GAME_CONFIG, TIMER_DURATIONS, PACK_CONFIG
- [ ] ErrorBoundary + Toast system
- [ ] Redux store scaffold: gameSlice, settingsSlice, packsSlice (empty shells)

### Phase 2 — Data Layer

- [ ] Copy `truth_dare_v5.json` → `data/questions.json`
- [ ] `types/question.ts` — full Question type matching JSON schema
- [ ] `types/game.ts` — Player, GameSession, GameConfig, TurnResult
- [ ] `types/store.ts` — RootState, AppDispatch
- [ ] `utils/questionFilter.ts` — buildQuestionPool with age group inheritance
- [ ] `utils/shuffle.ts` — Fisher-Yates + dedup last 20 served IDs
- [ ] `utils/storage.ts` — MMKV read/write for all 5 persistence keys
- [ ] `gameSlice.ts` — startGame, nextQuestion, completeQuestion, skipQuestion, endGame, resetGame
- [ ] `settingsSlice.ts` — all fields, MMKV sync on every change
- [ ] `packsSlice.ts` — unlock, restore, isUnlocked selector, MMKV persistence
- [ ] `hooks/useGame.ts` — orchestrates gameSlice actions
- [ ] `hooks/useQuestions.ts` — pool building from Redux state
- [ ] `hooks/usePacks.ts` — IAP purchase + unlock flow
- [ ] `hooks/useSettings.ts` — settings read/write

### Phase 3 — UI Components

- [ ] `Button.tsx` — primary / secondary / destructive, height 52px
- [ ] `Input.tsx` — label + error + character count
- [ ] `ScreenHeader.tsx` — wordmark + icon buttons (FadeInDown entry)
- [ ] `EmptyState.tsx` — empty / no-results state
- [ ] `Toast.tsx` — lightweight toast system
- [ ] `ConfirmSheet.tsx` — bottom sheet with confirm/cancel
- [ ] `Skeleton.tsx` — skeleton loaders for loading states
- [ ] `FABMenu.tsx` — expandable animated FAB (rotation + pulse + spring items)
- [ ] `MoodChip.tsx` — mood selector chip with FadeInRight stagger
- [ ] `AgeGroupPicker.tsx` — 5 options with description text
- [ ] `PlayerSetup.tsx` — add/remove/rename players, animated badge list
- [ ] `PlayerBadge.tsx` — FadeInDown per-turn animated indicator
- [ ] `CategoryCard.tsx` — icon, name, count, age badge, lock overlay
- [ ] `PackBadge.tsx` + `PackUnlockSheet.tsx` — IAP trigger bottom sheet
- [ ] `TimerRing.tsx` — SVG circular progress + Reanimated withTiming + color interpolation
- [ ] `StreakBadge.tsx` — consecutive dare streak counter
- [ ] `ResultCard.tsx` — per-player result row

### Phase 4 — Game Screens

- [ ] `HomeScreen` (`index.tsx`) — Quick Start + New Game + Browse + Settings icon
- [ ] `GameSetupScreen` (`setup.tsx`) — all 4 sections + advanced options collapsible
- [ ] `QuestionCard.tsx` — 3D flip animation (rotateY spring), truth/dare label, question, follow_up, chain/escalation handling
- [ ] `GameScreen` (`play.tsx`) — player rotation, card flip, timer ring, done/skip, live score, progress bar, end game
- [ ] `ResultsScreen` (`results.tsx`) — ranking, confetti particles, play again / new game / home
- [ ] `CategoryBrowser` (`categories.tsx`) — grid of CategoryCards, filter chips, IAP locked state
- [ ] `SettingsScreen` (`settings.tsx`) — all toggles, language picker, restore purchases, version info

### Phase 5 — Animations

- [ ] Screen transitions in `_layout.tsx` (slide/fade/bottom)
- [ ] FadeInDown entering on all ScreenHeaders and page sections
- [ ] FadeInRight stagger on all chip rows (mood, age group, category filter)
- [ ] Spring press scale on all interactive elements (per spec in section 3.4)
- [ ] QuestionCard 3D flip — rotateY spring interpolation + shadow + haptic on reveal
- [ ] TimerRing — withTiming strokeDashoffset + color interpolation teal→amber→red + haptic pulses
- [ ] FABMenu — rotation + pulse glow ring + spring child items
- [ ] ResultsScreen confetti — Reanimated particle system (scale + opacity + translate)
- [ ] PlayerBadge — FadeInDown.delay(index \* 40) per turn stagger
- [ ] Chain question banner — FadeInDown after answer reveal

### Phase 6 — IAP & Monetisation

- [ ] `expo-in-app-purchases` full integration
- [ ] Configure product IDs in App Store Connect + Google Play Console
- [ ] `PackUnlockSheet` — price display, purchase button, loading/success/error states
- [ ] `packsSlice.unlock` → MMKV write → category filter updates immediately
- [ ] Restore purchases flow in Settings screen
- [ ] All premium categories locked by default, unlocked immediately on purchase
- [ ] `all_packs` bundle SKU at $5.99

### Phase 7 — Polish & QA

- [ ] Accessibility audit: all interactive elements have `accessibilityLabel`
- [ ] Dark mode support (game screen already dark; light screens need theme-aware tokens)
- [ ] iOS QA: safe areas, keyboard, haptics, IAP sandbox testing
- [ ] Android QA: hardware back button, keyboard layout, status bar, back on game screen
- [ ] Font scaling QA at 1.5×
- [ ] Unit tests: slices, questionFilter, shuffle, storage utils
- [ ] Edge case: empty question pool (all categories locked + mood/age combo has no matches) → show helpful message
- [ ] Edge case: single player mode (no player rotation, just sequential questions)
- [ ] Edge case: `questions.json` parse failure → ErrorBoundary with reinstall message
- [ ] App Store + Play Store submission assets (screenshots, descriptions, age rating)

---

## 10. Risk Management

| Risk                                        | Likelihood | Impact   | Mitigation                                                                          |
| ------------------------------------------- | ---------- | -------- | ----------------------------------------------------------------------------------- |
| `questions.json` parse fails on boot        | Low        | Critical | Wrap in try-catch → ErrorBoundary with "Reinstall app" message                      |
| Empty question pool after filters           | Medium     | Medium   | Show "No questions match" screen with suggestion to change age/mood or unlock packs |
| IAP purchase fails / receipt invalid        | Medium     | Medium   | `expo-in-app-purchases` handles retry; show toast; don't block free gameplay        |
| 18+ content served to minors                | Low        | High     | `explicit: true` categories strictly gated behind 18+ age selection + IAP purchase  |
| MMKV read/write failure                     | Very Low   | High     | Wrap all MMKV calls in try-catch → fall back to defaults, never crash app           |
| Android hardware back exits game mid-round  | Medium     | Low      | BackHandler shows "End Game?" ConfirmSheet — prevents accidental exit               |
| Very large pool slowing shuffle             | Low        | Low      | Fisher-Yates is O(n) — 1,943 items shuffles in < 2ms                                |
| Translation missing for selected language   | Medium     | Low      | Always fallback to `question.text` (English) if `translations[lang]` is absent      |
| Reanimated v3 / Expo SDK 54 breaking change | Low        | Medium   | Pin exact versions in package.json; test before upgrading                           |
| Questions repeat too quickly                | Low        | Low      | 20-item recent-ID dedup in MMKV prevents repeats across sessions                    |

---

## 11. Appendix

### 11.1 Environment Setup

```bash
# 1. Create project
npx create-expo-app@latest truth-or-dare --template blank-typescript
cd truth-or-dare

# 2. Core dependencies
npx expo install expo-router react-native-reanimated react-native-gesture-handler
npx expo install react-native-mmkv @reduxjs/toolkit react-redux
npx expo install lucide-react-native react-native-svg

# 3. Feature dependencies
npx expo install expo-haptics expo-av expo-in-app-purchases

# 4. Fonts
npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono

# 5. Copy data file
cp truth_dare_v5.json ./data/questions.json
```

### 11.2 Data File Reference

The bundled question database (`data/questions.json`) has the following structure. Each question object contains:

```
id, type, age_group, text, tags, sub_tags, group_size, intensity, duration_seconds,
seasonal, flagged, mood, props, relationship_type, chain, chain_prompt, hot_seat,
escalation_level, screenshot_moment, reaction_prompt, follow_up_question,
related_questions, bundle_id, translations, analytics
```

Category objects contain:

```
id, label, icon, color, explicit, questions[], pack.{ is_premium, pack_id,
unlock_price_usd, recommended_group_size, recommended_duration_minutes, best_for }
```

### 11.3 Reference Links

| Resource                        | URL                                                        |
| ------------------------------- | ---------------------------------------------------------- |
| Expo Docs                       | https://docs.expo.dev                                      |
| Expo Router v3                  | https://expo.github.io/router                              |
| React Native Reanimated v3      | https://docs.swmansion.com/react-native-reanimated         |
| React Native Gesture Handler v2 | https://docs.swmansion.com/react-native-gesture-handler    |
| Redux Toolkit                   | https://redux-toolkit.js.org                               |
| react-native-mmkv               | https://github.com/mrousavy/react-native-mmkv              |
| expo-in-app-purchases           | https://docs.expo.dev/versions/latest/sdk/in-app-purchases |
| expo-haptics                    | https://docs.expo.dev/versions/latest/sdk/haptics          |
| Playfair Display                | https://fonts.google.com/specimen/Playfair+Display         |
| DM Sans                         | https://fonts.google.com/specimen/DM+Sans                  |
| DM Mono                         | https://fonts.google.com/specimen/DM+Mono                  |
