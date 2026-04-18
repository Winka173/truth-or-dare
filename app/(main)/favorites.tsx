// app/(main)/favorites.tsx
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { GradientScreen } from '@/components/ui/GradientScreen';
import { useFavorites } from '@/hooks/useFavorites';
import { fonts, spacing } from '@/constants/theme';
import empty from '@/assets/lottie/empty-state.json';

export default function FavoritesRoute() {
  const router = useRouter();
  const { ids } = useFavorites();

  return (
    <GradientScreen gradient="home">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} accessibilityLabel="Back">
          <ArrowLeft size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Saved Questions</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {ids.length === 0 ? (
          <View style={styles.emptyBlock}>
            <LottieView source={empty} autoPlay loop style={styles.emptyLottie} />
            <Text style={styles.empty}>No saved questions yet. Star questions during gameplay to save them here.</Text>
          </View>
        ) : (
          <Text style={styles.empty}>{ids.length} saved questions — full viewer in Plan 4.</Text>
        )}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 22, color: '#FFFFFF' },
  content: { padding: spacing.lg },
  empty: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.70)', textAlign: 'center', marginTop: spacing['2xl'] },
  emptyBlock: { alignItems: 'center', marginTop: spacing.xl },
  emptyLottie: { width: 200, height: 200 },
});
