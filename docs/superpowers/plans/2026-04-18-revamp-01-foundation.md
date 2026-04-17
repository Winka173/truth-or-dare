# UI Revamp — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all visual tokens, install new dependencies, update base store slices, and build the 7 shared UI components that every screen in Plans 2–5 will use.

**Architecture:** All screens share a `GradientScreen` wrapper (per-screen gradient via `expo-linear-gradient`) and a `FrostedCard` surface (frosted glass via `expo-blur`). All interactive elements use a shared spring press animation from `constants/theme.ts`. Store slices gain 4 new fields without breaking existing functionality.

**Tech Stack:** React Native, Expo SDK 54, Redux Toolkit, react-native-reanimated 4.x, expo-linear-gradient, expo-blur, moti, lottie-react-native, @expo-google-fonts/baloo-2, @expo-google-fonts/outfit

---

## Task 1: Replace font packages and install new dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall old font packages**

```bash
cd "C:\Users\Winka\OneDrive\Documents\truth-or-dare"
npm uninstall @expo-google-fonts/playfair-display @expo-google-fonts/dm-sans @expo-google-fonts/dm-mono
```

Expected: 3 packages removed from node_modules and package.json.

- [ ] **Step 2: Install new font packages**

```bash
npx expo install @expo-google-fonts/baloo-2 @expo-google-fonts/outfit
```

Expected: Both packages appear in `package.json` dependencies.

- [ ] **Step 3: Install gradient and blur packages**

```bash
npx expo install expo-linear-gradient expo-blur
```

Expected: Both packages appear in `package.json` dependencies.

- [ ] **Step 4: Install animation libraries**

```bash
npm install moti
npx expo install lottie-react-native
```

Expected: Both packages appear in `package.json` dependencies.

- [ ] **Step 5: Verify package.json**

Confirm present: `@expo-google-fonts/baloo-2`, `@expo-google-fonts/outfit`, `expo-linear-gradient`, `expo-blur`, `moti`, `lottie-react-native`
Confirm absent: `@expo-google-fonts/playfair-display`, `@expo-google-fonts/dm-sans`, `@expo-google-fonts/dm-mono`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: replace font packages, add expo-linear-gradient, expo-blur, moti, lottie"
```

---

## Task 2: Rewrite constants/theme.ts

**Files:**
- Modify: `constants/theme.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
// constants/theme.ts
export type GradientKey = 'splash' | 'home' | 'setup' | 'handoff' | 'play' | 'results';

export const gradients: Record<GradientKey, [string, string]> = {
  splash:  ['#FF6B6B', '#FFB347'],
  home:    ['#A855F7', '#EC4899'],
  setup:   ['#38BDF8', '#34D399'],
  handoff: ['#FB923C', '#FBBF24'],
  play:    ['#6366F1', '#A855F7'],
  results: ['#EC4899', '#FBBF24'],
};

export const darkGradients: Record<GradientKey, [string, string]> = {
  splash:  ['#1A0A0A', '#2D1515'],
  home:    ['#0D0320', '#1A0A1A'],
  setup:   ['#020D1A', '#021A12'],
  handoff: ['#1A0D02', '#1A1502'],
  play:    ['#02020D', '#0D021A'],
  results: ['#1A0212', '#1A1502'],
};

export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  frostedLight:  'rgba(255,255,255,0.15)',
  frostedDark:   'rgba(255,255,255,0.08)',
  frostedBorder: 'rgba(255,255,255,0.20)',
  textOnGradient:      '#FFFFFF',
  textMutedOnGradient: 'rgba(255,255,255,0.70)',
  truth:   '#38BDF8',
  dare:    '#FB923C',
  gold:    '#FBBF24',
  silver:  '#94A3B8',
  bronze:  '#F97316',
  success: '#34D399',
  warning: '#FBBF24',
  error:   '#F87171',
  lock:    'rgba(255,255,255,0.40)',
};

export const fonts = {
  heading:  'Baloo2_800ExtraBold',
  body:     'Outfit_400Regular',
  bodySemi: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
};

