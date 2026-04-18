// components/ui/CardShimmer.tsx
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function CardShimmer() {
  const translateX = useSharedValue(-400);
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) return;
    translateX.value = withRepeat(
      withDelay(2500, withTiming(400, { duration: 800, easing: Easing.inOut(Easing.ease) })),
      -1,
      false,
    );
  }, [reduce, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (reduce) return null;

  return (
    <AnimatedGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, styles.shimmer, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  shimmer: { width: 200 },
});
