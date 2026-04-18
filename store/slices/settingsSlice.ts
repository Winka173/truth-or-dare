import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { GAME_CONFIG } from '@/constants/config';
import type { AgeGroup, LanguageCode, Mood } from '@/types/question';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  defaultAgeGroup: AgeGroup;
  defaultMood: Mood;
  language: LanguageCode;
  theme: ThemePreference;
  onboardingComplete: boolean;
  ttsEnabled: boolean;
  preferredVoiceId: string | null;
}

const initialState: SettingsState = {
  soundEnabled: true,
  hapticEnabled: true,
  defaultAgeGroup: GAME_CONFIG.DEFAULT_AGE_GROUP,
  defaultMood: GAME_CONFIG.DEFAULT_MOOD,
  language: GAME_CONFIG.DEFAULT_LANGUAGE,
  theme: 'system',
  onboardingComplete: false,
  ttsEnabled: true,
  preferredVoiceId: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /** Apply a partial settings object loaded from MMKV at app boot. */
    hydrate(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
    },
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },
    setHapticEnabled(state, action: PayloadAction<boolean>) {
      state.hapticEnabled = action.payload;
    },
    setDefaultAgeGroup(state, action: PayloadAction<AgeGroup>) {
      state.defaultAgeGroup = action.payload;
    },
    setDefaultMood(state, action: PayloadAction<Mood>) {
      state.defaultMood = action.payload;
    },
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setOnboardingComplete(state, action: PayloadAction<boolean>) {
      state.onboardingComplete = action.payload;
    },
    setTtsEnabled(state, action: PayloadAction<boolean>) {
      state.ttsEnabled = action.payload;
    },
    setPreferredVoiceId(state, action: PayloadAction<string | null>) {
      state.preferredVoiceId = action.payload;
    },
  },
});

export const {
  hydrate,
  setSoundEnabled,
  setHapticEnabled,
  setDefaultAgeGroup,
  setDefaultMood,
  setLanguage,
  setTheme,
  setOnboardingComplete,
  setTtsEnabled,
  setPreferredVoiceId,
} = settingsSlice.actions;
export default settingsSlice.reducer;
