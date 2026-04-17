import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { animation, colors, shadow, spacing } from '@/constants/theme';

export interface FABMenuProps {
  children?: ReactNode;
  accessibilityLabel?: string;
}

export function FABMenu({ children, accessibilityLabel = 'Open menu' }: FABMenuProps) {
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);
  const press = useSharedValue(1);
  const backdrop = useSharedValue(0);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      rotation.value = withSpring(next ? 45 : 0, { damping: 12, stiffness: 140 });
      backdrop.value = withTiming(next ? 0.45 : 0, { duration: 200 });
      return next;
    });
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: press.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  return (
    <>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, backdropStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggle}
          accessibilityLabel="Close menu"
        />
      </Animated.View>
      {open ? <View style={styles.menuItems}>{children}</View> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        onPressIn={() => {
          press.value = withSpring(animation.pressScale.button);
        }}
        onPressOut={() => {
          press.value = withSpring(1);
        }}
        onPress={toggle}
      >
        <Animated.View style={[styles.fab, fabStyle]}>
          <Plus size={24} color={colors.primary.onPrimary} />
        </Animated.View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  menuItems: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing['3xl'] + 80,
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing['3xl'],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.ctaGlow,
  },
});
