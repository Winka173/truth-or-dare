import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { Player } from '@/types/game';

export interface ResultCardProps {
  player: Player;
  rank: number;
  isWinner?: boolean;
}

export function ResultCard({ player, rank, isWinner }: ResultCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(rank * animation.entry.resultCardStagger)}
      style={[styles.card, isWinner && styles.winner]}
    >
      <Text style={[styles.rank, isWinner && styles.winnerText]}>#{rank + 1}</Text>
      <View style={styles.body}>
        <Text style={[styles.name, isWinner && styles.winnerText]} numberOfLines={1}>
          {player.name}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>{player.truthsCompleted} truths</Text>
          <Text style={styles.stat}>{player.daresCompleted} dares</Text>
          <Text style={styles.stat}>{player.skips} skips</Text>
        </View>
      </View>
      <Text style={[styles.score, isWinner && styles.winnerText]}>{player.score}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  winner: {
    backgroundColor: colors.primary.container,
  },
  rank: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text.secondary,
    minWidth: 32,
  },
  body: { flex: 1, gap: spacing.xs },
  name: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  stats: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  stat: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  score: {
    fontFamily: fonts.mono,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
  },
  winnerText: {
    color: colors.primary.onPrimary,
  },
});
