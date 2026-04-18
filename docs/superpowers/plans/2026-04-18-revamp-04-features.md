# UI Revamp — Plan 4: Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Add five content/behavior features: TTS auto-read with voice picker, Sound Effects, Custom Questions, full Favorites Viewer, and extended i18n keys.

**Architecture:** TTS uses `expo-speech` gated behind `settingsSlice.soundEnabled && ttsEnabled`. Sound effects use `expo-audio` with files bundled in `assets/sounds/`. Custom questions live in `gameSlice.customQuestions` (session-only). Favorites viewer is a dedicated screen that replays starred questions.

**Prerequisite:** Plan 3 complete.

---

## Task 1: Install expo-speech and add TTS translation keys

**Files:** `package.json`, `locales/en.ts`, `locales/index.ts`

- [ ] **Step 1: Install expo-speech**

```bash
npx expo install expo-speech
```

- [ ] **Step 2: Add 4 new translation keys to locales/en.ts**

In the `en` Catalog object, add:

```typescript
'settings.voice': 'Reading Voice',
'settings.voiceDefault': 'System Default',
'play.muteVoice': 'Mute',
'play.unmuteVoice': 'Unmute',
```

- [ ] **Step 3: Add the same keys (translated) to the 10 other locales in locales/index.ts**

Example for `es`:
```typescript
'settings.voice': 'Voz de lectura',
'settings.voiceDefault': 'Predeterminado',
'play.muteVoice': 'Silenciar',
'play.unmuteVoice': 'Activar',
```

Use reasonable translations for all locales. Missing ones fall back to English via `useT`.

- [ ] **Step 4: Typecheck and commit**

```bash
npm run typecheck
git add package.json package-lock.json locales/
git commit -m "feat: install expo-speech, add TTS translation keys in 11 locales"
```

---

## Task 2: Create useSpeech hook

**Files:** Create `hooks/useSpeech.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useSpeech.ts
import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useAppSelector } from '@/store/hooks';
import type { LanguageCode } from '@/types/question';

export function useSpeech() {
  const soundEnabled = useAppSelector((s) => s.settings.soundEnabled);
  const ttsEnabled = useAppSelector((s) => s.settings.ttsEnabled);
  const preferredVoiceId = useAppSelector((s) => s.settings.preferredVoiceId);
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;

  const speak = useCallback(
    (text: string) => {
      if (!soundEnabled || !ttsEnabled) return;
      Speech.stop();
      Speech.speak(text, {
        language,
        voice: preferredVoiceId ?? undefined,
      });
    },
    [soundEnabled, ttsEnabled, language, preferredVoiceId],
  );

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  const listVoices = useCallback(async () => {
    const all = await Speech.getAvailableVoicesAsync();
    return all.filter((v) => v.language?.toLowerCase().startsWith(language.toLowerCase()));
  }, [language]);

  return { speak, stop, listVoices };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useSpeech.ts
git commit -m "feat: useSpeech hook — TTS with language + voice preference"
```

---

## Task 3: Wire TTS into Play screen

**Files:** Modify `app/(main)/play.tsx`

- [ ] **Step 1: Add auto-speak on question change + speaker mute toggle**

Add imports:

```typescript
import { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useSpeech } from '@/hooks/useSpeech';
import { useAppDispatch } from '@/store/hooks';
import { setTtsEnabled } from '@/store/slices/settingsSlice';
```

In the component body add:

```typescript
const { speak, stop } = useSpeech();
const dispatch = useAppDispatch();
const ttsEnabled = useAppSelector((s) => s.settings.ttsEnabled);

useEffect(() => {
  if (!currentQuestion) return;
  const t = setTimeout(() => speak(text), 400);
  return () => {
    clearTimeout(t);
    stop();
  };
}, [currentQuestion, text, speak, stop]);
```

Replace the single `Pressable` (star button) inside the `cardHeader` with a grouped view containing speaker + star:

