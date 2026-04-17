import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import { PACK_CONFIG } from '@/constants/config';
import { Button } from '@/components/ui/Button';
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
                <Button
                  label="Not now"
                  variant="secondary"
                  fullWidth
                  onPress={onClose}
                  accessibilityLabel="Cancel unlock"
                />
                <Button
                  label={
                    iapStatus === 'loading'
                      ? 'Purchasing…'
                      : `Unlock for $${pack.price.toFixed(2)}`
                  }
                  variant="primary"
                  fullWidth
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
    backgroundColor: colors.overlay.backdrop,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.containerHighest,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  priceLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  price: {
    fontFamily: fonts.heading,
    fontSize: fontSize['3xl'],
    color: colors.primary.default,
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
