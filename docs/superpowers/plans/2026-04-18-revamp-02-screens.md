# UI Revamp — Plan 2: Screens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild all 10 screens + navigation from scratch using the base components from Plan 1. At the end of this plan, a full game loop (Splash → Home → Setup → Handoff → Play → Results) is playable end-to-end.

**Architecture:** Expo Router file-based routing. Setup wizard is a nested group (`app/(main)/setup/`) with state in a module-level store shared across the 3 wizard screens. All screens use `GradientScreen` + `FrostedCard` from Plan 1. No Lottie animations yet (added in Plan 3) — use plain Moti entrances.

**Prerequisite:** Plan 1 complete (theme, deps, base components all committed).

---

## Task 1: Delete old components and screens

**Files to DELETE:**
`components/game/*` (QuestionCard, TimerRing, PlayerBadge, StreakBadge, MoodChip, AgeGroupPicker, PlayerSetup, CategoryCard, ResultCard, Confetti), `components/ui/Button.tsx`, `components/ui/ScreenHeader.tsx`, `components/ui/FABMenu.tsx`, `components/ui/Skeleton.tsx`, `components/ui/EmptyState.tsx`, `components/ui/Input.tsx`, `components/packs/PackBadge.tsx`.

- [ ] **Step 1: Delete files**

```bash
cd "C:\Users\Winka\OneDrive\Documents\truth-or-dare"
rm components/game/QuestionCard.tsx components/game/TimerRing.tsx components/game/PlayerBadge.tsx components/game/StreakBadge.tsx components/game/MoodChip.tsx components/game/AgeGroupPicker.tsx components/game/PlayerSetup.tsx components/game/CategoryCard.tsx components/game/ResultCard.tsx components/game/Confetti.tsx
rm components/ui/Button.tsx components/ui/ScreenHeader.tsx components/ui/FABMenu.tsx components/ui/Skeleton.tsx components/ui/EmptyState.tsx components/ui/Input.tsx
rm components/packs/PackBadge.tsx
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: delete old UI components — replaced in Plan 2"
```

---

## Task 2: Update app/(main)/_layout.tsx with new routes

**Files:** Modify `app/(main)/_layout.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/(main)/_layout.tsx
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/players" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/age" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/vibe" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="handoff" options={{ animation: 'slide_from_right', animationDuration: 280, gestureEnabled: false }} />
      <Stack.Screen name="play" options={{ animation: 'fade', animationDuration: 220, gestureEnabled: false }} />
      <Stack.Screen name="results" options={{ animation: 'fade', animationDuration: 220, gestureEnabled: false }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom', animationDuration: 340, presentation: 'modal' }} />
      <Stack.Screen name="favorites" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/_layout.tsx"
git commit -m "feat: new route stack with setup wizard, handoff, favorites"
```

---

## Task 3: Splash screen

**Files:** Create `app/splash.tsx`, modify `app/_layout.tsx`

- [ ] **Step 1: Create app/splash.tsx**

```typescript
// app/splash.tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiText } from 'moti';
import { useAppSelector } from '@/store/hooks';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { fonts } from '@/constants/theme';

export default function SplashRoute() {
  const router = useRouter();
  const onboardingComplete = useAppSelector((s) => s.settings.onboardingComplete);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(onboardingComplete ? '/(main)' : '/onboarding');
    }, 2000);
    return () => clearTimeout(t);
  }, [router, onboardingComplete]);

  return (
    <GradientScreen gradient="splash">
      <View style={styles.center}>
        <MotiText
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150 }}
          style={styles.emoji}
        >
          🎲
        </MotiText>
        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 400 }}
          style={styles.title}
        >
          Truth or Dare
        </MotiText>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 96 },
  title: { fontFamily: fonts.heading, fontSize: 42, color: '#FFFFFF', letterSpacing: 0.5 },
});
```

- [ ] **Step 2: Update app/_layout.tsx to route splash as initial screen**

