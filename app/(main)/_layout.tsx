// app/(main)/_layout.tsx
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/players" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/age" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="setup/vibe" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
      <Stack.Screen name="handoff" options={{ animation: 'slide_from_right', animationDuration: 280, gestureEnabled: false }} />
      <Stack.Screen name="play" options={{ animation: 'fade', animationDuration: 220, gestureEnabled: false }} />
      <Stack.Screen name="results" options={{ animation: 'fade', animationDuration: 220, gestureEnabled: false }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom', animationDuration: 340, presentation: 'modal' }} />
      <Stack.Screen name="favorites" options={{ animation: 'slide_from_right', animationDuration: 280 }} />
    </Stack>
  );
}