export const spacing = {
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 9999,
} as const;

export const animation = {
  spring:       { damping: 12, stiffness: 180 } as const,
  springBouncy: { damping: 8,  stiffness: 180 } as const,
  springGentle: { damping: 20, stiffness: 120 } as const,
  pressScale:   0.93,
  selectScale:  1.03,
} as const;
```

- [ ] **Step 2: Run typecheck — note but do not fix errors from old theme references**

```bash
npm run typecheck
```

Errors referencing old shape (e.g., `colors.bg.screen`) are expected — they will be fixed when screens are rewritten in Plan 2. Do not fix them now.

- [ ] **Step 3: Commit**

```bash
git add constants/theme.ts
git commit -m "feat: new theme tokens — gradients, Baloo2/Outfit fonts, animation constants"
```

---

## Task 3: Update app/_layout.tsx to load new fonts

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
// app/_layout.tsx
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { isRTL } from '@/locales';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { store } from '@/store';
import { loadQuestions } from '@/store/slices/gameSlice';
import { hydrate as hydrateSettings } from '@/store/slices/settingsSlice';
import { hydrate as hydratePacks } from '@/store/slices/packsSlice';
import { hydrate as hydrateFavorites } from '@/store/slices/favoritesSlice';
import { safeFlattenQuestions } from '@/utils/questionLoader';
import { storageApi } from '@/utils/storage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import questionsData from '@/data/questions.json';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — may already be hidden */
});

(function boot() {
  try {
    const flattened = safeFlattenQuestions(questionsData);
    if (flattened.length > 0) store.dispatch(loadQuestions(flattened));

    const savedSettings = storageApi.loadSettings();
    if (savedSettings) store.dispatch(hydrateSettings(savedSettings));

    const savedPacks = storageApi.loadUnlockedPacks();
    if (savedPacks.length > 0) store.dispatch(hydratePacks(savedPacks));

    const savedFavorites = storageApi.loadFavoriteIds();
    if (savedFavorites.length > 0) store.dispatch(hydrateFavorites(savedFavorites));

    const lang = store.getState().settings.language;
    const wantsRTL = isRTL(lang);
    if (wantsRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
    }
  } catch (err) {
    if (__DEV__) console.error('Boot failure:', err);
  }
})();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_800ExtraBold,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors introduced by this file.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load Baloo2 + Outfit fonts, remove old font imports from root layout"
```

---

## Task 4: Add onboardingComplete, ttsEnabled, preferredVoiceId to settingsSlice

**Files:**
- Modify: `store/slices/settingsSlice.ts`
- Modify: `store/slices/__tests__/settingsSlice.test.ts`

- [ ] **Step 1: Write failing tests — add to settingsSlice.test.ts**

```typescript
import {
  settingsSlice,
  hydrate,
  setOnboardingComplete,
  setTtsEnabled,
  setPreferredVoiceId,
} from '../settingsSlice';

describe('new settings fields', () => {
  it('initialises onboardingComplete to false', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.onboardingComplete).toBe(false);
  });

  it('initialises ttsEnabled to true', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.ttsEnabled).toBe(true);
  });

  it('initialises preferredVoiceId to null', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.preferredVoiceId).toBeNull();
  });

  it('setOnboardingComplete sets the flag', () => {
    const state = settingsSlice.reducer(undefined, setOnboardingComplete(true));
    expect(state.onboardingComplete).toBe(true);
  });

  it('setTtsEnabled sets the flag', () => {
    const state = settingsSlice.reducer(undefined, setTtsEnabled(false));
    expect(state.ttsEnabled).toBe(false);
  });

  it('setPreferredVoiceId stores the id', () => {
    const state = settingsSlice.reducer(
      undefined,
      setPreferredVoiceId('com.apple.voice.compact.en-US.Samantha'),
    );
    expect(state.preferredVoiceId).toBe('com.apple.voice.compact.en-US.Samantha');
  });

  it('hydrate merges new fields', () => {
    const state = settingsSlice.reducer(
      undefined,
      hydrate({ onboardingComplete: true, ttsEnabled: false, preferredVoiceId: 'voice-1' }),
    );
    expect(state.onboardingComplete).toBe(true);
    expect(state.ttsEnabled).toBe(false);
    expect(state.preferredVoiceId).toBe('voice-1');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest store/slices/__tests__/settingsSlice.test.ts --no-coverage
```

