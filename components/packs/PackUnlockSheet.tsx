import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { PACK_CONFIG } from '@/constants/config';
import { GradientButton } from '@/components/ui/GradientButton';
import type { PackId } from '@/types/question';
import type { IapStatus } from '@/types/game';

export interface PackUnlockSheetProps {
  visible: boolean;
  packId: Exclude<PackId, 'base'> | null;
  iapStatus: IapStatus;
  onUnlock: () => void;
  onClose: () => void;
}

export function PackUnlockSheet({
  visible,
  packId,
  iapStatus,
  onUnlock,
  onClose,
}: PackUnlockSheetProps) {
  const pack = packId ? PACK_CONFIG[packId] : null;

  return (
    <Modal
      visible={visible && !!pack}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {pack ? (
            <>
              <Text style={styles.title}>{pack.label}</Text>
              <Text style={styles.description}>{pack.description}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>One-time purchase</Text>
                <Text style={styles.price}>${pack.price.toFixed(2)}</Text>
              </View>
              {iapStatus === 'error' ? (
                <Text style={styles.errorMessage}>
                  Purchase failed. Please try again.
                </Text>
              ) : null}
              <View style={styles.actions}>
                <GradientButton
                  label="Not now"
                  onPress={onClose}
                  accessibilityLabel="Cancel unlock"
                />
                <GradientButton
                  label={
                    iapStatus === 'loading'
                      ? 'Purchasing…'
                      : `Unlock for $${pack.price.toFixed(2)}`
                  }
                  disabled={iapStatus === 'loading'}
                  onPress={onUnlock}
                  accessibilityLabel={`Unlock ${pack.label} for $${pack.price.toFixed(2)}`}
                />
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0D0320',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.frostedBorder,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textOnGradient,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMutedOnGradient,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  priceLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textMutedOnGradient,
  },
  price: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.gold,
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
