import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, RotateCcw, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlayerBadge } from '@/components/game/PlayerBadge';
import { TimerRing } from '@/components/game/TimerRing';
import { StreakBadge } from '@/components/game/StreakBadge';
import { QuestionCard } from '@/components/game/QuestionCard';
import { useGame } from '@/hooks/useGame';
import { useSettings } from '@/hooks/useSettings';
import { useAppSelector } from '@/store/hooks';
import { applyChainPrompt, getTranslatedText } from '@/utils/questionFilter';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';

export default function PlayScreen() {
  const { session, currentQuestion, currentPlayer, complete, skip, next, end } = useGame();
  const { settings } = useSettings();
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const [flipped, setFlipped] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // Chain prompt from the previous player, shown to current player before flip
  const [pendingChain, setPendingChain] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionId = currentQuestion?.id;
  const configTimer = session?.config.timer ?? 0;
  // Hot seat questions override the session timer with their own duration
  const effectiveTimer =
    currentQuestion?.hot_seat && currentQuestion.duration_seconds
      ? currentQuestion.duration_seconds
      : configTimer;

  // Resolve the bonus related question text (PRD §5.7) — first related_questions ID
  const bonusRelatedText = useMemo(() => {
    if (!currentQuestion || currentQuestion.related_questions.length === 0) return null;
    const relatedId = currentQuestion.related_questions[0];
    if (!relatedId) return null;
    const related = allQuestions.find((q) => q.id === relatedId);
    if (!related) return null;
    return getTranslatedText(related, settings.language);
  }, [currentQuestion, allQuestions, settings.language]);

  useEffect(() => {
    if (!session) {
      router.replace('/');
    }
  }, [session]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowEndConfirm(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!flipped || effectiveTimer === 0) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(effectiveTimer);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flipped, effectiveTimer, questionId]);

  useEffect(() => {
    if (!settings.hapticEnabled || timeLeft === null) return;
    if (timeLeft === 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
        /* ignore */
      });
    } else if (timeLeft === 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
        /* ignore */
      });
    }
  }, [timeLeft, settings.hapticEnabled]);

  if (!session || !currentPlayer) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState title="No active game" />
      </SafeAreaView>
    );
  }

  const totalQuestions =
    session.config.questionsPerRound === 'unlimited'
      ? session.questionPool.length
      : Math.min(session.config.questionsPerRound, session.questionPool.length);

  if (!currentQuestion || session.currentQuestionIndex >= totalQuestions) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          title="No more questions"
          subtitle="The pool for these settings is exhausted."
          actionLabel="See results"
          onAction={() => {
            end();
            router.replace('/results');
          }}
        />
      </SafeAreaView>
    );
  }

  const isLastQuestion = session.currentQuestionIndex >= totalQuestions - 1;

  const advance = () => {
    // Capture chain prompt for next player BEFORE we advance (PRD §5.3 interpretation 1)
    if (
      currentQuestion.chain &&
      currentQuestion.chain_prompt &&
      !isLastQuestion
    ) {
      setPendingChain(applyChainPrompt(currentQuestion.chain_prompt, currentPlayer.name));
    }
    if (isLastQuestion) {
      end();
      router.replace('/results');
    } else {
      next();
      setFlipped(false);
    }
  };

  const handleComplete = () => {
    complete(currentQuestion.type);
    advance();
  };

  const handleSkip = () => {
    skip();
    advance();
  };

  const handleEnd = () => {
    setShowEndConfirm(false);
    end();
    router.replace('/results');
  };

  const progress = (session.currentQuestionIndex + 1) / totalQuestions;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PlayerBadge
          key={currentPlayer.id}
          name={currentPlayer.name}
          index={session.currentPlayerIndex}
          active
        />
        <Pressable
          onPress={() => setShowEndConfirm(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="End game"
          style={styles.iconButton}
        >
          <X size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {!flipped && pendingChain ? (
        <Animated.View
          key={`chain-${currentQuestion.id}`}
          entering={FadeInDown}
          style={styles.chainBanner}
        >
          <Text style={styles.chainBannerLabel}>Chain</Text>
          <Text style={styles.chainBannerText}>{pendingChain}</Text>
        </Animated.View>
      ) : null}

      {!flipped && currentQuestion.props.length > 0 ? (
        <Animated.View
          key={`props-${currentQuestion.id}`}
          entering={FadeInDown.delay(100)}
          style={styles.propsBadge}
        >
          <Text style={styles.propsBadgeLabel}>Grab</Text>
          <Text style={styles.propsBadgeText}>{currentQuestion.props.join(' · ')}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.cardWrap}>
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          playerName={currentPlayer.name}
          language={settings.language}
          hapticEnabled={settings.hapticEnabled}
          onFlip={() => {
            setFlipped(true);
            setPendingChain(null);
          }}
        />
      </View>

      <View style={styles.bottom}>
        <StreakBadge streak={currentPlayer.streak} />

        {flipped && timeLeft !== null ? (
          <View style={styles.timerWrap}>
            <TimerRing seconds={timeLeft} total={effectiveTimer} size={92} strokeWidth={6} />
          </View>
        ) : null}

        {flipped ? (
          <Animated.View entering={FadeIn.delay(150)} style={styles.actions}>
            {session.config.allowSkips ? (
              <View style={styles.actionHalf}>
                <Button
                  label="Skip"
                  variant="secondary"
                  fullWidth
                  icon={<RotateCcw size={18} color={colors.primary.default} />}
                  onPress={handleSkip}
                  accessibilityLabel="Skip this question"
                />
              </View>
            ) : null}
            <View style={styles.actionHalf}>
              <Button
                label="Done"
                variant="primary"
                fullWidth
                icon={<Check size={18} color={colors.primary.onPrimary} />}
                onPress={handleComplete}
                accessibilityLabel="Mark done"
              />
            </View>
          </Animated.View>
        ) : null}

        {flipped && bonusRelatedText ? (
          <Animated.View entering={FadeIn.delay(300)} style={styles.bonusWrap}>
            <Text style={styles.bonusLabel}>Bonus prompt</Text>
            <Text style={styles.bonusText}>{bonusRelatedText}</Text>
          </Animated.View>
        ) : null}
      </View>

      <ConfirmSheet
        visible={showEndConfirm}
        title="End this game?"
        message="Scores will be saved for the results screen."
        confirmLabel="End Game"
        destructive
        onConfirm={handleEnd}
        onCancel={() => setShowEndConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressWrap: {
    height: 3,
    backgroundColor: colors.bg.containerHighest,
    marginHorizontal: spacing.lg,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.primary.default,
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  timerWrap: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  actionHalf: { flex: 1 },
  chainBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.containerHighest,
    borderRadius: radius.lg,
    gap: 2,
  },
  chainBannerLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.tertiary.default,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chainBannerText: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  propsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.primary.container,
    borderRadius: radius.full,
  },
  propsBadgeLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary.onPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  propsBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.primary.onPrimary,
  },
  bonusWrap: {
    alignSelf: 'stretch',
    padding: spacing.md,
    backgroundColor: colors.bg.containerHighest,
    borderRadius: radius.lg,
    gap: 2,
    marginTop: spacing.sm,
  },
  bonusLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.tertiary.default,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bonusText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text.primary,
    lineHeight: fontSize.sm * 1.4,
  },
});