Expected: FAIL — `setOnboardingComplete is not a function`.

- [ ] **Step 3: Replace settingsSlice.ts**

```typescript
// store/slices/settingsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { GAME_CONFIG } from '@/constants/config';
import type { AgeGroup, LanguageCode, Mood } from '@/types/question';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  defaultAgeGroup: AgeGroup;
  defaultMood: Mood;
  language: LanguageCode;
  theme: ThemePreference;
  onboardingComplete: boolean;
  ttsEnabled: boolean;
  preferredVoiceId: string | null;
}

const initialState: SettingsState = {
  soundEnabled: true,
  hapticEnabled: true,
  defaultAgeGroup: GAME_CONFIG.DEFAULT_AGE_GROUP,
  defaultMood: GAME_CONFIG.DEFAULT_MOOD,
  language: GAME_CONFIG.DEFAULT_LANGUAGE,
  theme: 'system',
  onboardingComplete: false,
  ttsEnabled: true,
  preferredVoiceId: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
    },
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },
    setHapticEnabled(state, action: PayloadAction<boolean>) {
      state.hapticEnabled = action.payload;
    },
    setDefaultAgeGroup(state, action: PayloadAction<AgeGroup>) {
      state.defaultAgeGroup = action.payload;
    },
    setDefaultMood(state, action: PayloadAction<Mood>) {
      state.defaultMood = action.payload;
    },
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setOnboardingComplete(state, action: PayloadAction<boolean>) {
      state.onboardingComplete = action.payload;
    },
    setTtsEnabled(state, action: PayloadAction<boolean>) {
      state.ttsEnabled = action.payload;
    },
    setPreferredVoiceId(state, action: PayloadAction<string | null>) {
      state.preferredVoiceId = action.payload;
    },
  },
});

export const {
  hydrate,
  setSoundEnabled,
  setHapticEnabled,
  setDefaultAgeGroup,
  setDefaultMood,
  setLanguage,
  setTheme,
  setOnboardingComplete,
  setTtsEnabled,
  setPreferredVoiceId,
} = settingsSlice.actions;
export default settingsSlice.reducer;
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest store/slices/__tests__/settingsSlice.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add store/slices/settingsSlice.ts store/slices/__tests__/settingsSlice.test.ts
git commit -m "feat: add onboardingComplete, ttsEnabled, preferredVoiceId to settingsSlice"
```

---

## Task 5: Add CustomQuestion type and customQuestions to gameSlice

**Files:**
- Modify: `types/game.ts`
- Modify: `store/slices/gameSlice.ts`
- Modify: `store/slices/__tests__/gameSlice.test.ts`

- [ ] **Step 1: Append CustomQuestion to types/game.ts**

Add at the end of `types/game.ts`:

```typescript
export interface CustomQuestion {
  /** Prefixed with "custom_" to avoid collision with bundled question IDs. */
  id: string;
  text: string;
  type: 'truth' | 'dare';
}
```

- [ ] **Step 2: Write failing tests — add to gameSlice.test.ts**

```typescript
import { gameSlice, addCustomQuestion, clearCustomQuestions, resetGame } from '../gameSlice';
import type { CustomQuestion } from '@/types/game';

describe('customQuestions', () => {
  it('initialises as empty array', () => {
    const state = gameSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.customQuestions).toEqual([]);
  });

  it('addCustomQuestion appends a question', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Do a handstand', type: 'dare' };
    const state = gameSlice.reducer(undefined, addCustomQuestion(q));
    expect(state.customQuestions).toHaveLength(1);
    expect(state.customQuestions[0]).toEqual(q);
  });

  it('clearCustomQuestions empties the array', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Tell a secret', type: 'truth' };
    let state = gameSlice.reducer(undefined, addCustomQuestion(q));
    state = gameSlice.reducer(state, clearCustomQuestions());
    expect(state.customQuestions).toEqual([]);
  });

  it('resetGame also clears customQuestions', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Tell a secret', type: 'truth' };
    let state = gameSlice.reducer(undefined, addCustomQuestion(q));
    state = gameSlice.reducer(state, resetGame());
    expect(state.customQuestions).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npx jest store/slices/__tests__/gameSlice.test.ts --no-coverage
```

