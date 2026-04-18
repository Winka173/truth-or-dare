import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { GameConfig } from '@/types/game';
import type { PackId } from '@/types/question';
import type { SettingsState } from '@/store/slices/settingsSlice';

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) _storage = createMMKV({ id: 'truthordare.default' });
  return _storage;
}

const KEYS = {
  settings: 'settings',
  unlockedPacks: 'unlocked_packs',
  recentQuestionIds: 'recent_question_ids',
  lastPlayers: 'last_players',
  lastGameConfig: 'last_game_config',
  favoriteIds: 'favorite_ids',
} as const;

function getJSON<T>(key: string): T | null {
  try {
    const raw = getStorage().getString(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setJSON(key: string, value: unknown): void {
  try {
    getStorage().set(key, JSON.stringify(value));
  } catch {
    /* offline-first: never crash on write */
  }
}

export const storageApi = {
  loadSettings: (): Partial<SettingsState> | null => getJSON<Partial<SettingsState>>(KEYS.settings),
  saveSettings: (s: Partial<SettingsState>): void => {
    const prev = getJSON<Partial<SettingsState>>(KEYS.settings) ?? {};
    setJSON(KEYS.settings, { ...prev, ...s });
  },
  loadUnlockedPacks: (): PackId[] => getJSON<PackId[]>(KEYS.unlockedPacks) ?? [],
  saveUnlockedPacks: (packs: readonly PackId[]): void => setJSON(KEYS.unlockedPacks, packs),
  loadRecentIds: (): string[] => getJSON<string[]>(KEYS.recentQuestionIds) ?? [],
  saveRecentIds: (ids: readonly string[]): void => setJSON(KEYS.recentQuestionIds, ids),
  loadLastPlayers: (): string[] => getJSON<string[]>(KEYS.lastPlayers) ?? [],
  saveLastPlayers: (names: readonly string[]): void => setJSON(KEYS.lastPlayers, names),
  loadLastConfig: (): GameConfig | null => getJSON<GameConfig>(KEYS.lastGameConfig),
  saveLastConfig: (config: GameConfig): void => setJSON(KEYS.lastGameConfig, config),

  loadFavoriteIds: (): string[] => getJSON<string[]>(KEYS.favoriteIds) ?? [],
  saveFavoriteIds: (ids: readonly string[]): void => setJSON(KEYS.favoriteIds, ids),
};

export function __clearAllStorage(): void {
  try {
    getStorage().clearAll();
  } catch {
    /* ignore */
  }
}
