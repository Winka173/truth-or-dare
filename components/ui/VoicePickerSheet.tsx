// components/ui/VoicePickerSheet.tsx
import { useEffect, useState } from 'react';
import { Modal, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useSpeech } from '@/hooks/useSpeech';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPreferredVoiceId } from '@/store/slices/settingsSlice';
import { fonts, spacing, radius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function VoicePickerSheet({ visible, onClose }: Props) {
  const dispatch = useAppDispatch();
  const preferredVoiceId = useAppSelector((s) => s.settings.preferredVoiceId);
  const { listVoices } = useSpeech();
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    if (visible) listVoices().then(setVoices);
  }, [visible, listVoices]);

  function pick(id: string | null) {
    dispatch(setPreferredVoiceId(id));
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Reading Voice</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Pressable style={styles.row} onPress={() => pick(null)}>
              <Text style={[styles.label, !preferredVoiceId && styles.selected]}>System Default</Text>
            </Pressable>
            {voices.map((v) => (
              <Pressable key={v.identifier} style={styles.row} onPress={() => pick(v.identifier)}>
                <Text style={[styles.label, preferredVoiceId === v.identifier && styles.selected]}>
                  {v.name || v.identifier}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.sm },
  row: { paddingVertical: spacing.md },
  label: { fontFamily: fonts.body, fontSize: 16, color: 'rgba(255,255,255,0.80)' },
  selected: { color: '#FBBF24', fontFamily: fonts.bodyBold },
});
