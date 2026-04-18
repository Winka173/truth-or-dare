// app/splash.tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiText } from 'moti';
import { useAppSelector } from '@/store/hooks';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { fonts } from '@/constants/theme';

export default function SplashRoute() {
  const router = useRouter();
  const onboardingComplete = useAppSelector((s) => s.settings.onboardingComplete);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(onboardingComplete ? '/(main)' : '/onboarding');
    }, 2000);
    return () => clearTimeout(t);
  }, [router, onboardingComplete]);

  return (
    <GradientScreen gradient="splash">
      <View style={styles.center}>
        <MotiText
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 150 }}
          style={styles.emoji}
        >
          🎲
        </MotiText>
        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 400 }}
          style={styles.title}
        >
          Truth or Dare
        </MotiText>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 96 },
  title: { fontFamily: fonts.heading, fontSize: 42, color: '#FFFFFF', letterSpacing: 0.5 },
});