In `app/_layout.tsx`, replace the existing `<Stack screenOptions={{ headerShown: false }} />` line with:

```typescript
<Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
  <Stack.Screen name="splash" options={{ animation: 'fade' }} />
  <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
  <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
</Stack>
```

- [ ] **Step 3: Commit**

```bash
git add app/splash.tsx app/_layout.tsx
git commit -m "feat: splash screen with animated logo entrance"
```

---

## Task 4: Onboarding screen

**Files:** Create `app/onboarding.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/onboarding.tsx
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setOnboardingComplete } from '@/store/slices/settingsSlice';
import { storageApi } from '@/utils/storage';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { fonts, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  { emoji: '👥', title: 'Pick your players', subtitle: 'Add up to 8 friends' },
  { emoji: '🎉', title: 'Choose your vibe', subtitle: 'Party, chill, intimate, or icebreaker' },
  { emoji: '😈', title: 'Dare each other', subtitle: 'Truth or Dare — your rules' },
];

export default function OnboardingRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== current) setCurrent(index);
  }

  function complete() {
    dispatch(setOnboardingComplete(true));
    storageApi.saveSettings({ onboardingComplete: true });
    router.replace('/(main)');
  }

  function advance() {
    if (current < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
    } else {
      complete();
    }
  }

  return (
    <GradientScreen gradient="splash">
      <View style={styles.topBar}>
        <Pressable onPress={complete} hitSlop={16} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {slides.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <ProgressDots total={slides.length} current={current} />
        <View style={styles.buttonWrap}>
          <GradientButton
            label={current === slides.length - 1 ? "Let's Play 🔥" : 'Next'}
            onPress={advance}
            accessibilityLabel={current === slides.length - 1 ? 'Start the game' : 'Next slide'}
          />
        </View>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  skip: { fontFamily: fonts.bodySemi, fontSize: 16, color: 'rgba(255,255,255,0.80)' },
  scroll: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emoji: { fontSize: 120, marginBottom: spacing.lg },
  title: { fontFamily: fonts.heading, fontSize: 34, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 17, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 24 },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  buttonWrap: { paddingHorizontal: spacing.sm },
});
```

**Note:** If `storageApi.saveSettings` does not accept `Partial<SettingsState>`, update it to merge partials with the currently-stored value before this task runs.

- [ ] **Step 2: Commit**

```bash
git add app/onboarding.tsx
git commit -m "feat: onboarding screen with 3 swipeable slides + skip"
```

---

## Task 5: Home screen

**Files:** Modify `app/(main)/index.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/(main)/index.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Settings } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { fonts, spacing } from '@/constants/theme';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push('/(main)/settings')} hitSlop={16} accessibilityRole="button" accessibilityLabel="Open settings">
          <Settings size={26} color="rgba(255,255,255,0.90)" />
        </Pressable>
      </View>

      <View style={styles.center}>
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          style={styles.titleWrap}
        >
          <Text style={styles.title}>Truth</Text>
          <Text style={styles.titleOr}>or</Text>
          <Text style={styles.title}>Dare</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <Text style={styles.tagline}>No wifi. No accounts. Just play.</Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 180, delay: 400 }}
        style={styles.bottom}
      >
        <GradientButton label="Play Now 🎉" onPress={() => router.push('/(main)/setup/players')} accessibilityLabel="Start a new game" />
        <TextButton label="Browse Packs" onPress={() => router.push('/(main)/setup/vibe')} accessibilityLabel="Browse content packs" />
      </MotiView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  titleWrap: { alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 64, color: '#FFFFFF', lineHeight: 70, letterSpacing: -1 },
  titleOr: { fontFamily: fonts.body, fontSize: 24, fontStyle: 'italic', color: 'rgba(255,255,255,0.80)', lineHeight: 32, marginVertical: 4 },
  tagline: { fontFamily: fonts.bodySemi, fontSize: 16, color: 'rgba(255,255,255,0.80)', textAlign: 'center' },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/index.tsx"
git commit -m "feat: redesigned home screen — single Play CTA + Browse Packs link"
```

