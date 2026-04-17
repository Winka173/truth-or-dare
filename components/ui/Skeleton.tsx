import { useEffect } from 'react';
import { StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.base, { width, height }, animatedStyle, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.md,
  },
});
