export type AgeGroup = 'kids' | 'teens' | 'young_adult' | 'adult' | '18plus';

export type Mood = 'party' | 'intimate' | 'chill' | 'icebreaker';

export type GroupSize = 'solo' | 'pair' | 'group';

export type QuestionType = 'truth' | 'dare';

export type Tag = 'funny' | 'deep' | 'cringe' | 'wholesome' | 'romantic';

export type LanguageCode =
  | 'en'
  | 'es'
  | 'zh'
  | 'hi'
  | 'ar'
  | 'pt'
  | 'fr'
  | 'id'
  | 'vi'
  | 'ja'
  | 'de';

export type PackId =
  | 'base'
  | 'couples'
  | 'adult_life'
  | 'deep_dive'
  | 'adult_18'
  | 'all_packs';

export type RelationshipType =
  | 'new_friends'
  | 'close_friends'
  | 'couple'
  | 'family'
  | 'coworkers'
  | 'party'
  | 'intimate';

export type Seasonal = 'none' | 'christmas' | 'halloween' | 'valentines' | 'new_year' | 'summer';

export type Intensity = 1 | 2 | 3 | 4 | 5;

export type EscalationLevel = 1 | 2 | 3 | 4 | 5;

export interface QuestionAnalytics {
  times_played: number;
  times_skipped: number;
  times_completed: number;
  avg_reaction: number | null;
  skip_rate: number | null;
  completion_rate: number | null;
}

export interface Question {
  id: string;
  type: QuestionType;
  age_group: AgeGroup;
  text: string;
  tags: Tag[];
  sub_tags: string[];
  group_size: GroupSize;
  intensity: Intensity;
  duration_seconds: number | null;
  seasonal: Seasonal;
  flagged: boolean;
  community_submitted?: boolean;
  mood: Mood;
  props: string[];
  relationship_type: RelationshipType[];
  chain: boolean;
  chain_prompt: string | null;
  hot_seat: boolean;
  escalation_level: EscalationLevel | null;
  screenshot_moment: boolean;
  reaction_prompt: string | null;
  follow_up_question: string;
  related_questions: string[];
  bundle_id: string | null;
  translations: Partial<Record<LanguageCode, string>>;
  analytics: QuestionAnalytics;
}

export interface CategoryPack {
  is_premium: boolean;
  pack_id: PackId;
  unlock_price_usd: number | null;
  recommended_group_size: [number, number];
  recommended_duration_minutes: number;
  best_for: string[];
}

export interface RawCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  explicit: boolean;
  pack: CategoryPack;
  questions: Question[];
}

export interface QuestionDatabase {
  meta: {
    version: string;
    total_questions: number;
    total_categories: number;
    languages: LanguageCode[];
  };
  age_groups: Record<AgeGroup, { label: string; min_age: number; max_age: number | null }>;
  seasonal_packs: Array<{ id: string; label: string }>;
  categories: RawCategory[];
}
