// components/ui/FrostedCard.tsx
import { BlurView } from 'expo-blur';
import { useColorScheme, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

interface FrostedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function FrostedCard({ children, style, intensity = 20 }: FrostedCardProps) {
  const scheme = useColorScheme();

  return (
    <BlurView
      intensity={intensity}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      style={[styles.card, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
  },
});