Expected: FAIL — `addCustomQuestion is not a function`.

- [ ] **Step 4: Update gameSlice.ts**

Add `CustomQuestion` to the import line:

```typescript
import type { GameConfig, GameSession, Player, QuestionHistory, CustomQuestion } from '@/types/game';
```

Update `GameState` interface — add one field:

```typescript
export interface GameState {
  allQuestions: Question[];
  session: GameSession | null;
  history: QuestionHistory[];
  isActive: boolean;
  customQuestions: CustomQuestion[];
}
```

Update `initialState` — add one field:

```typescript
const initialState: GameState = {
  allQuestions: [],
  session: null,
  history: [],
  isActive: false,
  customQuestions: [],
};
```

Update `resetGame` reducer:

```typescript
resetGame(state) {
  state.session = null;
  state.history = [];
  state.isActive = false;
  state.customQuestions = [];
},
```

Add two new reducers after `resetGame`:

```typescript
addCustomQuestion(state, action: PayloadAction<CustomQuestion>) {
  state.customQuestions.push(action.payload);
},
clearCustomQuestions(state) {
  state.customQuestions = [];
},
```

Update exports at the bottom:

```typescript
export const {
  loadQuestions,
  startGame,
  nextQuestion,
  completeQuestion,
  skipQuestion,
  undoLastTurn,
  endGame,
  resetGame,
  addCustomQuestion,
  clearCustomQuestions,
} = gameSlice.actions;
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx jest store/slices/__tests__/gameSlice.test.ts --no-coverage
```

Expected: PASS.

- [ ] **Step 6: Run full test suite**

```bash
npm test -- --no-coverage
```

Expected: All existing tests still pass.

- [ ] **Step 7: Commit**

```bash
git add types/game.ts store/slices/gameSlice.ts store/slices/__tests__/gameSlice.test.ts
git commit -m "feat: add CustomQuestion type and customQuestions to gameSlice"
```

---

## Task 6: Create components/ui/GradientScreen.tsx

**Files:**
- Create: `components/ui/GradientScreen.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/ui/GradientScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { gradients, darkGradients, type GradientKey } from '@/constants/theme';

interface GradientScreenProps {
  gradient: GradientKey;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientScreen({ gradient, children, style }: GradientScreenProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const gradientColors = scheme === 'dark' ? darkGradients[gradient] : gradients[gradient];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add components/ui/GradientScreen.tsx
git commit -m "feat: GradientScreen — per-screen gradient wrapper with safe area"
```

---

## Task 7: Create components/ui/FrostedCard.tsx

**Files:**
- Create: `components/ui/FrostedCard.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/ui/FrostedCard.tsx
import { BlurView } from 'expo-blur';
import { useColorScheme, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

interface FrostedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function FrostedCard({ children, style, intensity = 20 }: FrostedCardProps) {
  const scheme = useColorScheme();

  return (
    <BlurView
      intensity={intensity}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={[styles.card, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/FrostedCard.tsx
git commit -m "feat: FrostedCard — frosted glass surface via expo-blur"
```

---

## Task 8: Create components/ui/GradientButton.tsx

**Files:**
- Create: `components/ui/GradientButton.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/ui/GradientButton.tsx
import { Pressable, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { fonts, spacing, radius, animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, disabled && styles.disabled, style]}
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale, animation.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.4,
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/GradientButton.tsx
git commit -m "feat: GradientButton — frosted CTA with spring press animation"
```

