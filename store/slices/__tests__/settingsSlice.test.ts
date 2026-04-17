import settingsReducer, {
  hydrate,
  setDefaultAgeGroup,
  setDefaultMood,
  setHapticEnabled,
  setLanguage,
  setSoundEnabled,
  setTheme,
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
