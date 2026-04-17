import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, radius, shadow, spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface ButtonProps
  extends Omit<PressableProps, 'style' | 'children' | 'onPressIn' | 'onPressOut'> {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: ReactNode;
  accessibilityLabel: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  disabled,
  fullWidth,
  icon,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const variantStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : styles.destructive;
  const textStyle =
    variant === 'secondary' ? styles.textSecondary : styles.textOnPrimary;

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale.button, { damping: 15, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      style={[
        styles.base,
        variantStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      {icon}
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.4 },
  primary: {
    backgroundColor: colors.primary.default,
    ...shadow.ctaGlow,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.overlay.ghostBorder,
  },
  destructive: {
    backgroundColor: colors.semantic.error,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.base,
    letterSpacing: 0.25,
  },
  textOnPrimary: { color: colors.primary.onPrimary },
  textSecondary: { color: colors.primary.default },
});
