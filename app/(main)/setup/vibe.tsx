// app/(main)/setup/vibe.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { TextButton } from '@/components/ui/TextButton';
import { CustomQuestionSheet } from '@/components/ui/CustomQuestionSheet';
import { PackUnlockSheet } from '@/components/packs/PackUnlockSheet';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import { useGame } from '@/hooks/useGame';
import { usePacks } from '@/hooks/usePacks';
import { CATEGORIES } from '@/constants/categories';
import type { Mood, PackId } from '@/types/question';
import { fonts, spacing, radius } from '@/constants/theme';

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'party', label: 'Party', emoji: '🎉' },
  { value: 'intimate', label: 'Intimate', emoji: '💞' },
  { value: 'chill', label: 'Chill', emoji: '😎' },
  { value: 'icebreaker', label: 'Icebreaker', emoji: '🧊' },
];

function CategoryChip({
  cat,
  selected,
  locked,
  onToggle,
  onOpenUnlock,
}: {
  cat: (typeof CATEGORIES)[number];
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
  onOpenUnlock: (packId: Exclude<PackId, 'base'>) => void;
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
      if (cat.packId) onOpenUnlock(cat.packId as Exclude<PackId, 'base'>);
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

export default function VibeRoute() {
  const router = useRouter();
  const { playerNames, ageGroup, mood, categoryIds } = useSetupWizard();
  const { start } = useGame();
  const { unlockedPackIds } = usePacks();
  const [customOpen, setCustomOpen] = useState(false);
  const [packToUnlock, setPackToUnlock] = useState<Exclude<PackId, 'base'> | null>(null);

  function handleStart() {
    if (!ageGroup || !mood) return;
    const players = playerNames.map((name, i) => ({
      id: `p_${i}_${Date.now()}`,
      name,
      score: 0,
      truthsCompleted: 0,
      daresCompleted: 0,
      skips: 0,
      streak: 0,
    }));
    start(
      {
        ageGroup,
        mood,
        categoryIds: categoryIds.length > 0 ? categoryIds : 'all',
        timer: 0,
        questionsPerRound: 10,
        allowSkips: true,
        typeFilter: 'both',
      },
      players,
    );
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
                <CategoryChip
                  cat={cat}
                  selected={selected}
                  locked={!!locked}
                  onToggle={() => wizardActions.toggleCategory(cat.id)}
                  onOpenUnlock={setPackToUnlock}
                />
              </MotiView>
            );
          })}
        </View>

        <TextButton
          label="Add your own question +"
          onPress={() => setCustomOpen(true)}
          accessibilityLabel="Add a custom question"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>

      <View style={styles.bottom}>
        <GradientButton
          label="Start Game 🔥"
          onPress={handleStart}
          disabled={!mood}
          accessibilityLabel="Start the game"
        />
      </View>

      <CustomQuestionSheet visible={customOpen} onClose={() => setCustomOpen(false)} />

      <PackUnlockSheet
        visible={packToUnlock !== null}
        packId={packToUnlock}
        onClose={() => setPackToUnlock(null)}
      />
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
