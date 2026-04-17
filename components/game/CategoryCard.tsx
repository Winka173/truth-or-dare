import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Lock } from 'lucide-react-native';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { CategoryConfig } from '@/constants/categories';

export interface CategoryCardProps {
  category: CategoryConfig;
  questionCount?: number;
  locked?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryCard({ category, questionCount, locked, onPress }: CategoryCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale.card);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Category: ${category.label}${locked ? ', locked' : ''}`}
      accessibilityState={{ disabled: !!locked }}
    >
      <View style={[styles.accent, { backgroundColor: category.color }]} />
      <View style={styles.body}>
        <Text style={styles.icon}>{category.icon}</Text>
        <Text style={styles.label} numberOfLines={2}>
          {category.label}
        </Text>
        {typeof questionCount === 'number' ? (
          <Text style={styles.count}>{questionCount} questions</Text>
        ) : null}
      </View>
      {locked ? (
        <View style={styles.lock}>
          <Lock size={14} color={colors.text.primary} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 130,
    flexDirection: 'row',
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    letterSpacing: 0.25,
  },
  lock: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.overlay.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