---

## Task 6: Setup wizard shared state hook

**Files:** Create `hooks/useSetupWizard.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useSetupWizard.ts
import { useSyncExternalStore } from 'react';
import type { AgeGroup, Mood } from '@/types/question';

export interface WizardState {
  playerNames: string[];
  ageGroup: AgeGroup | null;
  mood: Mood | null;
  categoryIds: string[];
}

let state: WizardState = { playerNames: [], ageGroup: null, mood: null, categoryIds: [] };
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}

function notify() {
  listeners.forEach((l) => l());
}

export const wizardActions = {
  addPlayer(name: string) {
    state = { ...state, playerNames: [...state.playerNames, name] };
    notify();
  },
  removePlayer(index: number) {
    state = { ...state, playerNames: state.playerNames.filter((_, i) => i !== index) };
    notify();
  },
  setAgeGroup(ag: AgeGroup) {
    state = { ...state, ageGroup: ag };
    notify();
  },
  setMood(m: Mood) {
    state = { ...state, mood: m };
    notify();
  },
  toggleCategory(id: string) {
    const has = state.categoryIds.includes(id);
    state = { ...state, categoryIds: has ? state.categoryIds.filter((c) => c !== id) : [...state.categoryIds, id] };
    notify();
  },
  reset() {
    state = { playerNames: [], ageGroup: null, mood: null, categoryIds: [] };
    notify();
  },
};

export function useSetupWizard(): WizardState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useSetupWizard.ts
git commit -m "feat: useSetupWizard hook — shared state across 3 setup screens"
```

---

## Task 7: Setup Step 1 — Players

**Files:** Create `app/(main)/setup/players.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/(main)/setup/players.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatePresence } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { PlayerChip } from '@/components/ui/PlayerChip';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import { GAME_CONFIG } from '@/constants/config';
import { fonts, spacing, radius } from '@/constants/theme';

export default function PlayersRoute() {
  const router = useRouter();
  const { playerNames } = useSetupWizard();
  const [input, setInput] = useState('');

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed || playerNames.length >= GAME_CONFIG.MAX_PLAYERS) return;
    wizardActions.addPlayer(trimmed);
    setInput('');
  }

  const canAdd = !!input.trim() && playerNames.length < GAME_CONFIG.MAX_PLAYERS;

  return (
    <GradientScreen gradient="setup">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
            <ArrowLeft size={26} color="#FFFFFF" />
          </Pressable>
          <ProgressDots total={3} current={0} />
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Who's playing?</Text>
          <Text style={styles.subtitle}>Add up to {GAME_CONFIG.MAX_PLAYERS} players</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleAdd}
              placeholder="Player name"
              placeholderTextColor="rgba(255,255,255,0.50)"
              style={styles.input}
              maxLength={20}
              returnKeyType="done"
              accessibilityLabel="Player name input"
            />
            <Pressable
              onPress={handleAdd}
              style={[styles.addButton, !canAdd && styles.addDisabled]}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel="Add player"
            >
              <Text style={styles.addLabel}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.chipsWrap}>
            <AnimatePresence>
              {playerNames.map((name, i) => (
                <PlayerChip
                  key={`${name}-${i}`}
                  name={name}
                  index={i}
                  onRemove={() => wizardActions.removePlayer(i)}
                />
              ))}
            </AnimatePresence>
          </View>
        </View>

        <View style={styles.bottom}>
          <GradientButton
            label="Next →"
            onPress={() => router.push('/(main)/setup/age')}
            disabled={playerNames.length === 0}
            accessibilityLabel="Continue to age group selection"
          />
        </View>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 36, color: '#FFFFFF' },
  subtitle: { fontFamily: fonts.body, fontSize: 16, color: 'rgba(255,255,255,0.70)', marginBottom: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1, height: 52, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.lg, fontFamily: fonts.body, fontSize: 16, color: '#FFFFFF',
  },
  addButton: {
    height: 52, paddingHorizontal: spacing.lg, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.30)', alignItems: 'center', justifyContent: 'center',
  },
  addDisabled: { opacity: 0.4 },
  addLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#FFFFFF' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/setup/players.tsx"
git commit -m "feat: setup step 1 — players screen with input + animated chips"
```

