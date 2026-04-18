// app/(main)/handoff.tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAppSelector } from '@/store/hooks';
import { fonts, spacing } from '@/constants/theme';

export default function HandoffRoute() {
  const router = useRouter();
  const session = useAppSelector((s) => s.game.session);
  const currentPlayer = session?.players[session.currentPlayerIndex];

  useEffect(() => {
    if (!session || !currentPlayer) {
      router.replace('/(main)');
    }
  }, [session, currentPlayer, router]);

  if (!session || !currentPlayer) return null;

  return (
    <GradientScreen gradient="handoff">
      <View style={styles.center}>
        <MotiText
          from={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 140 }}
          style={styles.emoji}
        >
          👀
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 150 }}
          style={styles.name}
        >
          {currentPlayer.name}'s Turn
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.subtitle}
        >
          Ready for your challenge?
        </MotiText>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 150, delay: 500 }}
        style={styles.bottom}
      >
        <GradientButton
          label="I'm Ready"
          onPress={() => router.replace('/(main)/play')}
          accessibilityLabel={`Ready, ${currentPlayer.name}'s turn`}
        />
      </MotiView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  emoji: { fontSize: 96 },
  name: { fontFamily: fonts.heading, fontSize: 44, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.bodySemi, fontSize: 18, color: 'rgba(255,255,255,0.80)' },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
});
