import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Star, Volume2, VolumeX } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { CardShimmer } from '@/components/ui/CardShimmer';
import { useGame } from '@/hooks/useGame';
import { useFavorites } from '@/hooks/useFavorites';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useT } from '@/hooks/useT';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTtsEnabled } from '@/store/slices/settingsSlice';
import { getTranslatedText } from '@/utils/questionFilter';
import { fonts, spacing, colors } from '@/constants/theme';
import type { LanguageCode } from '@/types/question';

export default function PlayRoute() {
  const router = useRouter();
  const t = useT();
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;
  const { session, currentQuestion, currentPlayer, complete, skip, end } = useGame();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { speak, stop } = useSpeech();
  const { playWhoosh, playCheer } = useSoundEffects();
  const dispatch = useAppDispatch();
  const ttsEnabled = useAppSelector((s) => s.settings.ttsEnabled);
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

  const hasActive = !!(session && currentQuestion && currentPlayer);

  useEffect(() => {
    if (!hasActive) {
      router.replace('/(main)');
    }
  }, [hasActive, router]);

  const text = currentQuestion ? getTranslatedText(currentQuestion, language) : '';

  useEffect(() => {
    if (!currentQuestion) return;
    const timeoutId = setTimeout(() => speak(text), 400);
    return () => {
      clearTimeout(timeoutId);
      stop();
    };
  }, [currentQuestion, text, speak, stop]);

  useEffect(() => {
    if (currentQuestion) playWhoosh();
  }, [currentQuestion, playWhoosh]);

  useEffect(() => {
    if (currentPlayer && currentPlayer.streak >= 3 && currentPlayer.streak % 3 === 0) {
      playCheer();
    }
  }, [currentPlayer, playCheer]);

  if (!session || !currentQuestion || !currentPlayer) {
    return null;
  }
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
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={currentQuestion.id}
            from={{ opacity: 0, translateY: 60, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 14, stiffness: 150 }}
            style={{ width: '100%' }}
          >
            <FrostedCard style={styles.card}>
            <CardShimmer />
            <View style={styles.cardHeader}>
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
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Pressable
                  onPress={() => {
                    stop();
                    dispatch(setTtsEnabled(!ttsEnabled));
                  }}
                  hitSlop={12}
                  accessibilityLabel={ttsEnabled ? t('play.muteVoice') : t('play.unmuteVoice')}
                  accessibilityRole="button"
                >
                  {ttsEnabled ? (
                    <Volume2 size={22} color="rgba(255,255,255,0.80)" />
                  ) : (
                    <VolumeX size={22} color="rgba(255,255,255,0.40)" />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => toggleFavorite(currentQuestion.id)}
                  hitSlop={16}
                  accessibilityLabel={starred ? 'Remove from favorites' : 'Add to favorites'}
                  accessibilityRole="button"
                >
                  <Star
                    size={22}
                    color={starred ? colors.gold : 'rgba(255,255,255,0.60)'}
                    fill={starred ? colors.gold : 'transparent'}
                  />
                </Pressable>
              </View>
            </View>
            <Text style={styles.questionText}>{text}</Text>
            {currentQuestion.follow_up_question ? (
              <Text style={styles.followUp}>{currentQuestion.follow_up_question}</Text>
            ) : null}
            </FrostedCard>
          </MotiView>
        </AnimatePresence>
      </View>

      <View style={styles.bottom}>
        <GradientButton
          label={`${t('common.done')} \u2705`}
          onPress={handleComplete}
          accessibilityLabel="Mark question as completed"
        />
        {session.config.allowSkips ? (
          <TextButton
            label={`${t('common.skip')} \uD83D\uDE05`}
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