---

## Task 8: Setup Step 2 — Age Group

**Files:** Create `app/(main)/setup/age.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/(main)/setup/age.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import type { AgeGroup } from '@/types/question';
import { fonts, spacing } from '@/constants/theme';

const OPTIONS: { value: AgeGroup; label: string; range: string; description: string; warning?: string }[] = [
  { value: 'kids', label: 'Kids', range: 'Ages 8–12', description: 'Silly, safe, and sweet.' },
  { value: 'teens', label: 'Teens', range: 'Ages 13–17', description: 'School, crushes, and drama.' },
  { value: 'young_adult', label: 'Young Adult', range: 'Ages 18–24', description: 'College, career, and chaos.' },
  { value: 'adult', label: 'Adult', range: 'Ages 25+', description: 'Grown-up truths and dares.' },
  { value: '18plus', label: 'Adults Only 🌶️', range: '18+', description: 'Spicy content only.', warning: 'Requires Adults Only pack' },
];

export default function AgeRoute() {
  const router = useRouter();
  const { ageGroup } = useSetupWizard();

  function pick(value: AgeGroup) {
    wizardActions.setAgeGroup(value);
    setTimeout(() => router.push('/(main)/setup/vibe'), 400);
  }

  return (
    <GradientScreen gradient="setup">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <ProgressDots total={3} current={1} />
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Pick an age group</Text>
        <Text style={styles.subtitle}>Questions will match the selected level.</Text>

        <View style={styles.list}>
          {OPTIONS.map((opt, i) => {
            const selected = ageGroup === opt.value;
            return (
              <MotiView
                key={opt.value}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 150, delay: i * 60 }}
              >
                <Pressable onPress={() => pick(opt.value)} accessibilityRole="button" accessibilityLabel={`${opt.label}, ${opt.range}`} accessibilityState={{ selected }}>
                  <FrostedCard style={[styles.card, selected && styles.cardSelected]}>
                    <View style={styles.cardRow}>
                      <Text style={styles.label}>{opt.label}</Text>
                      <Text style={styles.range}>{opt.range}</Text>
                    </View>
                    <Text style={styles.description}>{opt.description}</Text>
                    {opt.warning ? <Text style={styles.warning}>{opt.warning}</Text> : null}
                  </FrostedCard>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 32, color: '#FFFFFF' },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.70)' },
  list: { gap: spacing.sm, marginTop: spacing.md },
  card: { padding: spacing.md, gap: 4 },
  cardSelected: { borderColor: '#FFFFFF', borderWidth: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  label: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF' },
  range: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.60)' },
  description: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.80)' },
  warning: { fontFamily: fonts.bodySemi, fontSize: 13, color: '#FBBF24', marginTop: 4 },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/setup/age.tsx"
git commit -m "feat: setup step 2 — age group selection with auto-advance"
```

---

## Task 9: Setup Step 3 — Vibe