```typescript
<View style={{ flexDirection: 'row', gap: 12 }}>
  <Pressable
    onPress={() => {
      stop();
      dispatch(setTtsEnabled(!ttsEnabled));
    }}
    hitSlop={12}
    accessibilityLabel={ttsEnabled ? t('play.muteVoice') : t('play.unmuteVoice')}
  >
    {ttsEnabled ? (
      <Volume2 size={22} color="rgba(255,255,255,0.80)" />
    ) : (
      <VolumeX size={22} color="rgba(255,255,255,0.40)" />
    )}
  </Pressable>
  <Pressable onPress={() => toggleFavorite(currentQuestion.id)} hitSlop={16} accessibilityLabel={starred ? 'Remove from favorites' : 'Add to favorites'}>
    <Star size={22} color={starred ? colors.gold : 'rgba(255,255,255,0.60)'} fill={starred ? colors.gold : 'transparent'} />
  </Pressable>
</View>
```

- [ ] **Step 2: Reset ttsEnabled when game resets**

In `hooks/useGame.ts`, add:

```typescript
import { setTtsEnabled } from '@/store/slices/settingsSlice';
```

Inside the `reset` function, after `dispatch(resetGame())`:

```typescript
dispatch(setTtsEnabled(true));
```

- [ ] **Step 3: Commit**

```bash
git add "app/(main)/play.tsx" hooks/useGame.ts
git commit -m "feat: TTS auto-reads questions with speaker mute toggle"
```

---

## Task 4: Voice picker in Settings

**Files:** Create `components/ui/VoicePickerSheet.tsx`, modify `app/(main)/settings.tsx`

- [ ] **Step 1: Create VoicePickerSheet.tsx**

```typescript
// components/ui/VoicePickerSheet.tsx
import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useSpeech } from '@/hooks/useSpeech';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPreferredVoiceId } from '@/store/slices/settingsSlice';
import { fonts, spacing, radius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function VoicePickerSheet({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const preferredVoiceId = useAppSelector((s) => s.settings.preferredVoiceId);
  const { listVoices } = useSpeech();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    if (visible) listVoices().then(setVoices);
  }, [visible, listVoices]);

  function pick(id: string | null) {
    dispatch(setPreferredVoiceId(id));
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Reading Voice</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Pressable style={styles.row} onPress={() => pick(null)}>
              <Text style={[styles.label, !preferredVoiceId && styles.selected]}>System Default</Text>
            </Pressable>
            {voices.map((v) => (
              <Pressable key={v.identifier} style={styles.row} onPress={() => pick(v.identifier)}>
                <Text style={[styles.label, preferredVoiceId === v.identifier && styles.selected]}>
                  {v.name || v.identifier}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.sm },
  row: { paddingVertical: spacing.md },
  label: { fontFamily: fonts.body, fontSize: 16, color: 'rgba(255,255,255,0.80)' },
  selected: { color: '#FBBF24', fontFamily: fonts.bodyBold },
});
```

- [ ] **Step 2: Wire voice row into Settings**

In `app/(main)/settings.tsx`, add imports:

```typescript
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { VoicePickerSheet } from '@/components/ui/VoicePickerSheet';
import { useT } from '@/hooks/useT';
import { useAppSelector } from '@/store/hooks';
import type { LanguageCode } from '@/types/question';
```

Inside component:

```typescript
const t = useT();
const language = useAppSelector((s) => s.settings.language) as LanguageCode;
const [voiceCount, setVoiceCount] = useState(0);
const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);

useEffect(() => {
  Speech.getAvailableVoicesAsync().then((vs) => {
    setVoiceCount(vs.filter((v) => v.language?.toLowerCase().startsWith(language)).length);
  });
}, [language]);
```

Before `<View style={styles.spacer} />`, add:

```typescript
{voiceCount > 1 ? (
  <Pressable onPress={() => setVoiceSheetOpen(true)} style={styles.linkRow} accessibilityRole="button">
    <Text style={styles.rowLabel}>{t('settings.voice')} →</Text>
  </Pressable>
) : null}
```

