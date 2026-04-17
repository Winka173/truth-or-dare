import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Settings as SettingsIcon } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/hooks/useGame';
import { useT } from '@/hooks/useT';
import { useAppSelector } from '@/store/hooks';
import { storageApi } from '@/utils/storage';
import { animation, colors, fonts, fontSize, spacing } from '@/constants/theme';
import type { Player } from '@/types/game';

export default function HomeScreen() {
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const { start } = useGame();
  const t = useT();

  const handleQuickStart = () => {
    const lastConfig = storageApi.loadLastConfig();
    const lastPlayers = storageApi.loadLastPlayers();
    if (!lastConfig) {
      router.push('/setup');
      return;
    }
    const names = lastPlayers.length > 0 ? lastPlayers : ['Player 1'];
    const players: Player[] = names.map((name, i) => ({
      id: `p_${i}`,
      name,
      score: 0,
      truthsCompleted: 0,
      daresCompleted: 0,
      skips: 0,
      streak: 0,
    }));
    start(lastConfig, players);
    router.push('/play');
  };

  const hasQuickStart = storageApi.loadLastConfig() !== null && allQuestions.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        right={
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('home.openSettings')}
            style={styles.iconButton}
          >
            <SettingsIcon size={22} color={colors.text.primary} />
          </Pressable>
        }
      />
      <View style={styles.content}>
        <Animated.Text
          entering={FadeInDown.duration(animation.entry.header)}
          style={styles.wordmark}
        >
          {t('app.title')}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(100)} style={styles.tagline}>
          {t('app.tagline')}
        </Animated.Text>
        <View style={styles.actions}>
          {hasQuickStart ? (
            <Animated.View entering={FadeInDown.delay(200)}>
              <Button
                label={t('home.quickStart')}
                variant="primary"
                fullWidth
                onPress={handleQuickStart}
                accessibilityLabel={t('home.quickStartA11y')}
              />
            </Animated.View>
          ) : null}
          <Animated.View entering={FadeInDown.delay(260)}>
            <Button
              label={t('home.newGame')}
              variant={hasQuickStart ? 'secondary' : 'primary'}
              fullWidth
              onPress={() => router.push('/setup')}
              accessibilityLabel={t('home.newGameA11y')}
            />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(320)}>
            <Button
              label={t('home.browseCategories')}
              variant="secondary"
              fullWidth
              onPress={() => router.push('/categories')}
              accessibilityLabel={t('home.browseA11y')}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    justifyContent: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: fonts.heading,
    fontSize: fontSize['4xl'],
    color: colors.text.primary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
