import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';

export interface StreakBadgeProps {
  streak: number;
  threshold?: number;
}

export function StreakBadge({ streak, threshold = 3 }: StreakBadgeProps) {
  if (streak < threshold) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.container}
      accessibilityLabel={`Streak: ${streak} consecutive dares`}
    >
      <Flame size={14} color={colors.primary.default} />
      <Text style={styles.text}>{streak}× streak</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.containerHighest,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary.default,
    letterSpacing: 0.5,
  },
});
