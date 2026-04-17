import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { AgeGroupPicker } from '@/components/game/AgeGroupPicker';
import { useSettings } from '@/hooks/useSettings';
import { usePacks } from '@/hooks/usePacks';
import { APP_VERSION, QUESTION_DB_VERSION, SUPPORTED_LANGUAGES } from '@/constants/config';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { LanguageCode } from '@/types/question';

const LANG_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  hi: 'हिंदी',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  ja: '日本語',
  de: 'Deutsch',
};

export default function SettingsScreen() {
  const { settings, toggleSound, toggleHaptic, setAge, setLang } = useSettings();
  const { devRestore } = usePacks();

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Settings"
        left={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            style={styles.iconButton}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0)} style={styles.section}>
          <Text style={styles.sectionLabel}>Audio & Feedback</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Sound effects</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: colors.bg.containerHighest, true: colors.primary.default }}
              thumbColor={colors.primary.onPrimary}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Haptic feedback</Text>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={toggleHaptic}
              trackColor={{ false: colors.bg.containerHighest, true: colors.primary.default }}
              thumbColor={colors.primary.onPrimary}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(animation.entry.settingsSection)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Default Age Group</Text>
          <AgeGroupPicker value={settings.defaultAgeGroup} onChange={setAge} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(animation.entry.settingsSection * 2)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Language</Text>
          <View style={styles.langList}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = settings.language === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => setLang(lang)}
                  style={[styles.langRow, selected && styles.langRowSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Language: ${LANG_LABELS[lang]}`}
                >
                  <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
                    {LANG_LABELS[lang]}
                  </Text>
                  <Text style={styles.langCode}>{lang.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(animation.entry.settingsSection * 3)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>In-App Purchases</Text>
          <Button
            label="Restore purchases"
            variant="secondary"
            fullWidth
            onPress={() => devRestore([])}
            accessibilityLabel="Restore previous purchases"
          />
          <Text style={styles.hint}>
            Real IAP integration lands in Phase 6 (expo-iap). Restore is a no-op for now.
          </Text>
        </Animated.View>

        <View style={styles.versionBlock}>
          <Text style={styles.versionText}>
            Truth or Dare v{APP_VERSION} · Questions v{QUESTION_DB_VERSION}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  toggleLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  langList: {
    gap: spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  langRowSelected: {
    backgroundColor: colors.bg.containerHighest,
  },
  langLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  langLabelSelected: {
    color: colors.primary.default,
    fontFamily: fonts.bodySemi,
  },
  langCode: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  versionBlock: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
});
