import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { useFonts } from 'expo-font';
import { store } from '@/store';
import { loadQuestions } from '@/store/slices/gameSlice';
import { hydrate as hydrateSettings } from '@/store/slices/settingsSlice';
import { hydrate as hydratePacks } from '@/store/slices/packsSlice';
import { safeFlattenQuestions } from '@/utils/questionLoader';
import { storageApi } from '@/utils/storage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { colors } from '@/constants/theme';
import questionsData from '@/data/questions.json';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — may already be hidden */
});

// Boot once at module load: parse questions, hydrate persisted state.
// Runs before React renders anything because it's outside the component.
(function boot() {
  try {
    const flattened = safeFlattenQuestions(questionsData);
    if (flattened.length > 0) store.dispatch(loadQuestions(flattened));

    const savedSettings = storageApi.loadSettings();
    if (savedSettings) store.dispatch(hydrateSettings(savedSettings));

    const savedPacks = storageApi.loadUnlockedPacks();
    if (savedPacks.length > 0) store.dispatch(hydratePacks(savedPacks));
  } catch (err) {
    if (__DEV__) console.error('Boot failure:', err);
  }
})();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_400Regular,
  });

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
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg.screen },
            }}
          />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}