**Files:** Create `app/(main)/setup/vibe.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/(main)/setup/vibe.tsx
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import { useGame } from '@/hooks/useGame';
import { usePacks } from '@/hooks/usePacks';
import { CATEGORIES } from '@/constants/categories';
import type { Mood } from '@/types/question';
import { fonts, spacing, radius } from '@/constants/theme';

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'party', label: 'Party', emoji: '🎉' },
  { value: 'intimate', label: 'Intimate', emoji: '💞' },
  { value: 'chill', label: 'Chill', emoji: '😎' },
  { value: 'icebreaker', label: 'Icebreaker', emoji: '🧊' },
];

export default function VibeRoute() {
  const router = useRouter();
  const { playerNames, ageGroup, mood, categoryIds } = useSetupWizard();
  const { start } = useGame();
  const { unlockedPackIds } = usePacks();

  function handleStart() {
    if (!ageGroup || !mood) return;
    start({
      players: playerNames.map((name, i) => ({
        id: `p_${i}_${Date.now()}`,
        name,
        score: 0, truthsCompleted: 0, daresCompleted: 0, skips: 0, streak: 0,
      })),
      config: {
        ageGroup, mood,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        timer: 0, questionsPerRound: 10, allowSkips: true, typeFilter: 'both',
      },
    });
    wizardActions.reset();
    router.replace('/(main)/handoff');
  }

  return (
    <GradientScreen gradient="setup">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <ProgressDots total={3} current={2} />
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Pick your vibe</Text>

        <View style={styles.moodRow}>
          {MOODS.map((m, i) => {
            const selected = mood === m.value;
            return (
              <MotiView
                key={m.value}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 150, delay: i * 50 }}
                style={{ flex: 1 }}
              >
                <Pressable
                  onPress={() => wizardActions.setMood(m.value)}
                  style={[styles.moodChip, selected && styles.moodChipSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                  accessibilityState={{ selected }}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Categories (optional)</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat, i) => {
            const selected = categoryIds.includes(cat.id);
            const locked = cat.packId && !unlockedPackIds.includes(cat.packId);
            return (
              <MotiView
                key={cat.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 150, delay: i * 30 }}
              >
                <Pressable
                  onPress={() => !locked && wizardActions.toggleCategory(cat.id)}
                  style={[styles.catChip, selected && styles.catChipSelected, locked && styles.catChipLocked]}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                  accessibilityState={{ selected, disabled: !!locked }}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={styles.catLabel} numberOfLines={1}>{cat.label}</Text>
                  {locked ? <Lock size={14} color="rgba(255,255,255,0.60)" /> : null}
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <GradientButton
          label="Start Game 🔥"
          onPress={handleStart}
          disabled={!mood}
          accessibilityLabel="Start the game"
        />
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.heading, fontSize: 32, color: '#FFFFFF' },
  moodRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  moodChip: {
    alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', gap: 4,
  },
  moodChipSelected: { backgroundColor: 'rgba(255,255,255,0.35)', borderColor: '#FFFFFF' },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#FFFFFF' },
  sectionLabel: { fontFamily: fonts.bodySemi, fontSize: 15, color: 'rgba(255,255,255,0.80)', marginTop: spacing.lg },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  catChipSelected: { backgroundColor: 'rgba(255,255,255,0.40)', borderColor: '#FFFFFF' },
  catChipLocked: { opacity: 0.5 },
  catEmoji: { fontSize: 16 },
  catLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: '#FFFFFF', maxWidth: 120 },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/setup/vibe.tsx"
git commit -m "feat: setup step 3 — mood + category selection with pack gating"
```

---

## Task 10: Handoff screen

**Files:** Create `app/(main)/handoff.tsx`

- [ ] **Step 1: Create the file**

```typescript
// app/(main)/handoff.tsx
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAppSelector } from '@/store/hooks';
import { fonts, spacing } from '@/constants/theme';

export default function HandoffRoute() {
  const router = useRouter();
  const session = useAppSelector((s) => s.game.session);
  const currentPlayer = session?.players[session.currentPlayerIndex];

  if (!session || !currentPlayer) {
    router.replace('/(main)');
    return null;
  }

  return (
    <GradientScreen gradient="handoff">
      <View style={styles.center}>
        <MotiText
          from={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 140 }}
          style={styles.emoji}
        >
          👀
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 150 }}
          style={styles.name}
        >
          {currentPlayer.name}'s Turn
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.subtitle}
        >
          Ready for your challenge?
        </MotiText>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 150, delay: 500 }}
        style={styles.bottom}
      >
        <GradientButton
          label="I'm Ready"
          onPress={() => router.replace('/(main)/play')}
          accessibilityLabel={`Ready, ${currentPlayer.name}'s turn`}
        />
      </MotiView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  emoji: { fontSize: 96 },
  name: { fontFamily: fonts.heading, fontSize: 44, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.bodySemi, fontSize: 18, color: 'rgba(255,255,255,0.80)' },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/handoff.tsx"
