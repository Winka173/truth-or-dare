import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { TextButton } from '@/components/ui/TextButton';
import { VoicePickerSheet } from '@/components/ui/VoicePickerSheet';
import { useSettings } from '@/hooks/useSettings';
import { usePacks } from '@/hooks/usePacks';
import { useT } from '@/hooks/useT';
import { useAppSelector } from '@/store/hooks';
import { APP_VERSION } from '@/constants/config';
import { fonts, spacing } from '@/constants/theme';
import type { LanguageCode } from '@/types/question';

export default function SettingsRoute() {
  const router = useRouter();
  const { settings, toggleSound, toggleHaptic } = useSettings();
  const { devRestore } = usePacks();
  const { soundEnabled, hapticEnabled } = settings;
  const t = useT();
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;
  const [voiceCount, setVoiceCount] = useState(0);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((vs) => {
      setVoiceCount(vs.filter((v) => v.language?.toLowerCase().startsWith(language)).length);
    });
  }, [language]);

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Close settings">
          <X size={26} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound Effects</Text>
          <Switch value={soundEnabled} onValueChange={toggleSound} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptic Feedback</Text>
          <Switch value={hapticEnabled} onValueChange={toggleHaptic} />
        </View>

        <Pressable onPress={() => router.push('/(main)/favorites')} style={styles.linkRow} accessibilityRole="button">
          <Text style={styles.rowLabel}>Saved Questions →</Text>
        </Pressable>

        {voiceCount > 1 ? (
          <Pressable onPress={() => setVoiceSheetOpen(true)} style={styles.linkRow} accessibilityRole="button">
            <Text style={styles.rowLabel}>{t('settings.voice')} →</Text>
          </Pressable>
        ) : null}

        <View style={styles.spacer} />
        <TextButton label="Restore Purchases" onPress={() => devRestore([])} accessibilityLabel="Restore past purchases" />
        <Text style={styles.version}>v{APP_VERSION}</Text>
      </ScrollView>
      <VoicePickerSheet visible={voiceSheetOpen} onClose={() => setVoiceSheetOpen(false)} />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 28, color: '#FFFFFF' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  linkRow: { paddingVertical: spacing.md },
  rowLabel: { fontFamily: fonts.bodySemi, fontSize: 17, color: '#FFFFFF' },
  spacer: { height: spacing.xl },
  version: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.50)', textAlign: 'center', marginTop: spacing.lg },
});
