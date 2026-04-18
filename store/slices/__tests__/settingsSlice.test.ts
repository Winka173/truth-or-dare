import settingsReducer, {
  settingsSlice,
  hydrate,
  setDefaultAgeGroup,
  setDefaultMood,
  setHapticEnabled,
  setLanguage,
  setOnboardingComplete,
  setPreferredVoiceId,
  setSoundEnabled,
  setTheme,
  setTtsEnabled,
  type SettingsState,
} from '@/store/slices/settingsSlice';

const initial: SettingsState = {
  soundEnabled: true,
  hapticEnabled: true,
  defaultAgeGroup: 'teens',
  defaultMood: 'party',
  language: 'en',
  theme: 'system',
};

describe('settingsSlice — hydrate', () => {
  it('merges a partial object without wiping untouched fields', () => {
    const state = settingsReducer(initial, hydrate({ language: 'es', soundEnabled: false }));
    expect(state.language).toBe('es');
    expect(state.soundEnabled).toBe(false);
    expect(state.defaultAgeGroup).toBe('teens');
    expect(state.theme).toBe('system');
  });

  it('no-ops on empty object', () => {
    const state = settingsReducer(initial, hydrate({}));
    expect(state).toEqual(initial);
  });
});

describe('settingsSlice — individual setters', () => {
  it('setSoundEnabled flips sound only', () => {
    const state = settingsReducer(initial, setSoundEnabled(false));
    expect(state.soundEnabled).toBe(false);
    expect(state.hapticEnabled).toBe(true);
  });

  it('setHapticEnabled flips haptic only', () => {
    const state = settingsReducer(initial, setHapticEnabled(false));
    expect(state.hapticEnabled).toBe(false);
    expect(state.soundEnabled).toBe(true);
  });

  it('setDefaultAgeGroup updates the value', () => {
    const state = settingsReducer(initial, setDefaultAgeGroup('adult'));
    expect(state.defaultAgeGroup).toBe('adult');
  });

  it('setDefaultMood updates the value', () => {
    const state = settingsReducer(initial, setDefaultMood('intimate'));
    expect(state.defaultMood).toBe('intimate');
  });

  it('setLanguage updates the value', () => {
    const state = settingsReducer(initial, setLanguage('ja'));
    expect(state.language).toBe('ja');
  });

  it('setTheme updates the value', () => {
    const dark = settingsReducer(initial, setTheme('dark'));
    expect(dark.theme).toBe('dark');
    const system = settingsReducer(dark, setTheme('system'));
    expect(system.theme).toBe('system');
  });
});

describe('settingsSlice — composability', () => {
  it('chained setters accumulate independently', () => {
    let state = settingsReducer(initial, setSoundEnabled(false));
    state = settingsReducer(state, setLanguage('de'));
    state = settingsReducer(state, setDefaultAgeGroup('18plus'));
    expect(state).toMatchObject({
      soundEnabled: false,
      language: 'de',
      defaultAgeGroup: '18plus',
      hapticEnabled: true,
      defaultMood: 'party',
    });
  });
});

describe('new settings fields', () => {
  it('initialises onboardingComplete to false', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.onboardingComplete).toBe(false);
  });

  it('initialises ttsEnabled to true', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.ttsEnabled).toBe(true);
  });

  it('initialises preferredVoiceId to null', () => {
    const state = settingsSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.preferredVoiceId).toBeNull();
  });

  it('setOnboardingComplete sets the flag', () => {
    const state = settingsSlice.reducer(undefined, setOnboardingComplete(true));
    expect(state.onboardingComplete).toBe(true);
  });

  it('setTtsEnabled sets the flag', () => {
    const state = settingsSlice.reducer(undefined, setTtsEnabled(false));
    expect(state.ttsEnabled).toBe(false);
  });

  it('setPreferredVoiceId stores the id', () => {
    const state = settingsSlice.reducer(
      undefined,
      setPreferredVoiceId('com.apple.voice.compact.en-US.Samantha'),
    );
    expect(state.preferredVoiceId).toBe('com.apple.voice.compact.en-US.Samantha');
  });

  it('hydrate merges new fields', () => {
    const state = settingsSlice.reducer(
      undefined,
      hydrate({ onboardingComplete: true, ttsEnabled: false, preferredVoiceId: 'voice-1' }),
    );
    expect(state.onboardingComplete).toBe(true);
    expect(state.ttsEnabled).toBe(false);
    expect(state.preferredVoiceId).toBe('voice-1');
  });
});
