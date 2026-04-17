import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          accessibilityLabel={actionLabel}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconSlot: { marginBottom: spacing.xs },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
  },
});
