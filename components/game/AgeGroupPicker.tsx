import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { AgeGroup } from '@/types/question';

interface Option {
  id: AgeGroup;
  label: string;
  range: string;
  description: string;
}

const OPTIONS: Option[] = [
  { id: 'kids', label: 'Kids', range: '6–12', description: 'Wholesome, gentle prompts' },
  { id: 'teens', label: 'Teens', range: '13–17', description: 'School & social life' },
  {
    id: 'young_adult',
    label: 'Young Adult',
    range: '18–24',
    description: 'College & social experiments',
  },
  {
    id: 'adult',
    label: 'Adult',
    range: '25–40',
    description: 'Career, relationships, reflection',
  },
  {
    id: '18plus',
    label: '18+',
    range: 'Adults only',
    description: 'All content including explicit categories',
  },
];

export interface AgeGroupPickerProps {
  value: AgeGroup;
  onChange: (age: AgeGroup) => void;
}

export function AgeGroupPicker({ value, onChange }: AgeGroupPickerProps) {
  return (
    <View style={styles.list}>
      {OPTIONS.map((o, i) => {
        const selected = value === o.id;
        return (
          <Animated.View
            key={o.id}
            entering={FadeInDown.delay(i * animation.entry.setupRowStagger)}
          >
            <Pressable
              onPress={() => onChange(o.id)}
              style={[styles.row, selected && styles.rowSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${o.label} (${o.range})`}
            >
              <View style={styles.textBlock}>
                <Text style={[styles.label, selected && styles.labelSelected]}>{o.label}</Text>
                <Text style={styles.range}>{o.range}</Text>
                <Text style={styles.description}>{o.description}</Text>
              </View>
              {o.id === '18plus' ? (
                <Text style={styles.warning}>Confirm you are 18 or older</Text>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    backgroundColor: colors.bg.containerHigh,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rowSelected: {
    backgroundColor: colors.bg.containerHighest,
  },
  textBlock: { gap: spacing.xs },
  label: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  labelSelected: {
    color: colors.primary.default,
  },
  range: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  warning: {
    marginTop: spacing.xs,
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.xs,
    color: colors.semantic.warning,
  },
});
