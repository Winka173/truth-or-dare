// components/ui/GradientScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { gradients, darkGradients, type GradientKey } from '@/constants/theme';

interface GradientScreenProps {
  gradient: GradientKey;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientScreen({ gradient, children, style }: GradientScreenProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const gradientColors = scheme === 'dark' ? darkGradients[gradient] : gradients[gradient];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