git commit -m "feat: handoff screen — player privacy gate with I'm Ready CTA"
```

---

## Task 11: Play screen

**Files:** Modify `app/(main)/play.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/(main)/play.tsx
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { Star } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { useGame } from '@/hooks/useGame';
import { useFavorites } from '@/hooks/useFavorites';
import { useT } from '@/hooks/useT';
import { useAppSelector } from '@/store/hooks';
import { getTranslatedText } from '@/utils/questionFilter';
import { fonts, spacing, colors } from '@/constants/theme';
import type { LanguageCode } from '@/types/question';

export default function PlayRoute() {
  const router = useRouter();
  const t = useT();
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;
  const { session, currentQuestion, currentPlayer, complete, skip, end } = useGame();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const [confirmEndVisible, setConfirmEndVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setConfirmEndVisible(true);
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  if (!session || !currentQuestion || !currentPlayer) {
    router.replace('/(main)');
    return null;
  }

  const text = getTranslatedText(currentQuestion, language);
  const starred = isFavorite(currentQuestion.id);
  const isLast = session.currentQuestionIndex >= session.questionPool.length - 1;

  function handleComplete() {
    complete(currentQuestion!.type);
    if (isLast) {
      end();
      router.replace('/(main)/results');
    } else {
      router.replace('/(main)/handoff');
    }
  }

  function handleSkip() {
    skip();
    if (isLast) {
      end();
      router.replace('/(main)/results');
    } else {
      router.replace('/(main)/handoff');
    }
  }

  function handleEnd() {
    end();
    setConfirmEndVisible(false);
    router.replace('/(main)/results');
  }

  return (
    <GradientScreen gradient="play">
      <View style={styles.topBar}>
        <Text style={styles.player}>{currentPlayer.name}</Text>
        <Text style={styles.counter}>
          {session.currentQuestionIndex + 1} / {session.questionPool.length}
        </Text>
        <Pressable onPress={() => setConfirmEndVisible(true)} hitSlop={16} accessibilityLabel="End game">
          <Text style={styles.end}>End</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <MotiView
          from={{ opacity: 0, translateY: 60, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 150 }}
          style={{ width: '100%' }}
        >
          <FrostedCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.typeLabel,
                  { color: currentQuestion.type === 'truth' ? colors.truth : colors.dare },
                ]}
              >
                {currentQuestion.type === 'truth' ? t('play.truth') : t('play.dare')}
              </Text>
              <Pressable
                onPress={() => toggleFavorite(currentQuestion.id)}
                hitSlop={16}
                accessibilityLabel={starred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={22}
                  color={starred ? colors.gold : 'rgba(255,255,255,0.60)'}
                  fill={starred ? colors.gold : 'transparent'}
                />
              </Pressable>
            </View>
            <Text style={styles.questionText}>{text}</Text>
            {currentQuestion.follow_up_question ? (
              <Text style={styles.followUp}>{currentQuestion.follow_up_question}</Text>
            ) : null}
          </FrostedCard>
        </MotiView>
      </View>

      <View style={styles.bottom}>
        <GradientButton
          label={`${t('common.done')} ✅`}
          onPress={handleComplete}
          accessibilityLabel="Mark question as completed"
        />
        {session.config.allowSkips ? (
          <TextButton
            label={`${t('common.skip')} 😅`}
            onPress={handleSkip}
            accessibilityLabel="Skip this question"
          />
        ) : null}
      </View>

      <ConfirmSheet
        visible={confirmEndVisible}
        title="End this game?"
        message="You'll see results based on the questions played so far."
        confirmLabel="End game"
        cancelLabel="Keep playing"
        onConfirm={handleEnd}
        onCancel={() => setConfirmEndVisible(false)}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  player: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#FFFFFF' },
  counter: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.70)' },
  end: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.error },
  center: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  card: { padding: spacing.xl, gap: spacing.lg, minHeight: 280 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeLabel: { fontFamily: fonts.heading, fontSize: 24, letterSpacing: 2 },
  questionText: { fontFamily: fonts.bodyBold, fontSize: 22, color: '#FFFFFF', lineHeight: 30 },
  followUp: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.70)' },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/play.tsx"
