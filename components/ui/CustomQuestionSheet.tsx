// components/ui/CustomQuestionSheet.tsx
import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { addCustomQuestion } from '@/store/slices/gameSlice';
import { GradientButton } from './GradientButton';
import { TextButton } from './TextButton';
import { fonts, spacing, radius, colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CustomQuestionSheet({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [type, setType] = useState<'truth' | 'dare'>('truth');

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch(
      addCustomQuestion({
        id: `custom_${Date.now()}`,
        text: trimmed,
        type,
      }),
    );
    setText('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Add your own</Text>
          <View style={styles.typeRow}>
            <Pressable
              onPress={() => setType('truth')}
              style={[styles.typeBtn, type === 'truth' && { backgroundColor: colors.truth }]}
              accessibilityLabel="Truth"
              accessibilityRole="button"
            >
              <Text style={styles.typeLabel}>TRUTH</Text>
            </Pressable>
            <Pressable
              onPress={() => setType('dare')}
              style={[styles.typeBtn, type === 'dare' && { backgroundColor: colors.dare }]}
              accessibilityLabel="Dare"
              accessibilityRole="button"
            >
              <Text style={styles.typeLabel}>DARE</Text>
            </Pressable>
          </View>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={type === 'truth' ? 'What would you like to ask?' : 'What dare do you have?'}
            placeholderTextColor="rgba(255,255,255,0.40)"
            style={styles.input}
            multiline
            maxLength={200}
          />
          <GradientButton label="Add" onPress={handleAdd} accessibilityLabel="Add custom question" />
          <TextButton label="Cancel" onPress={onClose} accessibilityLabel="Cancel" />
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
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF', textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#FFFFFF', letterSpacing: 1 },
  input: {
    minHeight: 80,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
});
