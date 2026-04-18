// components/ui/ProgressDots.tsx
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { spacing, animation } from '@/constants/theme';

interface DotProps {
  active: boolean;
}

function Dot({ active }: DotProps) {
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.4);

  useEffect(() => {
    width.value = withSpring(active ? 24 : 8, animation.spring);
    opacity.value = withSpring(active ? 1 : 0.4, animation.spring);
  }, [active, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

interface ProgressDotsProps {
  /** Total number of steps. */
  total: number;
  /** Zero-indexed current step. */
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
