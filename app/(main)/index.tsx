// app/(main)/index.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Settings } from 'lucide-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextButton } from '@/components/ui/TextButton';
import { FloatingEmojis } from '@/components/ui/FloatingEmojis';
import { fonts, spacing } from '@/constants/theme';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <GradientScreen gradient="home">
      <FloatingEmojis />
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push('/(main)/settings')} hitSlop={16} accessibilityRole="button" accessibilityLabel="Open settings">
          <Settings size={26} color="rgba(255,255,255,0.90)" />
        </Pressable>
      </View>

      <View style={styles.center}>
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          style={styles.titleWrap}
        >
          <Text style={styles.title}>Truth</Text>
          <Text style={styles.titleOr}>or</Text>
          <Text style={styles.title}>Dare</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <Text style={styles.tagline}>No wifi. No accounts. Just play.</Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 180, delay: 400 }}
        style={styles.bottom}
      >
        <GradientButton label="Play Now 🎉" onPress={() => router.push('/(main)/setup/players')} accessibilityLabel="Start a new game" glow />
        <TextButton label="Browse Packs" onPress={() => router.push('/(main)/settings')} accessibilityLabel="Browse content packs" />
      </MotiView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  titleWrap: { alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 64, color: '#FFFFFF', lineHeight: 70, letterSpacing: -1 },
  titleOr: { fontFamily: fonts.body, fontSize: 24, fontStyle: 'italic', color: 'rgba(255,255,255,0.80)', lineHeight: 32, marginVertical: 4 },
  tagline: { fontFamily: fonts.bodySemi, fontSize: 16, color: 'rgba(255,255,255,0.80)', textAlign: 'center' },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
});
