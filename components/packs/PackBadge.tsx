import { StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export function PackBadge() {
  return (
    <View style={styles.badge} accessibilityLabel="Premium">
      <Lock size={10} color={colors.text.primary} />
      <Text style={styles.text}>Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlay.glass,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.text.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