Before the closing `</GradientScreen>`:

```typescript
<VoicePickerSheet visible={voiceSheetOpen} onClose={() => setVoiceSheetOpen(false)} />
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/VoicePickerSheet.tsx "app/(main)/settings.tsx"
git commit -m "feat: voice picker in settings — shown only if multiple voices exist"
```

---

## Task 5: Bundle sound effect files

**Files:** Create `assets/sounds/whoosh.mp3`, `cheer.mp3`, `drumroll.mp3`

- [ ] **Step 1: Source from freesound.org or mixkit.co**

Download 3 short mp3 clips (< 50KB each, mono, 44.1kHz):
- `whoosh.mp3` — 300-500ms card-appear sound
- `cheer.mp3` — 1-2s crowd cheer
- `drumroll.mp3` — 1-2s drumroll

Save into `assets/sounds/`.

- [ ] **Step 2: Commit**

```bash
git add assets/sounds/
git commit -m "chore: bundle sound effect mp3 files"
```

---

## Task 6: Create useSoundEffects hook

**Files:** Create `hooks/useSoundEffects.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useSoundEffects.ts
import { useEffect, useRef, useCallback } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useAppSelector } from '@/store/hooks';

const whooshSrc = require('@/assets/sounds/whoosh.mp3');
const cheerSrc = require('@/assets/sounds/cheer.mp3');
const drumrollSrc = require('@/assets/sounds/drumroll.mp3');

export function useSoundEffects() {
  const soundEnabled = useAppSelector((s) => s.settings.soundEnabled);
  const whooshRef = useRef<AudioPlayer | null>(null);
  const cheerRef = useRef<AudioPlayer | null>(null);
  const drumrollRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    whooshRef.current = createAudioPlayer(whooshSrc);
    cheerRef.current = createAudioPlayer(cheerSrc);
    drumrollRef.current = createAudioPlayer(drumrollSrc);
    return () => {
      whooshRef.current?.release();
      cheerRef.current?.release();
      drumrollRef.current?.release();
    };
  }, []);

  const play = useCallback(
    (ref: React.MutableRefObject<AudioPlayer | null>) => {
      if (!soundEnabled || !ref.current) return;
      try {
        ref.current.seekTo(0);
        ref.current.play();
      } catch {
        /* ignore playback errors */
      }
    },
    [soundEnabled],
  );

  return {
    playWhoosh: () => play(whooshRef),
    playCheer: () => play(cheerRef),
    playDrumroll: () => play(drumrollRef),
    stopDrumroll: () => drumrollRef.current?.pause(),
  };
}
```

- [ ] **Step 2: Wire whoosh + cheer into Play**

In `app/(main)/play.tsx`:

```typescript
import { useSoundEffects } from '@/hooks/useSoundEffects';
```

```typescript
const { playWhoosh, playCheer } = useSoundEffects();

useEffect(() => {
  if (currentQuestion) playWhoosh();
}, [currentQuestion, playWhoosh]);

useEffect(() => {
  if (currentPlayer && currentPlayer.streak >= 3 && currentPlayer.streak % 3 === 0) {
    playCheer();
  }
}, [currentPlayer, playCheer]);
```

- [ ] **Step 3: Wire drumroll into Handoff**

In `app/(main)/handoff.tsx`:

```typescript
import { useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
```

```typescript
const { playDrumroll, stopDrumroll } = useSoundEffects();

useEffect(() => {
  playDrumroll();
  return () => stopDrumroll();
}, [playDrumroll, stopDrumroll]);
```

- [ ] **Step 4: Commit**

```bash
git add hooks/useSoundEffects.ts "app/(main)/play.tsx" "app/(main)/handoff.tsx"
git commit -m "feat: sound effects — whoosh on card, cheer on streak, drumroll on handoff"
```

---

## Task 7: Custom Questions sheet

