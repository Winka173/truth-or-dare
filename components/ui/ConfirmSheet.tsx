// components/ui/ConfirmSheet.tsx
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts, spacing, radius } from '@/constants/theme';
import { GradientButton } from './GradientButton';
import { TextButton } from './TextButton';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* Inner Pressable prevents tap-through closing the sheet accidentally */}
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <GradientButton
              label={confirmLabel}
              onPress={onConfirm}
              accessibilityLabel={confirmLabel}
            />
            <TextButton
              label={cancelLabel}
              onPress={onCancel}
              accessibilityLabel={cancelLabel}
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
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.70)',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
