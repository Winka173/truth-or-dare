import { I18nManager, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { AgeGroupPicker } from '@/components/game/AgeGroupPicker';
import { useSettings } from '@/hooks/useSettings';
import { usePacks } from '@/hooks/usePacks';
import { useT } from '@/hooks/useT';
import { APP_VERSION, QUESTION_DB_VERSION, SUPPORTED_LANGUAGES } from '@/constants/config';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import { isRTL } from '@/locales';
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
  const toast = useToast();
  const t = useT();

  const handleLangChange = (lang: LanguageCode) => {
    if (lang === settings.language) return;
    const willBeRTL = isRTL(lang);
    const isCurrentlyRTL = I18nManager.isRTL;
    setLang(lang);
    if (willBeRTL !== isCurrentlyRTL) {
      toast.show(t('settings.rtlRestart'), 'info');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={t('settings.title')}
        left={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('settings.closeA11y')}
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
          <Text style={styles.sectionLabel}>{t('settings.audioFeedback')}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('settings.soundEffects')}</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: colors.bg.containerHighest, true: colors.primary.default }}
              thumbColor={colors.primary.onPrimary}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('settings.hapticFeedback')}</Text>
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
          <Text style={styles.sectionLabel}>{t('settings.defaultAgeGroup')}</Text>
          <AgeGroupPicker value={settings.defaultAgeGroup} onChange={setAge} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(animation.entry.settingsSection * 2)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.langList}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = settings.language === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => handleLangChange(lang)}
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
          <Text style={styles.sectionLabel}>{t('settings.iap')}</Text>
          <Button
            label={t('settings.restorePurchases')}
            variant="secondary"
            fullWidth
            onPress={() => devRestore([])}
            accessibilityLabel={t('settings.restorePurchases')}
          />
          <Text style={styles.hint}>{t('settings.iapHint')}</Text>
        </Animated.View>

        <View style={styles.versionBlock}>
          <Text style={styles.versionText}>
            {t('settings.version', { app: APP_VERSION, db: QUESTION_DB_VERSION })}
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