**Files:** Create `components/ui/CustomQuestionSheet.tsx`, modify `app/(main)/setup/vibe.tsx`, `hooks/useGame.ts`

- [ ] **Step 1: Create the sheet**

```typescript
// components/ui/CustomQuestionSheet.tsx
import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { addCustomQuestion } from '@/store/slices/gameSlice';
import { GradientButton } from './GradientButton';
import { TextButton } from './TextButton';
import { fonts, spacing, radius, colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CustomQuestionSheet({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [type, setType] = useState<'truth' | 'dare'>('truth');

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(
      addCustomQuestion({
        id: `custom_${Date.now()}`,
        text: trimmed,
        type,
      }),
    );
    setText('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Add your own</Text>
          <View style={styles.typeRow}>
            <Pressable
              onPress={() => setType('truth')}
              style={[styles.typeBtn, type === 'truth' && { backgroundColor: colors.truth }]}
              accessibilityLabel="Truth"
            >
              <Text style={styles.typeLabel}>TRUTH</Text>
            </Pressable>
            <Pressable
              onPress={() => setType('dare')}
              style={[styles.typeBtn, type === 'dare' && { backgroundColor: colors.dare }]}
              accessibilityLabel="Dare"
            >
              <Text style={styles.typeLabel}>DARE</Text>
            </Pressable>
          </View>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={type === 'truth' ? 'What would you like to ask?' : 'What dare do you have?'}
            placeholderTextColor="rgba(255,255,255,0.40)"
            style={styles.input}
            multiline
            maxLength={200}
          />
          <GradientButton label="Add" onPress={handleAdd} accessibilityLabel="Add custom question" />
          <TextButton label="Cancel" onPress={onClose} accessibilityLabel="Cancel" />
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
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF', textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#FFFFFF', letterSpacing: 1 },
  input: {
    minHeight: 80,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
});
```

- [ ] **Step 2: Add "Add your own" link to Vibe screen**

In `app/(main)/setup/vibe.tsx`, add:

```typescript
import { useState } from 'react';
import { CustomQuestionSheet } from '@/components/ui/CustomQuestionSheet';
import { TextButton } from '@/components/ui/TextButton';
```

```typescript
const [customOpen, setCustomOpen] = useState(false);
```

Below the catGrid inside the ScrollView:

```typescript
<TextButton
  label="Add your own question +"
  onPress={() => setCustomOpen(true)}
  accessibilityLabel="Add a custom question"
  style={{ marginTop: spacing.lg }}
/>
```

Before the closing `</GradientScreen>`:

```typescript
<CustomQuestionSheet visible={customOpen} onClose={() => setCustomOpen(false)} />
```

- [ ] **Step 3: Inject custom questions into session pool**

In `hooks/useGame.ts`, modify `start` to merge custom questions.

Select the custom questions at the top of the hook:

```typescript
const customQuestions = useAppSelector((s) => s.game.customQuestions);
```

Inside `start` — after building the filtered base pool but before dispatching `startGame`:

```typescript
// Convert CustomQuestion → Question shape. Fill required fields from types/question.ts.
const customQs: Question[] = customQuestions.map((cq) => ({
  id: cq.id,
  type: cq.type,
  text: cq.text,
  category_id: 'custom',
  age_group: config.ageGroup,
  mood: config.mood,
  tags: [],
  intensity: 3,
  translations: {},
} as unknown as Question));

const mergedPool = [...basePool, ...customQs];
// shuffle mergedPool via existing utils
```

Dispatch `startGame` with `questionPool: mergedPool`.

**Note:** Check the actual `Question` type in `types/question.ts` before writing this — fill all required fields with sensible defaults. The `as unknown as Question` cast is a safety net for optional fields.

- [ ] **Step 4: Commit**

```bash
git add components/ui/CustomQuestionSheet.tsx "app/(main)/setup/vibe.tsx" hooks/useGame.ts
git commit -m "feat: custom questions — add-your-own sheet, merged into session pool"
```

---

## Task 8: Full Favorites Viewer

