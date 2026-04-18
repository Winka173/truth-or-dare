# UI Revamp — Plan 3: Animations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Layer rich animations on top of the screens built in Plan 2 — Lottie files for celebrations, ambient floating particles on Home, card shimmer on Play, and several micro-interactions.

**Architecture:** Lottie files bundled under `assets/lottie/` rendered via `lottie-react-native`. Continuous ambient animations use `useSharedValue` + `withRepeat`. All animations respect `useReduceMotion` — if the user has Reduce Motion enabled, heavier animations degrade to static states.

**Prerequisite:** Plan 2 complete. Full screen flow playable.

---

## Task 1: Source and bundle Lottie files

**Files to create (all from LottieFiles, free/MIT):**
`assets/lottie/splash-logo.json`, `onboarding-1.json`, `onboarding-2.json`, `onboarding-3.json`, `confetti.json`, `fire.json`, `drumroll.json`, `empty-state.json`.

- [ ] **Step 1: Download from LottieFiles**

Visit [https://lottiefiles.com](https://lottiefiles.com). Search terms:

| File | Search |
|---|---|
| `splash-logo.json` | "dice reveal" / "logo draw" |
| `onboarding-1.json` | "people group" |
| `onboarding-2.json` | "party celebration" |
| `onboarding-3.json` | "devil smirk" |
| `confetti.json` | "confetti burst" |
| `fire.json` | "fire flame badge" |
| `drumroll.json` | "pulse rings loading" |
| `empty-state.json` | "empty star placeholder" |

Save each into `assets/lottie/`.

- [ ] **Step 2: Commit**

```bash
git add assets/lottie/
git commit -m "chore: bundle Lottie JSON animations"
```

---

## Task 2: Verify or create useReduceMotion hook

**Files:** `hooks/useReduceMotion.ts`

- [ ] **Step 1: Check existence**

```bash
ls hooks/useReduceMotion.ts 2>/dev/null || echo MISSING
```

If `MISSING`, create:

```typescript
// hooks/useReduceMotion.ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);

  return reduce;
}
```

- [ ] **Step 2: Commit if created**

```bash
git add hooks/useReduceMotion.ts
git commit -m "feat: useReduceMotion hook — respects system accessibility"
```

---

## Task 3: Splash — Lottie logo reveal

**Files:** Modify `app/splash.tsx`

- [ ] **Step 1: Replace emoji + title with Lottie + title**

Add imports:

```typescript
import LottieView from 'lottie-react-native';
import splashLogo from '@/assets/lottie/splash-logo.json';
```

Replace the two `MotiText` elements inside the `center` View with:

```typescript
<LottieView source={splashLogo} autoPlay loop={false} style={styles.lottie} resizeMode="contain" />
<MotiText
  from={{ opacity: 0, translateY: 20 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 1200 }}
  style={styles.title}
>
  Truth or Dare
</MotiText>
```

Update styles: remove `emoji`, add `lottie: { width: 220, height: 220 }`.

- [ ] **Step 2: Commit**

```bash
git add app/splash.tsx
git commit -m "feat: splash — animated Lottie logo reveal"
```

---

## Task 4: Onboarding — per-slide Lottie illustrations

**Files:** Modify `app/onboarding.tsx`

- [ ] **Step 1: Swap emojis for Lottie**

Add imports:

```typescript
import LottieView from 'lottie-react-native';
import onb1 from '@/assets/lottie/onboarding-1.json';
import onb2 from '@/assets/lottie/onboarding-2.json';
import onb3 from '@/assets/lottie/onboarding-3.json';
```

Update the `slides` array:

```typescript
const slides = [
  { lottie: onb1, title: 'Pick your players', subtitle: 'Add up to 8 friends' },
  { lottie: onb2, title: 'Choose your vibe', subtitle: 'Party, chill, intimate, or icebreaker' },
  { lottie: onb3, title: 'Dare each other', subtitle: 'Truth or Dare — your rules' },
];
```

Replace `<Text style={styles.emoji}>{slide.emoji}</Text>` inside each slide with:

```typescript
<LottieView source={slide.lottie} autoPlay loop style={styles.lottie} resizeMode="contain" />
```

Update styles: remove `emoji`, add `lottie: { width: 240, height: 240, marginBottom: spacing.lg }`.

- [ ] **Step 2: Commit**

```bash
git add app/onboarding.tsx
git commit -m "feat: onboarding — Lottie illustrations per slide, looping"
```

---

## Task 5: Home — ambient floating emojis

**Files:** Create `components/ui/FloatingEmojis.tsx`, modify `app/(main)/index.tsx`

- [ ] **Step 1: Create FloatingEmojis.tsx**

```typescript
// components/ui/FloatingEmojis.tsx
import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const EMOJIS = ['🎉', '🔥', '😈', '💀', '🎲', '✨', '💞', '🍿'];
const { width, height } = Dimensions.get('window');

function Floater({ emoji, seed }: { emoji: string; seed: number }) {
  const y = useSharedValue(height + 80);
  const xBase = (seed * 97) % width;
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = 8000 + (seed * 743) % 6000;
    y.value = withRepeat(withTiming(-120, { duration, easing: Easing.linear }), -1, false);
    opacity.value = withRepeat(withTiming(0.55, { duration: 1200 }), -1, true);
  }, [seed, y, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: xBase }],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.emoji, style]}>{emoji}</Animated.Text>;
}

export function FloatingEmojis() {
  const reduce = useReduceMotion();
  if (reduce) return null;

  return (
    <>
      {EMOJIS.map((e, i) => (
        <Floater key={`${e}-${i}`} emoji={e} seed={i + 1} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
    fontSize: 32,
    opacity: 0,
  },
});
```

- [ ] **Step 2: Wire into Home**

In `app/(main)/index.tsx`:

```typescript
import { FloatingEmojis } from '@/components/ui/FloatingEmojis';
```

Inside `<GradientScreen gradient="home">` as the FIRST child:

```typescript
<FloatingEmojis />
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/FloatingEmojis.tsx "app/(main)/index.tsx"
git commit -m "feat: home — ambient floating emojis drifting upward"
```

---

## Task 6: GradientButton — optional glow pulse

**Files:** Modify `components/ui/GradientButton.tsx`

- [ ] **Step 1: Replace the file with glow-enabled version**

```typescript
// components/ui/GradientButton.tsx
import { useEffect } from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { fonts, spacing, radius, animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  glow?: boolean;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  glow = false,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (glow) {
      glowOpacity.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
    }
  }, [glow, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow ? glowOpacity.value : 0,
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, disabled && styles.disabled, style]}
      onPressIn={() => { scale.value = withSpring(animation.pressScale, animation.spring); }}
      onPressOut={() => { scale.value = withSpring(1, animation.spring); }}
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
    shadowColor: '#FFFFFF',
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 18, color: '#FFFFFF', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
});
```

- [ ] **Step 2: Enable `glow` on Home "Play Now" and Results "Play Again"**

In `app/(main)/index.tsx`, change the Play Now button to include `glow`:

```typescript
<GradientButton label="Play Now 🎉" onPress={...} accessibilityLabel="..." glow />
```

In `app/(main)/results.tsx`, do the same for "Play Again".

- [ ] **Step 3: Commit**

```bash
git add components/ui/GradientButton.tsx "app/(main)/index.tsx" "app/(main)/results.tsx"
git commit -m "feat: add glow pulse to GradientButton, enable on primary CTAs"
```

---

## Task 7: Age Step — auto-advance progress bar

**Files:** Modify `app/(main)/setup/age.tsx`

- [ ] **Step 1: Add an animated progress bar to selected card**

Inside the `FrostedCard` render, after the warning text, add:

```typescript
{selected ? (
  <MotiView
    from={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ type: 'timing', duration: 400 }}
    style={styles.progressFill}
  />
) : null}
```

Add to styles:

```typescript
progressFill: {
  position: 'absolute',
  left: 0, right: 0, bottom: 0,
  height: 3,
  backgroundColor: '#FFFFFF',
  transformOrigin: 'left',
},
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/setup/age.tsx"
git commit -m "feat: age setup — progress bar sweeps during auto-advance"
```

---

## Task 8: Vibe Step — locked chip shake

**Files:** Modify `app/(main)/setup/vibe.tsx`

- [ ] **Step 1: Extract `CategoryChip` sub-component with shake animation**

Add inside `app/(main)/setup/vibe.tsx`, after imports but before `VibeRoute`:

```typescript
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

function CategoryChip({
  cat, selected, locked, onToggle,
}: {
  cat: (typeof CATEGORIES)[number];
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  function handlePress() {
    if (locked) {
      shake.value = withSequence(
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }
    onToggle();
  }

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={handlePress}
        style={[styles.catChip, selected && styles.catChipSelected, locked && styles.catChipLocked]}
        accessibilityRole="button"
        accessibilityLabel={cat.label}
        accessibilityState={{ selected, disabled: locked }}
      >
        <Text style={styles.catEmoji}>{cat.icon}</Text>
        <Text style={styles.catLabel} numberOfLines={1}>{cat.label}</Text>
        {locked ? <Lock size={14} color="rgba(255,255,255,0.60)" /> : null}
      </Pressable>
    </Animated.View>
  );
}
```

Inside the catGrid render, replace the inline `<Pressable>` with:

```typescript
<CategoryChip
  cat={cat}
  selected={selected}
  locked={!!locked}
  onToggle={() => wizardActions.toggleCategory(cat.id)}
/>
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/setup/vibe.tsx"
git commit -m "feat: vibe setup — shake animation on locked category tap"
```

---

## Task 9: Handoff — drumroll Lottie

**Files:** Modify `app/(main)/handoff.tsx`

- [ ] **Step 1: Replace the 👀 MotiText with a looping Lottie**

Add imports:

```typescript
import LottieView from 'lottie-react-native';
import drumroll from '@/assets/lottie/drumroll.json';
```

Inside the `center` View, REPLACE the first `<MotiText>` (👀) with:

```typescript
<LottieView source={drumroll} autoPlay loop style={styles.lottie} resizeMode="contain" />
```

Remove `emoji` style, add:

```typescript
lottie: { width: 200, height: 200 },
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/handoff.tsx"
git commit -m "feat: handoff — drumroll Lottie behind player name"
```

---

## Task 10: Play — card shimmer overlay

**Files:** Create `components/ui/CardShimmer.tsx`, modify `app/(main)/play.tsx`

- [ ] **Step 1: Create CardShimmer.tsx**

```typescript
// components/ui/CardShimmer.tsx
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function CardShimmer() {
  const translateX = useSharedValue(-400);
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) return;
    translateX.value = withRepeat(
      withDelay(2500, withTiming(400, { duration: 800, easing: Easing.inOut(Easing.ease) })),
      -1,
      false,
    );
  }, [reduce, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (reduce) return null;

  return (
    <AnimatedGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, styles.shimmer, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  shimmer: { width: 200 },
});
```

- [ ] **Step 2: Mount CardShimmer inside Play's FrostedCard**

In `app/(main)/play.tsx`, add import:

```typescript
import { CardShimmer } from '@/components/ui/CardShimmer';
```

Inside `<FrostedCard style={styles.card}>`, as first child:

```typescript
<CardShimmer />
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/CardShimmer.tsx "app/(main)/play.tsx"
git commit -m "feat: play — card shimmer overlay with repeating sheen sweep"
```

---

## Task 11: Results — confetti Lottie

**Files:** Modify `app/(main)/results.tsx`

- [ ] **Step 1: Add full-screen confetti Lottie**

Imports:

```typescript
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native'; // already imported; keep
import confetti from '@/assets/lottie/confetti.json';
```

Inside `<GradientScreen gradient="results">`, as FIRST child:

```typescript
<LottieView
  source={confetti}
  autoPlay
  loop={false}
  style={StyleSheet.absoluteFill}
  pointerEvents="none"
  resizeMode="cover"
/>
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/results.tsx"
git commit -m "feat: results — full-screen confetti Lottie on mount"
```

---

## Task 12: Favorites — empty state Lottie

**Files:** Modify `app/(main)/favorites.tsx`

- [ ] **Step 1: Add Lottie to empty state**

Imports:

```typescript
import LottieView from 'lottie-react-native';
import empty from '@/assets/lottie/empty-state.json';
```

Replace the empty state `<Text>` block with:

```typescript
{ids.length === 0 ? (
  <View style={styles.emptyBlock}>
    <LottieView source={empty} autoPlay loop style={styles.emptyLottie} />
    <Text style={styles.empty}>No saved questions yet. Star questions during gameplay to save them here.</Text>
  </View>
) : (
  <Text style={styles.empty}>{ids.length} saved questions — full viewer in Plan 4.</Text>
)}
```

Add styles:

```typescript
emptyBlock: { alignItems: 'center', marginTop: spacing.xl },
emptyLottie: { width: 200, height: 200 },
```

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/favorites.tsx"
git commit -m "feat: favorites — animated empty state Lottie"
```

---

## Task 13: Play — TRUTH/DARE spring entrance

**Files:** Modify `app/(main)/play.tsx`

- [ ] **Step 1: Wrap the type label in MotiView**

Replace the `<Text ... style={[styles.typeLabel, ...]}>` for TRUTH/DARE with:

```typescript
<MotiView
  from={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: 'spring',
    damping: currentQuestion.type === 'dare' ? 8 : 14,
    stiffness: 180,
    delay: 200,
  }}
