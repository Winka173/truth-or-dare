import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';

export interface PlayerBadgeProps {
  name: string;
  index?: number;
  active?: boolean;
}

export function PlayerBadge({ name, index = 0, active }: PlayerBadgeProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <Animated.View
      entering={FadeInDown.delay(index * animation.entry.playerBadgeStagger).springify()}
      style={[styles.row, active && styles.rowActive]}
      accessibilityLabel={`Current player: ${name}`}
    >
      <View style={[styles.avatar, active && styles.avatarActive]}>
        <Text style={[styles.initial, active && styles.initialActive]}>{initial}</Text>
      </View>
      <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
        {name}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.full,
    paddingRight: spacing.md,
    paddingVertical: 4,
    paddingLeft: 4,
    alignSelf: 'flex-start',
  },
  rowActive: {
    backgroundColor: colors.primary.container,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bg.containerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: colors.primary.fixed,
  },
  initial: {
    fontFamily: fonts.heading,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  initialActive: {
    color: colors.primary.onPrimary,
  },
  name: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.base,
    color: colors.text.primary,
    maxWidth: 150,
  },
  nameActive: {
    color: colors.primary.onPrimary,
  },
});
