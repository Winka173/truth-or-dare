import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { PlayerSetup } from '@/components/game/PlayerSetup';
import { AgeGroupPicker } from '@/components/game/AgeGroupPicker';
import { MoodChip } from '@/components/game/MoodChip';
import { useGame } from '@/hooks/useGame';
import { useQuestions } from '@/hooks/useQuestions';
import { useSettings } from '@/hooks/useSettings';
import { storageApi } from '@/utils/storage';
import { GAME_CONFIG } from '@/constants/config';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type {
  GameConfig,
  Player,
  QuestionsPerRound,
  TimerDuration,
  TypeFilter,
} from '@/types/game';
import type { AgeGroup, Mood } from '@/types/question';

const MOODS: { id: Mood; label: string; icon: string }[] = [
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'intimate', label: 'Intimate', icon: '💫' },
  { id: 'chill', label: 'Chill', icon: '🌿' },
  { id: 'icebreaker', label: 'Icebreaker', icon: '👋' },
];

const TIMER_OPTIONS: TimerDuration[] = [0, 30, 60, 90];
const ROUND_OPTIONS: QuestionsPerRound[] = [5, 10, 15, 20, 'unlimited'];
const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: 'both', label: 'Mixed' },
  { id: 'truth', label: 'Truth' },
  { id: 'dare', label: 'Dare' },
];

export default function GameSetupScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { settings } = useSettings();
  const { start } = useGame();

  const savedPlayers = storageApi.loadLastPlayers();
  const savedConfig = storageApi.loadLastConfig();

  const [players, setPlayers] = useState<string[]>(
    savedPlayers.length > 0 ? savedPlayers : ['Player 1'],
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(
    savedConfig?.ageGroup ?? settings.defaultAgeGroup,
  );
  const [mood, setMood] = useState<Mood>(savedConfig?.mood ?? settings.defaultMood);
  const categoryIds: string[] | 'all' = params.categoryId ? [params.categoryId] : 'all';
  const [timer, setTimer] = useState<TimerDuration>(
    savedConfig?.timer ?? GAME_CONFIG.DEFAULT_TIMER,
  );
  const [questionsPerRound, setQuestionsPerRound] = useState<QuestionsPerRound>(
    savedConfig?.questionsPerRound ?? GAME_CONFIG.DEFAULT_QUESTIONS_PER_ROUND,
  );
  const [allowSkips, setAllowSkips] = useState(savedConfig?.allowSkips ?? true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(savedConfig?.typeFilter ?? 'both');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const draftConfig: GameConfig = {
    ageGroup,
    mood,
    categoryIds,
    timer,
    questionsPerRound,
    allowSkips,
    typeFilter,
  };
  const pool = useQuestions(draftConfig);
  const poolSize = pool.length;
  const canStart = players.length >= 1 && poolSize > 0;

  const handleStart = () => {
    if (!canStart) return;
    const config = draftConfig;
    const playerObjects: Player[] = players.map((name, i) => ({
      id: `p_${Date.now()}_${i}`,
      name,
      score: 0,
      truthsCompleted: 0,
      daresCompleted: 0,
      skips: 0,
      streak: 0,
    }));
    start(config, playerObjects);
    router.replace('/play');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="New Game"
        left={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.iconButton}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0)} style={styles.section}>
          <Text style={styles.sectionLabel}>Players</Text>
          <PlayerSetup players={players} onChange={setPlayers} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(animation.entry.setupRowStagger)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Age Group</Text>
          <AgeGroupPicker value={ageGroup} onChange={setAgeGroup} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(2 * animation.entry.setupRowStagger)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Mood</Text>
          <View style={styles.chipRow}>
            {MOODS.map((m, i) => (
              <MoodChip
                key={m.id}
                mood={m.id}
                label={m.label}
                icon={m.icon}
                selected={mood === m.id}
                index={i}
                onPress={setMood}
              />
            ))}
          </View>
        </Animated.View>

        <Pressable
          onPress={() => setShowAdvanced((v) => !v)}
          style={styles.advancedToggle}
          accessibilityRole="button"
          accessibilityLabel={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          accessibilityState={{ expanded: showAdvanced }}
        >
          <Text style={styles.advancedToggleText}>Advanced options</Text>
          {showAdvanced ? (
            <ChevronUp size={18} color={colors.text.secondary} />
          ) : (
            <ChevronDown size={18} color={colors.text.secondary} />
          )}
        </Pressable>

        {showAdvanced ? (
          <Animated.View entering={FadeInDown} style={styles.section}>
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Timer</Text>
              <View style={styles.chipRow}>
                {TIMER_OPTIONS.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTimer(t)}
                    style={[styles.optionChip, timer === t && styles.optionChipSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: timer === t }}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        timer === t && styles.optionChipTextSelected,
                      ]}
                    >
                      {t === 0 ? 'Off' : `${t}s`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Questions per round</Text>
              <View style={styles.chipRow}>
                {ROUND_OPTIONS.map((r) => (
                  <Pressable
                    key={String(r)}
                    onPress={() => setQuestionsPerRound(r)}
                    style={[
                      styles.optionChip,
                      questionsPerRound === r && styles.optionChipSelected,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        questionsPerRound === r && styles.optionChipTextSelected,
                      ]}
                    >
                      {r === 'unlimited' ? '∞' : r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Type filter</Text>
              <View style={styles.chipRow}>
                {TYPE_FILTERS.map((tf) => (
                  <Pressable
                    key={tf.id}
                    onPress={() => setTypeFilter(tf.id)}
                    style={[
                      styles.optionChip,
                      typeFilter === tf.id && styles.optionChipSelected,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        typeFilter === tf.id && styles.optionChipTextSelected,
                      ]}
                    >
                      {tf.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => setAllowSkips((v) => !v)}
              style={styles.toggleRow}
              accessibilityRole="switch"
              accessibilityState={{ checked: allowSkips }}
              accessibilityLabel="Allow skips"
            >
              <Text style={styles.optionLabel}>Allow skips</Text>
              <View style={[styles.switch, allowSkips && styles.switchOn]}>
                <View style={[styles.switchKnob, allowSkips && styles.switchKnobOn]} />
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={styles.startButton}>
          {poolSize === 0 ? (
            <Text style={styles.emptyPoolWarning}>
              No questions match these settings. Try a different age group or mood, or unlock a pack.
            </Text>
          ) : (
            <Text style={styles.poolCount}>{poolSize} questions available</Text>
          )}
          <Button
            label="Start Game"
            variant="primary"
            fullWidth
            disabled={!canStart}
            onPress={handleStart}
            accessibilityLabel={
              canStart ? 'Start game' : 'Cannot start: no matching questions'
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  advancedToggleText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  optionGroup: { gap: spacing.sm },
  optionLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.containerHighest,
    minHeight: 44,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChipSelected: {
    backgroundColor: colors.primary.container,
  },
  optionChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  optionChipTextSelected: {
    color: colors.primary.onPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bg.containerHighest,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: colors.primary.default,
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.muted,
  },
  switchKnobOn: {
    backgroundColor: colors.primary.onPrimary,
    alignSelf: 'flex-end',
  },
  startButton: { marginTop: spacing.lg, gap: spacing.sm },
  emptyPoolWarning: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.semantic.warning,
    textAlign: 'center',
  },
  poolCount: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
