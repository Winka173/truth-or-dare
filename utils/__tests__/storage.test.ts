import { __resetMockStorage } from '@/__mocks__/react-native-mmkv';
import { __clearAllStorage, storageApi } from '@/utils/storage';

beforeEach(() => {
  __resetMockStorage();
});

describe('storageApi — settings round-trip', () => {
  it('persists and loads a full settings object', () => {
    storageApi.saveSettings({
      soundEnabled: false,
      hapticEnabled: true,
      defaultAgeGroup: 'adult',
      defaultMood: 'chill',
      language: 'es',
      theme: 'dark',
    });
    const loaded = storageApi.loadSettings();
    expect(loaded).toMatchObject({
      soundEnabled: false,
      language: 'es',
      defaultAgeGroup: 'adult',
      theme: 'dark',
    });
  });

  it('returns null when settings are absent', () => {
    expect(storageApi.loadSettings()).toBeNull();
  });
});

describe('storageApi — unlocked packs', () => {
  it('defaults to empty array when nothing stored', () => {
    expect(storageApi.loadUnlockedPacks()).toEqual([]);
  });

  it('round-trips pack ids', () => {
    storageApi.saveUnlockedPacks(['couples', 'adult_18']);
    expect(storageApi.loadUnlockedPacks()).toEqual(['couples', 'adult_18']);
  });
});

describe('storageApi — recent ids', () => {
  it('defaults to empty array', () => {
    expect(storageApi.loadRecentIds()).toEqual([]);
  });

  it('round-trips ids in order', () => {
    storageApi.saveRecentIds(['q1', 'q2', 'q3']);
    expect(storageApi.loadRecentIds()).toEqual(['q1', 'q2', 'q3']);
  });
});

describe('storageApi — last players', () => {
  it('round-trips player names', () => {
    storageApi.saveLastPlayers(['Alex', 'Sam', 'Jordan']);
    expect(storageApi.loadLastPlayers()).toEqual(['Alex', 'Sam', 'Jordan']);
  });
});

describe('storageApi — last config', () => {
  it('returns null when absent', () => {
    expect(storageApi.loadLastConfig()).toBeNull();
  });

  it('round-trips a GameConfig', () => {
    storageApi.saveLastConfig({
      ageGroup: 'teens',
      mood: 'party',
      categoryIds: ['friendship'],
      timer: 60,
      questionsPerRound: 10,
      allowSkips: true,
      typeFilter: 'both',
    });
    const loaded = storageApi.loadLastConfig();
    expect(loaded?.ageGroup).toBe('teens');
    expect(loaded?.timer).toBe(60);
    expect(loaded?.categoryIds).toEqual(['friendship']);
  });
});

describe('storageApi — error swallowing', () => {
  it('save never throws even on invalid input', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => storageApi.saveSettings(circular as never)).not.toThrow();
  });
});

describe('__clearAllStorage', () => {
  it('wipes every key', () => {
    storageApi.saveSettings({
      soundEnabled: true,
      hapticEnabled: true,
      defaultAgeGroup: 'teens',
      defaultMood: 'party',
      language: 'en',
      theme: 'system',
    });
    storageApi.saveUnlockedPacks(['couples']);
    __clearAllStorage();
    expect(storageApi.loadSettings()).toBeNull();
    expect(storageApi.loadUnlockedPacks()).toEqual([]);
  });
});