---

## Task 9: Create components/ui/TextButton.tsx

**Files:**
- Create: `components/ui/TextButton.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/ui/TextButton.tsx
import { Pressable, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { fonts, animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TextButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function TextButton({ label, onPress, accessibilityLabel, style }: TextButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale, animation.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/TextButton.tsx
git commit -m "feat: TextButton — underlined secondary action with spring press"
```

---

## Task 10: Create components/ui/ProgressDots.tsx

**Files:**
- Create: `components/ui/ProgressDots.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/ui/ProgressDots.tsx
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { spacing, animation } from '@/constants/theme';

interface DotProps {
  active: boolean;
}

function Dot({ active }: DotProps) {
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, animation.spring);
    opacity.value = withSpring(active ? 1 : 0.4, animation.spring);
  }, [active, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

interface ProgressDotsProps {
  /** Total number of steps. */
  total: number;
  /** Zero-indexed current step. */
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ProgressDots.tsx
git commit -m "feat: ProgressDots — animated wizard step indicator"
```

---

## Task 11: Create components/ui/PlayerChip.tsx

**Files:**
- Create: `components/ui/PlayerChip.tsx`

**Note:** `PlayerChip` uses `MotiView` for entrance/exit animations. The parent list must wrap chips in `<AnimatePresence>` from `moti` for exit animations to fire — this is done in the Players setup screen (Plan 2).

- [ ] **Step 1: Create the file**

```typescript
// components/ui/PlayerChip.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { fonts, spacing, radius } from '@/constants/theme';

interface PlayerChipProps {
  name: string;
  onRemove: () => void;
  /** Used to stagger entrance animation — pass the chip's list index. */
  index: number;
}

export function PlayerChip({ name, onRemove, index }: PlayerChipProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 180,
        delay: index * 40,
      }}
      style={styles.chip}
    >
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Pressable
        onPress={onRemove}
        style={styles.removeButton}
        accessibilityLabel={`Remove ${name}`}
        accessibilityRole="button"
        hitSlop={8}
      >
        <Text style={styles.removeIcon}>×</Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    maxWidth: 200,
  },
  name: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  removeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 20,
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/PlayerChip.tsx
git commit -m "feat: PlayerChip — animated name pill with × remove button"
```

---

## Task 12: Rewrite components/ui/ConfirmSheet.tsx

**Files:**
- Modify: `components/ui/ConfirmSheet.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
// components/ui/ConfirmSheet.tsx
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts, spacing, radius } from '@/constants/theme';
import { GradientButton } from './GradientButton';
import { TextButton } from './TextButton';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* Inner Pressable prevents tap-through closing the sheet accidentally */}
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <GradientButton
              label={confirmLabel}
              onPress={onConfirm}
              accessibilityLabel={confirmLabel}
            />
            <TextButton
              label={cancelLabel}
              onPress={onCancel}
              accessibilityLabel={cancelLabel}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ConfirmSheet.tsx
git commit -m "feat: rewrite ConfirmSheet with new design system components"
```

---

## Task 13: Rebuild native binary

`expo-linear-gradient`, `expo-blur`, and `lottie-react-native` all contain native code — the dev client must be rebuilt after installing them.

- [ ] **Step 1: Rebuild iOS dev client**

```bash
npx expo run:ios
```

Expected: Build succeeds, simulator opens. The app will still show old UI (screens are rewritten in Plan 2) but must not crash on launch.

**No Mac / Xcode? Use EAS:**
```bash
eas build --platform ios --profile development
```

- [ ] **Step 2: Verify fonts load correctly**

In the simulator, confirm the app launches without a red error screen. Font rendering will be validated visually in Plan 2 when screens are rebuilt.

- [ ] **Step 3: Run full test suite**

```bash
npm test -- --no-coverage
```

Expected: All tests pass.

---

## Plan 1 Complete

Proceed to **Plan 2: Screens** (`docs/superpowers/plans/2026-04-18-revamp-02-screens.md`) once all tests pass and the app builds without crashing.
