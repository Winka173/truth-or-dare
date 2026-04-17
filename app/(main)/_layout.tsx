import { Stack } from 'expo-router';
import { animation, colors } from '@/constants/theme';

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
      <Stack.Screen name="setup" />
      <Stack.Screen name="play" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="results"
        options={{ animation: 'fade', animationDuration: animation.transition.fade }}
      />
      <Stack.Screen name="categories" />
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
