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
}

const initialState: SettingsState = {
  soundEnabled: true,
  hapticEnabled: true,
  defaultAgeGroup: GAME_CONFIG.DEFAULT_AGE_GROUP,
  defaultMood: GAME_CONFIG.DEFAULT_MOOD,
  language: GAME_CONFIG.DEFAULT_LANGUAGE,
  theme: 'system',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
    },
  },
});

export const { hydrate } = settingsSlice.actions;
export default settingsSlice.reducer;
