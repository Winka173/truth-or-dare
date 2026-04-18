// components/ui/FloatingEmojis.tsx
import { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const EMOJIS = ['🎉', '🔥', '😈', '💀', '🎲', '✨', '💞', '🍿'];
const { width, height } = Dimensions.get('window');

function Floater({ emoji, seed }: { emoji: string; seed: number }) {
  const y = useSharedValue(height + 80);
  const xBase = (seed * 97) % width;
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = 8000 + (seed * 743) % 6000;
    y.value = withRepeat(withTiming(-120, { duration, easing: Easing.linear }), -1, false);
    opacity.value = withRepeat(withTiming(0.55, { duration: 1200 }), -1, true);
  }, [seed, y, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: xBase }],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.emoji, style]}>{emoji}</Animated.Text>;
}

export function FloatingEmojis() {
  const reduce = useReduceMotion();
  if (reduce) return null;

  return (
    <>
      {EMOJIS.map((e, i) => (
        <Floater key={`${e}-${i}`} emoji={e} seed={i + 1} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
    fontSize: 32,
    opacity: 0,
  },
});
