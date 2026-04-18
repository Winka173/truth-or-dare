// components/ui/TextButton.tsx
import { Pressable, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { fonts, animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TextButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function TextButton({ label, onPress, accessibilityLabel, style }: TextButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={() => {
        scale.value = withSpring(animation.pressScale, animation.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
