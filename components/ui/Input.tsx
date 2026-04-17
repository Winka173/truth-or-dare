import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  showCount?: boolean;
}

export function Input({ label, error, showCount, maxLength, value, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const count = typeof value === 'string' ? value.length : 0;
  const showCountBadge = showCount && typeof maxLength === 'number' && count >= maxLength * 0.8;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        <TextInput
          {...rest}
          value={value}
          maxLength={maxLength}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={styles.input}
          placeholderTextColor={colors.text.placeholder}
        />
      </View>
      {(error || showCountBadge) ? (
        <View style={styles.metaRow}>
          <Text style={styles.error}>{error ?? ''}</Text>
          {showCountBadge ? (
            <Text style={styles.count}>
              {count}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  field: {
    backgroundColor: colors.bg.input,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  fieldFocused: {
    backgroundColor: colors.bg.containerHighest,
  },
  fieldError: {
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
    padding: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.semantic.error,
    flex: 1,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
});
