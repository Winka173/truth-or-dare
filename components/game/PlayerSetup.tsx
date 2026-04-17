import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { animation, colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import { GAME_CONFIG } from '@/constants/config';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface PlayerSetupProps {
  players: string[];
  onChange: (players: string[]) => void;
}

export function PlayerSetup({ players, onChange }: PlayerSetupProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (players.length >= GAME_CONFIG.MAX_PLAYERS) return;
    onChange([...players, trimmed]);
    setDraft('');
  };

  const remove = (i: number) => {
    onChange(players.filter((_, idx) => idx !== i));
  };

  const atCap = players.length >= GAME_CONFIG.MAX_PLAYERS;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder={atCap ? 'Player limit reached' : 'Player name'}
            editable={!atCap}
            onSubmitEditing={add}
            returnKeyType="done"
            maxLength={20}
          />
        </View>
        <Button
          label="Add"
          onPress={add}
          disabled={!draft.trim() || atCap}
          accessibilityLabel="Add player"
        />
      </View>
      <View style={styles.badges}>
        {players.map((name, i) => (
          <Animated.View
            key={`${name}_${i}`}
            entering={FadeInDown.delay(i * animation.entry.playerBadgeStagger)}
            style={styles.badge}
          >
            <Text style={styles.badgeLabel} numberOfLines={1}>
              {name}
            </Text>
            <Pressable
              onPress={() => remove(i)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${name}`}
              hitSlop={8}
              style={styles.remove}
            >
              <X size={14} color={colors.text.secondary} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  inputWrap: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.containerHighest,
    borderRadius: radius.full,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  badgeLabel: {
    fontFamily: fonts.bodyMed,
    fontSize: fontSize.sm,
    color: colors.text.primary,
    maxWidth: 120,
  },
  remove: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
