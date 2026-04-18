// hooks/useSpeech.ts
import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useAppSelector } from '@/store/hooks';
import type { LanguageCode } from '@/types/question';

export function useSpeech() {
  const soundEnabled = useAppSelector((s) => s.settings.soundEnabled);
  const ttsEnabled = useAppSelector((s) => s.settings.ttsEnabled);
  const preferredVoiceId = useAppSelector((s) => s.settings.preferredVoiceId);
  const language = useAppSelector((s) => s.settings.language) as LanguageCode;

  const speak = useCallback(
    (text: string) => {
      if (!soundEnabled || !ttsEnabled) return;
      Speech.stop();
      Speech.speak(text, {
        language,
        voice: preferredVoiceId ?? undefined,
      });
    },
    [soundEnabled, ttsEnabled, language, preferredVoiceId],
  );

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  const listVoices = useCallback(async () => {
    const all = await Speech.getAvailableVoicesAsync();
    return all.filter((v) => v.language?.toLowerCase().startsWith(language.toLowerCase()));
  }, [language]);

  return { speak, stop, listVoices };
}