git commit -m "feat: rewrite play screen — no flip, favorite star, end confirm"
```

---

## Task 12: Results screen

**Files:** Modify `app/(main)/results.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/(main)/results.tsx
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { useGame } from '@/hooks/useGame';
import { fonts, spacing, colors } from '@/constants/theme';

function podiumColor(rank: number): string {
  if (rank === 0) return colors.gold;
  if (rank === 1) return colors.silver;
  if (rank === 2) return colors.bronze;
  return 'rgba(255,255,255,0.60)';
}

export default function ResultsRoute() {
  const router = useRouter();
  const { session, reset } = useGame();

  if (!session) {
    router.replace('/(main)');
    return null;
  }

  const ranked = [...session.players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  async function handleShare() {
    const others = ranked.slice(1, 3).map((p) => `${p.name}: ${p.score}pts`).join('  ');
    const message = `🎉 ${winner.name} won Truth or Dare with ${winner.score} points!${others ? `\n${others}` : ''}\nPlayed with Truth or Dare app 🔥`;
    try {
      await Share.share({ message });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <GradientScreen gradient="results">
      <ScrollView contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 8, stiffness: 150 }}
        >
          <Text style={styles.winnerLine}>🏆 Winner 🏆</Text>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerScore}>{winner.score} pts</Text>
        </MotiView>

        <View style={styles.list}>
          {ranked.map((p, i) => (
            <MotiView
              key={p.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 150, delay: 300 + i * 100 }}
            >
              <FrostedCard style={[styles.card, { borderColor: podiumColor(i), borderWidth: i < 3 ? 2 : 1 }]}>
                <View style={styles.cardRow}>
                  <Text style={[styles.rank, { color: podiumColor(i) }]}>#{i + 1}</Text>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{p.name}</Text>
                    <Text style={styles.stats}>
                      {p.truthsCompleted} truths · {p.daresCompleted} dares · {p.skips} skips
                    </Text>
                  </View>
                  <Text style={styles.score}>{p.score}</Text>
                </View>
              </FrostedCard>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={styles.actions}
        >
          <GradientButton label="Play Again" onPress={() => router.replace('/(main)/handoff')} accessibilityLabel="Play again with same setup" />
          <GradientButton label="Share Results 📤" onPress={handleShare} accessibilityLabel="Share results" />
          <TextButton label="New Game" onPress={() => { reset(); router.replace('/(main)'); }} accessibilityLabel="Start a new game" />
        </MotiView>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg, alignItems: 'center' },
  winnerLine: { fontFamily: fonts.bodyBold, fontSize: 18, color: 'rgba(255,255,255,0.80)', textAlign: 'center' },
  winnerName: { fontFamily: fonts.heading, fontSize: 44, color: '#FFFFFF', textAlign: 'center' },
  winnerScore: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.gold, textAlign: 'center' },
  list: { gap: spacing.sm, width: '100%' },
  card: { padding: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rank: { fontFamily: fonts.heading, fontSize: 26, width: 50 },
  playerInfo: { flex: 1 },
  playerName: { fontFamily: fonts.bodyBold, fontSize: 18, color: '#FFFFFF' },
  stats: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 },
  score: { fontFamily: fonts.heading, fontSize: 28, color: '#FFFFFF' },
  actions: { width: '100%', gap: spacing.md, marginTop: spacing.lg },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/results.tsx"
git commit -m "feat: rewrite results — winner card, share button, podium colors"
```

---

## Task 13: Settings modal

**Files:** Modify `app/(main)/settings.tsx`

- [ ] **Step 1: Replace the file (voice picker added in Plan 4)**

```typescript
// app/(main)/settings.tsx
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { TextButton } from '@/components/ui/TextButton';
import { useSettings } from '@/hooks/useSettings';
import { usePacks } from '@/hooks/usePacks';
import { APP_VERSION } from '@/constants/config';
import { fonts, spacing } from '@/constants/theme';

export default function SettingsRoute() {
  const router = useRouter();
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useSettings();
  const { restore } = usePacks();

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Close settings">
          <X size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound Effects</Text>
          <Switch value={soundEnabled} onValueChange={toggleSound} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptic Feedback</Text>
          <Switch value={hapticEnabled} onValueChange={toggleHaptic} />
        </View>

        <Pressable onPress={() => router.push('/(main)/favorites')} style={styles.linkRow} accessibilityRole="button">
          <Text style={styles.rowLabel}>Saved Questions →</Text>
        </Pressable>

        <View style={styles.spacer} />
        <TextButton label="Restore Purchases" onPress={() => restore([])} accessibilityLabel="Restore past purchases" />
        <Text style={styles.version}>v{APP_VERSION}</Text>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 28, color: '#FFFFFF' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  linkRow: { paddingVertical: spacing.md },
  rowLabel: { fontFamily: fonts.bodySemi, fontSize: 17, color: '#FFFFFF' },
  spacer: { height: spacing.xl },
  version: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.50)', textAlign: 'center', marginTop: spacing.lg },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/settings.tsx"
git commit -m "feat: rewrite settings — sound/haptic toggles, favorites link, restore"
```

---

## Task 14: Favorites screen (stub — full viewer in Plan 4)

**Files:** Create `app/(main)/favorites.tsx`

- [ ] **Step 1: Create a placeholder**

```typescript
// app/(main)/favorites.tsx
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { useFavorites } from '@/hooks/useFavorites';
import { fonts, spacing } from '@/constants/theme';

export default function FavoritesRoute() {
  const router = useRouter();
  const { ids } = useFavorites();

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Saved Questions</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.empty}>
          {ids.length === 0
            ? 'No saved questions yet. Star questions during gameplay to save them here.'
            : `${ids.length} saved questions — full viewer in Plan 4.`}
        </Text>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF' },
  content: { padding: spacing.lg },
  empty: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.70)', textAlign: 'center', marginTop: spacing['2xl'] },
});
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/favorites.tsx"
git commit -m "feat: favorites screen stub — full viewer in Plan 4"
```

---

## Task 15: Delete old categories.tsx

- [ ] **Step 1: Delete**

```bash
rm "app/(main)/categories.tsx"
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove standalone categories screen — merged into setup/vibe"
```

---

## Task 16: Verify full flow + typecheck

- [ ] **Step 1: Typecheck**

```bash
npm run typecheck
```

Expected: Zero errors. If any `useFavorites` or `useSettings` hook property is missing (`ids`, `toggleSound`, etc.), fix those hooks inline — they may need small shape updates to match what screens expect.

- [ ] **Step 2: Run tests**

```bash
npm test -- --no-coverage
```

Expected: All tests pass.

- [ ] **Step 3: Launch and play full round**

```bash
npm start
```

Verify flow: Splash → Home → Players → Age → Vibe → Handoff → Play (complete 2-3 questions) → Handoff → Play → Results → Play Again.

- [ ] **Step 4: Commit any fixes**

---

## Plan 2 Complete

Proceed to **Plan 3: Animations** once the full flow is playable end-to-end.
