import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PALETTE = [
  colors.primary.default,
  colors.primary.container,
  colors.primary.fixed,
  colors.tertiary.default,
  colors.tertiary.container,
  colors.secondary.default,
] as const;

interface ParticleProps {
  index: number;
  startX: number;
}

function Particle({ index, startX }: ParticleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const color = PALETTE[index % PALETTE.length];
  const delay = index * 30;

  useEffect(() => {
    const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 0.9;
    const targetY = 420 + Math.random() * 260;
    const targetRotate = (Math.random() - 0.5) * 720;
    const duration = 1400 + Math.random() * 600;

    translateX.value = withDelay(
      delay,
      withTiming(targetX, { duration, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(targetY, { duration, easing: Easing.bezier(0.33, 0.66, 0.66, 1) }),
    );
    rotate.value = withDelay(delay, withTiming(targetRotate, { duration }));
    opacity.value = withDelay(delay + duration - 400, withTiming(0, { duration: 400 }));
    scale.value = withDelay(delay + duration - 200, withTiming(0.5, { duration: 200 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.particle, { backgroundColor: color, left: startX }, animatedStyle]}
    />
  );
}

export interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 32 }: ConfettiProps) {
  const reduceMotion = useReduceMotion();
  if (reduceMotion) return null;
  const centerX = SCREEN_WIDTH / 2 - 4;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} index={i} startX={centerX} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 12,
    borderRadius: 2,
  },
});
