import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setDefaultAgeGroup,
  setDefaultMood,
  setHapticEnabled,
  setLanguage,
  setSoundEnabled,
  setTheme,
  type SettingsState,
  type ThemePreference,
} from '@/store/slices/settingsSlice';
import { storageApi } from '@/utils/storage';
import type { AgeGroup, LanguageCode, Mood } from '@/types/question';

export function useSettings() {
  const settings = useAppSelector((s) => s.settings);
  const dispatch = useAppDispatch();

  const persist = useCallback((next: SettingsState) => {
    storageApi.saveSettings(next);
  }, []);

  const toggleSound = useCallback(() => {
    const soundEnabled = !settings.soundEnabled;
    dispatch(setSoundEnabled(soundEnabled));
    persist({ ...settings, soundEnabled });
  }, [dispatch, persist, settings]);

  const toggleHaptic = useCallback(() => {
    const hapticEnabled = !settings.hapticEnabled;
    dispatch(setHapticEnabled(hapticEnabled));
    persist({ ...settings, hapticEnabled });
  }, [dispatch, persist, settings]);

  const setAge = useCallback(
    (age: AgeGroup) => {
      dispatch(setDefaultAgeGroup(age));
      persist({ ...settings, defaultAgeGroup: age });
    },
    [dispatch, persist, settings],
  );

  const setMood = useCallback(
    (mood: Mood) => {
      dispatch(setDefaultMood(mood));
      persist({ ...settings, defaultMood: mood });
    },
    [dispatch, persist, settings],
  );

  const setLang = useCallback(
    (lang: LanguageCode) => {
      dispatch(setLanguage(lang));
      persist({ ...settings, language: lang });
    },
    [dispatch, persist, settings],
  );

  const setThemePref = useCallback(
    (theme: ThemePreference) => {
      dispatch(setTheme(theme));
      persist({ ...settings, theme });
    },
    [dispatch, persist, settings],
  );

  return { settings, toggleSound, toggleHaptic, setAge, setMood, setLang, setThemePref };
}
