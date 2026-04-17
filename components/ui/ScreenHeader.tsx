import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, spacing } from '@/constants/theme';

export interface ScreenHeaderProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function ScreenHeader({ title = 'Truth or Dare', left, right }: ScreenHeaderProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(animation.entry.header).springify()}
      style={styles.container}
    >
      <View style={styles.side}>{left}</View>
      <Text style={styles.wordmark} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  side: {
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  wordmark: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