**Files:** Modify `app/(main)/favorites.tsx`, `hooks/useGame.ts`

- [ ] **Step 1: Extend useGame.start to accept optional pool override**

In `hooks/useGame.ts`, change the `start` signature:

```typescript
interface StartArgs {
  players: Player[];
  config: GameConfig;
  poolOverride?: Question[];
}

function start({ players, config, poolOverride }: StartArgs) {
  const pool = poolOverride ?? /* existing build+shuffle */ ;
  dispatch(startGame({ config, players, questionPool: pool }));
}
```

- [ ] **Step 2: Replace favorites.tsx with the full viewer**

```typescript
// app/(main)/favorites.tsx
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import empty from '@/assets/lottie/empty-state.json';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useAppSelector } from '@/store/hooks';
import { useGame } from '@/hooks/useGame';
import { getTranslatedText } from '@/utils/questionFilter';
import type { LanguageCode } from '@/types/question';
import { fonts, spacing, colors } from '@/constants/theme';

export default function FavoritesRoute() {
  const router = useRouter();
  const { ids, toggle } = useFavorites();
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;
  const { start } = useGame();

  const saved = allQuestions.filter((q) => ids.includes(q.id));

  function playFavorites() {
    if (saved.length === 0) return;
    start({
      players: [
        {
          id: 'solo',
          name: 'Solo',
          score: 0,
          truthsCompleted: 0,
          daresCompleted: 0,
          skips: 0,
          streak: 0,
        },
      ],
      config: {
        ageGroup: 'adult',
        mood: 'party',
        timer: 0,
        questionsPerRound: saved.length,
        allowSkips: true,
        typeFilter: 'both',
      },
      poolOverride: saved,
    });
    router.replace('/(main)/handoff');
  }

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Saved Questions</Text>
        <View style={{ width: 26 }} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.emptyBlock}>
          <LottieView source={empty} autoPlay loop style={styles.emptyLottie} />
          <Text style={styles.empty}>
            No saved questions yet. Star questions during gameplay to save them here.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            {saved.map((q) => {
              const text = getTranslatedText(q, language);
              return (
                <FrostedCard key={q.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text
                      style={[
                        styles.typeLabel,
                        { color: q.type === 'truth' ? colors.truth : colors.dare },
                      ]}
                    >
                      {q.type.toUpperCase()}
                    </Text>
                    <Pressable
                      onPress={() => toggle(q.id)}
                      hitSlop={12}
                      accessibilityLabel="Remove from favorites"
                    >
                      <Star size={20} color={colors.gold} fill={colors.gold} />
                    </Pressable>
                  </View>
                  <Text style={styles.qText}>{text}</Text>
                </FrostedCard>
              );
            })}
          </ScrollView>
          <View style={styles.bottom}>
            <GradientButton
              label={`Play Favorites (${saved.length})`}
              onPress={playFavorites}
              accessibilityLabel="Play a session of saved questions"
            />
          </View>
        </>
      )}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF' },
  list: { padding: spacing.lg, gap: spacing.md },
  card: { padding: spacing.md, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeLabel: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 1.5 },
  qText: { fontFamily: fonts.bodySemi, fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  emptyBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyLottie: { width: 200, height: 200 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
```

- [ ] **Step 3: Commit**

```bash
git add "app/(main)/favorites.tsx" hooks/useGame.ts
git commit -m "feat: full favorites viewer — browse, remove, play all as session"
```

---

## Task 9: Typecheck + verify

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

- Play: question auto-speaks, speaker icon toggles mute for rest of session
- Settings: voice picker appears only when device has >1 voice for language
- Handoff: drumroll plays, stops on "I'm Ready" tap
- Play: whoosh on new card, cheer at streak 3/6/9
- Setup Vibe: "Add your own" opens sheet, added question appears in session pool
- Favorites: shows saved questions with type badge + star, Play Favorites starts focused solo session

---

## Plan 4 Complete

Proceed to **Plan 5: Monetization**.
