// app/_layout.tsx
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { isRTL } from '@/locales';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { store } from '@/store';
import { loadQuestions } from '@/store/slices/gameSlice';
import { hydrate as hydrateSettings } from '@/store/slices/settingsSlice';
import { hydrate as hydratePacks } from '@/store/slices/packsSlice';
import { hydrate as hydrateFavorites } from '@/store/slices/favoritesSlice';
import { safeFlattenQuestions } from '@/utils/questionLoader';
import { storageApi } from '@/utils/storage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { useIapLifecycle } from '@/hooks/useIapLifecycle';
import questionsData from '@/data/questions.json';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — may already be hidden */
});

(function boot() {
  try {
    const flattened = safeFlattenQuestions(questionsData);
    if (flattened.length > 0) store.dispatch(loadQuestions(flattened));

    const savedSettings = storageApi.loadSettings();
    if (savedSettings) store.dispatch(hydrateSettings(savedSettings));

    const savedPacks = storageApi.loadUnlockedPacks();
    if (savedPacks.length > 0) store.dispatch(hydratePacks(savedPacks));

    const savedFavorites = storageApi.loadFavoriteIds();
    if (savedFavorites.length > 0) store.dispatch(hydrateFavorites(savedFavorites));

    const lang = store.getState().settings.language;
    const wantsRTL = isRTL(lang);
    if (wantsRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
    }
  } catch (err) {
    if (__DEV__) console.error('Boot failure:', err);
  }
})();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_800ExtraBold,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  useIapLifecycle();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
            <Stack.Screen name="splash" options={{ animation: 'fade' }} />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
          </Stack>
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}
