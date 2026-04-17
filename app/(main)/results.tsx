import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Confetti } from '@/components/game/Confetti';
import { ResultCard } from '@/components/game/ResultCard';
import { useGame } from '@/hooks/useGame';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

export default function ResultsScreen() {
  const { session, start, reset } = useGame();

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Results" />
        <EmptyState
          title="No results to show"
          subtitle="Start a game from the home screen."
          actionLabel="Back to home"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  const ranked = [...session.players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const { config, players: originalPlayers } = session;

  const handlePlayAgain = () => {
    const fresh = originalPlayers.map((p) => ({
      ...p,
      score: 0,
      truthsCompleted: 0,
      daresCompleted: 0,
      skips: 0,
      streak: 0,
    }));
    start(config, fresh);
    router.replace('/play');
  };

  const handleNewGame = () => {
    reset();
    router.replace('/setup');
  };

  const handleHome = () => {
    reset();
    router.replace('/');
  };

  const showConfetti = winner !== undefined && winner.score > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {showConfetti ? <Confetti count={32} /> : null}
      <ScreenHeader title="Results" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.winnerHeadline}>
          {winner ? `${winner.name} wins` : 'Game ended'}
        </Text>
        <Text style={styles.winnerSubtitle}>
          {winner && winner.score > 0
            ? `${winner.score} points`
            : 'No points scored this round.'}
        </Text>
        <View style={styles.list}>
          {ranked.map((p, i) => (
            <ResultCard key={p.id} player={p} rank={i} isWinner={i === 0} />
          ))}
        </View>
        <View style={styles.actions}>
          <Button
            label="Play Again"
            variant="primary"
            fullWidth
            onPress={handlePlayAgain}
            accessibilityLabel="Play again with same settings"
          />
          <Button
            label="New Game"
            variant="secondary"
            fullWidth
            onPress={handleNewGame}
            accessibilityLabel="Configure a new game"
          />
          <Button
            label="Home"
            variant="secondary"
            fullWidth
            onPress={handleHome}
            accessibilityLabel="Return to home"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  winnerHeadline: {
    fontFamily: fonts.heading,
    fontSize: fontSize['3xl'],
    color: colors.primary.default,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  winnerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
