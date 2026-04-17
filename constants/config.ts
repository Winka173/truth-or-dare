import type { AgeGroup, LanguageCode, Mood, PackId } from '@/types/question';

export const GAME_CONFIG = {
  MAX_PLAYERS: 8,
  RECENT_IDS_LIMIT: 20,
  DEFAULT_AGE_GROUP: 'teens' as AgeGroup,
  DEFAULT_MOOD: 'party' as Mood,
  DEFAULT_LANGUAGE: 'en' as LanguageCode,
  DEFAULT_TIMER: 0 as const,
  DEFAULT_QUESTIONS_PER_ROUND: 10 as const,
  STREAK_BONUS_THRESHOLD: 3,
  STREAK_BONUS_POINTS: 1,
  POINTS_DARE: 2,
  POINTS_TRUTH: 1,
  POINTS_SKIP: -1,
} as const;

export const TIMER_DURATIONS = [0, 30, 60, 90] as const;

export const QUESTIONS_PER_ROUND_OPTIONS = [5, 10, 15, 20, 'unlimited'] as const;

export interface PackConfigEntry {
  price: number;
  productId: string;
  label: string;
  description: string;
}

export const PACK_CONFIG: Record<Exclude<PackId, 'base'>, PackConfigEntry> = {
  couples: {
    price: 1.99,
    productId: 'com.winka.truthordare.pack_couples',
    label: 'Couples Edition',
    description: 'Questions designed for romantic partners.',
  },
  adult_life: {
    price: 1.99,
    productId: 'com.winka.truthordare.pack_adult_life',
    label: 'Adult Life',
    description: 'Career, money, and the grown-up stuff.',
  },
  deep_dive: {
    price: 1.99,
    productId: 'com.winka.truthordare.pack_deep_dive',
    label: 'Deep Dive',
    description: 'Confessions, dreams vs reality, escalating series.',
  },
  adult_18: {
    price: 2.99,
    productId: 'com.winka.truthordare.pack_adult_18',
    label: 'Adults Only',
    description: 'Mature content — 18+ only. 5 explicit categories.',
  },
  all_packs: {
    price: 5.99,
    productId: 'com.winka.truthordare.pack_all',
    label: 'Everything Bundle',
    description: 'Unlock all 4 premium packs at a discount.',
  },
};

export const AGE_INCLUDES: Record<AgeGroup, AgeGroup[]> = {
  kids: ['kids'],
  teens: ['kids', 'teens'],
  young_adult: ['kids', 'teens', 'young_adult'],
  adult: ['kids', 'teens', 'young_adult', 'adult'],
  '18plus': ['kids', 'teens', 'young_adult', 'adult', '18plus'],
};

export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = [
  'en',
  'es',
  'zh',
  'hi',
  'ar',
  'pt',
  'fr',
  'id',
  'vi',
  'ja',
  'de',
] as const;

export const APP_VERSION = '0.1.0';
export const QUESTION_DB_VERSION = '5.0.0';
