// app/(main)/setup/players.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatePresence } from 'moti';
import { ArrowLeft } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { PlayerChip } from '@/components/ui/PlayerChip';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useSetupWizard, wizardActions } from '@/hooks/useSetupWizard';
import { GAME_CONFIG } from '@/constants/config';
import { fonts, spacing, radius } from '@/constants/theme';

export default function PlayersRoute() {
  const router = useRouter();
  const { playerNames } = useSetupWizard();
  const [input, setInput] = useState('');

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed || playerNames.length >= GAME_CONFIG.MAX_PLAYERS) return;
    wizardActions.addPlayer(trimmed);
    setInput('');
  }

  const canAdd = !!input.trim() && playerNames.length < GAME_CONFIG.MAX_PLAYERS;

  return (
    <GradientScreen gradient="setup">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
            <ArrowLeft size={26} color="#FFFFFF" />
          </Pressable>
          <ProgressDots total={3} current={0} />
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Who's playing?</Text>
          <Text style={styles.subtitle}>Add up to {GAME_CONFIG.MAX_PLAYERS} players</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleAdd}
              placeholder="Player name"
              placeholderTextColor="rgba(255,255,255,0.50)"
              style={styles.input}
              maxLength={20}
              returnKeyType="done"
              accessibilityLabel="Player name input"
            />
            <Pressable
              onPress={handleAdd}
              style={[styles.addButton, !canAdd && styles.addDisabled]}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel="Add player"
            >
              <Text style={styles.addLabel}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.chipsWrap}>
            <AnimatePresence>
              {playerNames.map((name, i) => (
                <PlayerChip
                  key={`${name}-${i}`}
                  name={name}
                  index={i}
                  onRemove={() => wizardActions.removePlayer(i)}
                />
              ))}
            </AnimatePresence>
          </View>
        </View>

        <View style={styles.bottom}>
          <GradientButton
            label="Next →"
            onPress={() => router.push('/(main)/setup/age')}
            disabled={playerNames.length === 0}
            accessibilityLabel="Continue to age group selection"
          />
        </View>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 36, color: '#FFFFFF' },
  subtitle: { fontFamily: fonts.body, fontSize: 16, color: 'rgba(255,255,255,0.70)', marginBottom: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1, height: 52, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.lg, fontFamily: fonts.body, fontSize: 16, color: '#FFFFFF',
  },
  addButton: {
    height: 52, paddingHorizontal: spacing.lg, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.30)', alignItems: 'center', justifyContent: 'center',
  },
  addDisabled: { opacity: 0.4 },
  addLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#FFFFFF' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
