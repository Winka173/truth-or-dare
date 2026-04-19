// components/packs/PackUnlockSheet.tsx
import { Text, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { usePacks } from '@/hooks/usePacks';
import { PACK_CONFIG } from '@/constants/config';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { fonts, spacing, radius, colors } from '@/constants/theme';
import type { PackId } from '@/types/question';

interface Props {
  visible: boolean;
  packId: Exclude<PackId, 'base'> | null;
  onClose: () => void;
}

export function PackUnlockSheet({ visible, packId, onClose }: Props) {
  const { purchase, iapStatus } = usePacks();

  if (!packId) return null;
  const cfg = PACK_CONFIG[packId];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>{cfg.label}</Text>
          <Text style={styles.description}>{cfg.description}</Text>
          <Text style={styles.price}>${cfg.price.toFixed(2)}</Text>

          {iapStatus === 'loading' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <GradientButton
              label={`Unlock for $${cfg.price.toFixed(2)}`}
              onPress={() => purchase(packId)}
              accessibilityLabel={`Unlock ${cfg.label}`}
            />
          )}
          {iapStatus === 'error' ? (
            <Text style={styles.error}>Purchase failed. Please try again.</Text>
          ) : null}
          <TextButton label="Close" onPress={onClose} accessibilityLabel="Close" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: { fontFamily: fonts.heading, fontSize: 26, color: '#FFFFFF', textAlign: 'center' },
  description: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.80)', textAlign: 'center' },
  price: { fontFamily: fonts.heading, fontSize: 36, color: colors.gold, textAlign: 'center', marginVertical: spacing.sm },
  error: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.error, textAlign: 'center' },
});
