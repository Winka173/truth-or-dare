// app/(main)/setup/age.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { FrostedCard } from '@/components/ui/FrostedCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import type { AgeGroup } from '@/types/question';
import { fonts, spacing } from '@/constants/theme';

const OPTIONS: { value: AgeGroup; label: string; range: string; description: string; warning?: string }[] = [
  { value: 'kids', label: 'Kids', range: 'Ages 8–12', description: 'Silly, safe, and sweet.' },
  { value: 'teens', label: 'Teens', range: 'Ages 13–17', description: 'School, crushes, and drama.' },
  { value: 'young_adult', label: 'Young Adult', range: 'Ages 18–24', description: 'College, career, and chaos.' },
  { value: 'adult', label: 'Adult', range: 'Ages 25+', description: 'Grown-up truths and dares.' },
  { value: '18plus', label: 'Adults Only 🌶️', range: '18+', description: 'Spicy content only.', warning: 'Requires Adults Only pack' },
];

export default function AgeRoute() {
  const router = useRouter();
  const { ageGroup } = useSetupWizard();

  function pick(value: AgeGroup) {
    wizardActions.setAgeGroup(value);
    setTimeout(() => router.push('/(main)/setup/vibe'), 400);
  }

  return (
    <GradientScreen gradient="setup">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <ProgressDots total={3} current={1} />
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Pick an age group</Text>
        <Text style={styles.subtitle}>Questions will match the selected level.</Text>

        <View style={styles.list}>
          {OPTIONS.map((opt, i) => {
            const selected = ageGroup === opt.value;
            return (
              <MotiView
                key={opt.value}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 150, delay: i * 60 }}
              >
                <Pressable onPress={() => pick(opt.value)} accessibilityRole="button" accessibilityLabel={`${opt.label}, ${opt.range}`} accessibilityState={{ selected }}>
                  <FrostedCard style={[styles.card, selected && styles.cardSelected]}>
                    <View style={styles.cardRow}>
                      <Text style={styles.label}>{opt.label}</Text>
                      <Text style={styles.range}>{opt.range}</Text>
                    </View>
                    <Text style={styles.description}>{opt.description}</Text>
                    {opt.warning ? <Text style={styles.warning}>{opt.warning}</Text> : null}
                    {selected ? (
                      <MotiView
                        from={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.progressFill}
                      />
                    ) : null}
                  </FrostedCard>
                </Pressable>
              </MotiView>
            );
          })}
        </View>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 32, color: '#FFFFFF' },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.70)' },
  list: { gap: spacing.sm, marginTop: spacing.md },
  card: { padding: spacing.md, gap: 4 },
  cardSelected: { borderColor: '#FFFFFF', borderWidth: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  label: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF' },
  range: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.60)' },
  description: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.80)' },
  warning: { fontFamily: fonts.bodySemi, fontSize: 13, color: '#FBBF24', marginTop: 4 },
  progressFill: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    transformOrigin: 'left',
  },
});
