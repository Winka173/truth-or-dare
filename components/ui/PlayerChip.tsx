// components/ui/PlayerChip.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { fonts, spacing, radius } from '@/constants/theme';

interface PlayerChipProps {
  name: string;
  onRemove: () => void;
  /** Used to stagger entrance animation — pass the chip's list index. */
  index: number;
}

export function PlayerChip({ name, onRemove, index }: PlayerChipProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 180,
        delay: index * 40,
      }}
      style={styles.chip}
    >
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Pressable
        onPress={onRemove}
        style={styles.removeButton}
        accessibilityLabel={`Remove ${name}`}
        accessibilityRole="button"
        hitSlop={8}
      >
        <Text style={styles.removeIcon}>×</Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    maxWidth: 200,
  },
  name: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  removeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 20,
  },
});
