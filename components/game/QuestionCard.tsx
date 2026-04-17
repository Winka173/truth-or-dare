import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CATEGORY_BY_ID } from '@/constants/categories';
import { animation, colors, fonts, fontSize, radius, shadow, spacing } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { getTranslatedText } from '@/utils/questionFilter';
import type { LanguageCode, Question } from '@/types/question';

export interface QuestionCardProps {
  question: Question;
  playerName: string;
  language?: LanguageCode;
  hapticEnabled?: boolean;
  onFlip?: () => void;
}

export function QuestionCard({
  question,
  playerName,
  language = 'en',
  hapticEnabled = true,
  onFlip,
}: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const cat = CATEGORY_BY_ID[question.category_id];
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    setIsFlipped(false);
    rotation.value = reduceMotion ? 0 : withSpring(0, animation.cardFlip);
  }, [question.id, rotation, reduceMotion]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value}deg` }],
    opacity: rotation.value < 90 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value - 180}deg` }],
    opacity: rotation.value >= 90 ? 1 : 0,
  }));

  const handlePress = () => {
    if (isFlipped) return;
    rotation.value = reduceMotion ? 180 : withSpring(180, animation.cardFlip);
    setIsFlipped(true);
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
        /* ignore */
      });
    }
    onFlip?.();
  };

  const isTruth = question.type === 'truth';
  const text = getTranslatedText(question, language);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={
        isFlipped ? `Question for ${playerName}: ${text}` : 'Tap card to reveal question'
      }
    >
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        {question.escalation_level != null ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Level {question.escalation_level}/5</Text>
          </View>
        ) : null}
        <Text style={[styles.typeLabel, isTruth ? styles.typeTruth : styles.typeDare]}>
          {isTruth ? 'TRUTH' : 'DARE'}
        </Text>
        {cat ? (
          <View style={[styles.categoryChip, { backgroundColor: cat.color }]}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </View>
        ) : null}
        <View style={styles.intensity}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < question.intensity ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
        <Text style={styles.tapHint}>Tap to reveal</Text>
      </Animated.View>

      <Animated.View style={[styles.card, styles.back, backStyle]}>
        <Text style={styles.questionText}>{text}</Text>
        {question.follow_up_question ? (
          <Text style={styles.followUp}>{question.follow_up_question}</Text>
        ) : null}
        {question.hot_seat ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.hotSeatBanner}>
            <Text style={styles.hotSeatText}>
              Hot seat — everyone fires questions at {playerName} for{' '}
              {question.duration_seconds ?? 60}s
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const CARD_HEIGHT = 520;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: CARD_HEIGHT,
    justifyContent: 'center',
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    backfaceVisibility: 'hidden',
    ...shadow.elevated,
  },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  back: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.bg.containerHighest,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  typeLabel: {
    fontFamily: fonts.heading,
    fontSize: fontSize['3xl'],
    letterSpacing: 2,
  },
  typeTruth: { color: colors.tertiary.default },
  typeDare: { color: colors.primary.default },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  categoryIcon: { fontSize: fontSize.base },
  categoryLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: '#000',
  },
  intensity: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: colors.primary.default },
  dotInactive: { backgroundColor: colors.bg.containerHighest },
  tapHint: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  questionText: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: fontSize['2xl'] * 1.3,
  },
  followUp: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  hotSeatBanner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary.container,
    borderRadius: radius.lg,
  },
  hotSeatText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.sm,
    color: colors.primary.onPrimary,
    textAlign: 'center',
  },
});
