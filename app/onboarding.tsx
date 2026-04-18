// app/onboarding.tsx
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/store/hooks';
import { setOnboardingComplete } from '@/store/slices/settingsSlice';
import { storageApi } from '@/utils/storage';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { fonts, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  { emoji: '👥', title: 'Pick your players', subtitle: 'Add up to 8 friends' },
  { emoji: '🎉', title: 'Choose your vibe', subtitle: 'Party, chill, intimate, or icebreaker' },
  { emoji: '😈', title: 'Dare each other', subtitle: 'Truth or Dare — your rules' },
];

export default function OnboardingRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== current) setCurrent(index);
  }

  function complete() {
    dispatch(setOnboardingComplete(true));
    storageApi.saveSettings({ onboardingComplete: true });
    router.replace('/(main)');
  }

  function advance() {
    if (current < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
    } else {
      complete();
    }
  }

  return (
    <GradientScreen gradient="splash">
      <View style={styles.topBar}>
        <Pressable onPress={complete} hitSlop={16} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {slides.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <ProgressDots total={slides.length} current={current} />
        <View style={styles.buttonWrap}>
          <GradientButton
            label={current === slides.length - 1 ? "Let's Play 🔥" : 'Next'}
            onPress={advance}
            accessibilityLabel={current === slides.length - 1 ? 'Start the game' : 'Next slide'}
          />
        </View>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  skip: { fontFamily: fonts.bodySemi, fontSize: 16, color: 'rgba(255,255,255,0.80)' },
  scroll: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emoji: { fontSize: 120, marginBottom: spacing.lg },
  title: { fontFamily: fonts.heading, fontSize: 34, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 17, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 24 },
  bottom: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
  buttonWrap: { paddingHorizontal: spacing.sm },
});