>
  <Text
    style={[
      styles.typeLabel,
      { color: currentQuestion.type === 'truth' ? colors.truth : colors.dare },
    ]}
  >
    {currentQuestion.type === 'truth' ? t('play.truth') : t('play.dare')}
  </Text>
</MotiView>
```

DARE uses `damping: 8` (bouncier), TRUTH uses `damping: 14` (gentler).

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/play.tsx"
git commit -m "feat: play — TRUTH settles gently, DARE bounces harder"
```

---

## Task 14: Play — card exit on question change

**Files:** Modify `app/(main)/play.tsx`

- [ ] **Step 1: Wrap card in AnimatePresence**

Add import:

```typescript
import { AnimatePresence } from 'moti';
```

Wrap the card's `MotiView` with:

```typescript
<AnimatePresence exitBeforeEnter>
  <MotiView
    key={currentQuestion.id}
    from={{ opacity: 0, translateY: 60, scale: 0.9 }}
    animate={{ opacity: 1, translateY: 0, scale: 1 }}
    exit={{ opacity: 0, translateY: -80, scale: 0.95 }}
    transition={{ type: 'spring', damping: 14, stiffness: 150 }}
    style={{ width: '100%' }}
  >
    {/* existing FrostedCard */}
  </MotiView>
</AnimatePresence>
```

Keying by `currentQuestion.id` triggers exit animation when question changes.

- [ ] **Step 2: Commit**

```bash
git add "app/(main)/play.tsx"
git commit -m "feat: play — card exits with fade + translate on question change"
```

---

## Task 15: Typecheck + animation verification

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

- [ ] **Step 3: Manual playback**

```bash
npm start
```

Verify per screen:
- Splash: Lottie logo plays, title animates in
- Onboarding: Lotties loop on each slide
- Home: floating emojis drift upward, Play Now glows
- Setup Age: selected card shows progress bar
- Setup Vibe: locked chips shake on tap
- Handoff: drumroll Lottie loops
- Play: card shimmers, TRUTH/DARE springs in, card exits on question change
- Results: confetti bursts, Play Again glows
- Favorites (empty): Lottie plays

- [ ] **Step 4: Reduce Motion check**

Enable Reduce Motion in device Settings, verify:
- Floating emojis disappear
- Card shimmer disappears
- Lottie still plays (intentional — Lottie is content, not animation layer)

---

## Plan 3 Complete

Proceed to **Plan 4: Features**.
