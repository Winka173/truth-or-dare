// components/ui/GradientButton.tsx
import { useEffect } from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { fonts, spacing, radius, animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  glow?: boolean;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  glow = false,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (glow) {
      glowOpacity.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
    }
  }, [glow, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow ? glowOpacity.value : 0,
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, disabled && styles.disabled, style]}
      onPressIn={() => { scale.value = withSpring(animation.pressScale, animation.spring); }}
      onPressOut={() => { scale.value = withSpring(1, animation.spring); }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
    shadowColor: '#FFFFFF',
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 18, color: '#FFFFFF', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
});
