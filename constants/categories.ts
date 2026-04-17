import type { PackId } from '@/types/question';

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  packId: Exclude<PackId, 'base' | 'all_packs'> | null;
  explicit: boolean;
}

/**
 * All 32 categories from data/TruthDare_DataSchema.md §4.
 *
 * `packId: null` means free (base pack). Otherwise the category
 * is unlocked by the named IAP pack.
 *
 * Colors are a 32-tone palette designed to harmonize with the
 * Midnight Revel theme (see constants/theme.ts). 18+ categories
 * use deeper reds/maroons signaling mature content.
 */
export const CATEGORIES: readonly CategoryConfig[] = [
  { id: 'friendship',                label: 'Friendship',             icon: '👫', color: '#FF6C93', packId: null,        explicit: false },
  { id: 'romance',                   label: 'Romance',                icon: '💕', color: '#FE1874', packId: null,        explicit: false },
  { id: 'embarrassing',              label: 'Embarrassing Moments',   icon: '😳', color: '#FFA9BB', packId: null,        explicit: false },
  { id: 'family',                    label: 'Family',                 icon: '👨‍👩‍👧‍👦', color: '#FF93AB', packId: null,        explicit: false },
  { id: 'school_work',               label: 'School & Work',          icon: '📚', color: '#D97DFF', packId: null,        explicit: false },
  { id: 'fears',                     label: 'Fears & Phobias',        icon: '😱', color: '#8930B0', packId: null,        explicit: false },
  { id: 'social_media',              label: 'Social Media',           icon: '📱', color: '#EBB2FF', packId: null,        explicit: false },
  { id: 'deep_thoughts',             label: 'Deep Thoughts',          icon: '🧠', color: '#81ECFF', packId: null,        explicit: false },
  { id: 'would_you_rather',          label: 'Would You Rather',       icon: '🤔', color: '#00E3FD', packId: null,        explicit: false },
  { id: 'couples_edition',           label: 'Couples Edition',        icon: '💑', color: '#EF476F', packId: 'couples',    explicit: false },
  { id: 'zodiac_personality',        label: 'Zodiac & Personality',   icon: '♊', color: '#F2C5FF', packId: null,        explicit: false },
  { id: 'body_language_dares',       label: 'Body Language Dares',    icon: '🕺', color: '#F8D8FF', packId: null,        explicit: false },
  { id: 'wild_card',                 label: 'Wild Card',              icon: '🃏', color: '#FFD166', packId: null,        explicit: false },
  { id: 'hot_takes',                 label: 'Hot Takes',              icon: '🔥', color: '#FB5012', packId: null,        explicit: false },
  { id: 'never_have_i_ever',         label: 'Never Have I Ever',      icon: '🙈', color: '#A8DADC', packId: null,        explicit: false },
  { id: 'music_vibes',               label: 'Music & Vibes',          icon: '🎵', color: '#00D4EC', packId: null,        explicit: false },
  { id: 'relationships_18plus',      label: 'Spicy Relationships',    icon: '🌶️', color: '#D00000', packId: 'adult_18',   explicit: true  },
  { id: 'after_dark_18plus',         label: 'After Dark Dares',       icon: '🌙', color: '#370617', packId: 'adult_18',   explicit: true  },
  { id: 'dark_secrets_18plus',       label: 'Dark Secrets',           icon: '🔒', color: '#6A040F', packId: 'adult_18',   explicit: true  },
  { id: 'culture_travel',            label: 'Culture & Travel',       icon: '🌍', color: '#52B788', packId: null,        explicit: false },
  { id: 'gaming_tech',               label: 'Gaming & Tech',          icon: '🎮', color: '#6C63FF', packId: null,        explicit: false },
  { id: 'work_career',               label: 'Work & Career',          icon: '💼', color: '#7209B7', packId: 'adult_life', explicit: false },
  { id: 'roleplay_act',              label: 'Roleplay & Act It Out',  icon: '🎭', color: '#FF9F1C', packId: null,        explicit: false },
  { id: 'first_impressions',         label: 'First Impressions',      icon: '👁️', color: '#B5179E', packId: null,        explicit: false },
  { id: 'money_status',              label: 'Money & Status',         icon: '💰', color: '#FFD60A', packId: 'adult_life', explicit: false },
  { id: 'unpopular_opinions',        label: 'Unpopular Opinions',     icon: '🔥', color: '#F06292', packId: null,        explicit: false },
  { id: 'dream_vs_reality',          label: 'Dream vs Reality',       icon: '🌙', color: '#06AED5', packId: 'deep_dive',  explicit: false },
  { id: 'confessions_lite',          label: 'Confessions',            icon: '🤫', color: '#4361EE', packId: 'deep_dive',  explicit: false },
  { id: 'chemistry_attraction_18plus', label: 'Chemistry & Attraction', icon: '🧲', color: '#9D0208', packId: 'adult_18', explicit: true  },
  { id: 'desire_honesty_18plus',     label: 'Desire & Honesty',       icon: '💋', color: '#DC2F02', packId: 'adult_18',   explicit: true  },
  { id: 'chain_mode',                label: 'Chain Reactions',        icon: '🔗', color: '#3A86FF', packId: null,        explicit: false },
  { id: 'escalating_mode',           label: 'Escalating Series',      icon: '📈', color: '#F72585', packId: 'deep_dive',  explicit: false },
] as const;

export const CATEGORY_BY_ID: Readonly<Record<string, CategoryConfig>> = Object.freeze(
  CATEGORIES.reduce<Record<string, CategoryConfig>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {}),
);
