import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import { Button } from './Button';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttons}>
            <Button
              label={cancelLabel}
              variant="secondary"
              fullWidth
              onPress={onCancel}
              accessibilityLabel={cancelLabel}
            />
            <Button
              label={confirmLabel}
              variant={destructive ? 'destructive' : 'primary'}
              fullWidth
              onPress={onConfirm}
              accessibilityLabel={confirmLabel}
            />
          </View>
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
    fontSize: fontSize.xl,
    color: colors.text.primary,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  buttons: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
