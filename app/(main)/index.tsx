import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.wordmark}>Truth or Dare</Text>
        <Text style={styles.tagline}>
          Phase 1 foundation — real UI arrives in Phase 4.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.screen,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.heading,
    fontSize: fontSize['3xl'],
    color: colors.text.primary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
  },
});
