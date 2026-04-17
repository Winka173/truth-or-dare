import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { Mood } from '@/types/question';

export interface MoodChipProps {
  mood: Mood;
  label: string;
  icon: string;
  selected?: boolean;
  index?: number;
  onPress: (mood: Mood) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MoodChip({
  mood,
  label,
  icon,
  selected,
  index = 0,
  onPress,
}: MoodChipProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      entering={FadeInRight.delay(index * animation.entry.chipStagger)}
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale.chip);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={() => onPress(mood)}
      style={[styles.chip, selected && styles.selected, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`Mood: ${label}`}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.containerHighest,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  selected: {
    backgroundColor: colors.primary.container,
  },
  icon: {
    fontSize: fontSize.lg,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.primary.onPrimary,
  },
});
