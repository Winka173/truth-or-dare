import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
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
import { colors, radius, spacing } from '@/constants/theme';

export default function PlayScreen() {
  const { session, currentQuestion, currentPlayer, complete, skip, next, end } = useGame();
  const { settings } = useSettings();
  const [flipped, setFlipped] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionId = currentQuestion?.id;
  const timerTotal = session?.config.timer ?? 0;

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
    if (!flipped || timerTotal === 0) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(timerTotal);
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
  }, [flipped, timerTotal, questionId]);

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

      <View style={styles.cardWrap}>
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          playerName={currentPlayer.name}
          language={settings.language}
          onFlip={() => setFlipped(true)}
        />
      </View>

      <View style={styles.bottom}>
        <StreakBadge streak={currentPlayer.streak} />

        {flipped && timeLeft !== null ? (
          <View style={styles.timerWrap}>
            <TimerRing seconds={timeLeft} total={timerTotal} size={92} strokeWidth={6} />
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
});
