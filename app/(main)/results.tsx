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
