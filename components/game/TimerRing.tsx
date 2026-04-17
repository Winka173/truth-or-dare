import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { animation, colors, fonts, fontSize } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface TimerRingProps {
  seconds: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function TimerRing({ seconds, total, size = 120, strokeWidth = 8 }: TimerRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  const progress = useSharedValue(1);

  useEffect(() => {
    const pct = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0;
    progress.value = withTiming(pct, { duration: 250 });
  }, [seconds, total, progress]);

  const ringProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      progress.value,
      [animation.timer.dangerThresholdPct, animation.timer.warningThresholdPct, 1],
      [colors.timer.danger, colors.timer.warning, colors.timer.safe],
    );
    return {
      strokeDashoffset: circumference * (1 - progress.value),
      stroke,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [animation.timer.dangerThresholdPct, animation.timer.warningThresholdPct, 1],
      [colors.timer.danger, colors.timer.warning, colors.timer.safe],
    );
    return { color };
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`${seconds} seconds remaining`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.timer.track}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          originX={size / 2}
          originY={size / 2}
          rotation={-90}
          animatedProps={ringProps}
        />
      </Svg>
      <Animated.Text style={[styles.text, textStyle]} maxFontSizeMultiplier={1.3}>
        {seconds}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: fontSize['4xl'],
    includeFontPadding: false,
  },
});
