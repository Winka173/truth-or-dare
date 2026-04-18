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
    start(
      {
        ageGroup: 'adult',
        mood: 'party',
        timer: 0,
        questionsPerRound: 'unlimited',
        allowSkips: true,
        typeFilter: 'both',
        categoryIds: 'all',
      },
      [
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
      saved,
    );
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
                      accessibilityRole="button"
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
