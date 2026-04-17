import { Stack } from 'expo-router';
import { colors, animation } from '@/constants/theme';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.screen },
        animation: 'slide_from_right',
        animationDuration: animation.transition.slide,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="settings"
        options={{
          animation: 'slide_from_bottom',
          animationDuration: animation.transition.modal,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
