import {
  applyChainPrompt,
  buildQuestionPool,
  getTranslatedText,
  isCategoryAccessible,
  matchesAgeGroup,
} from '@/utils/questionFilter';
import type { GameConfig } from '@/types/game';
import type { Question } from '@/types/question';

const makeQuestion = (over: Partial<Question> = {}): Question => ({
  id: 'test_q_1',
  type: 'truth',
  age_group: 'teens',
  category_id: 'friendship',
  text: 'base text',
  tags: ['wholesome'],
  sub_tags: [],
  group_size: 'group',
  intensity: 1,
  duration_seconds: null,
  seasonal: 'none',
  flagged: false,
  mood: 'party',
  props: [],
  relationship_type: ['party'],
  chain: false,
  chain_prompt: null,
  hot_seat: false,
  escalation_level: null,
  screenshot_moment: false,
  reaction_prompt: null,
  follow_up_question: '',
  related_questions: [],
  bundle_id: null,
  translations: {},
  analytics: {
    times_played: 0,
    times_skipped: 0,
    times_completed: 0,
    avg_reaction: null,
    skip_rate: null,
    completion_rate: null,
  },
  ...over,
});

const baseConfig: GameConfig = {
  ageGroup: 'teens',
  mood: 'party',
  categoryIds: 'all',
  timer: 0,
  questionsPerRound: 10,
  allowSkips: true,
  typeFilter: 'both',
};

describe('matchesAgeGroup', () => {
  it('teens includes kids and teens but not young_adult', () => {
    expect(matchesAgeGroup('kids', 'teens')).toBe(true);
    expect(matchesAgeGroup('teens', 'teens')).toBe(true);
    expect(matchesAgeGroup('young_adult', 'teens')).toBe(false);
    expect(matchesAgeGroup('adult', 'teens')).toBe(false);
    expect(matchesAgeGroup('18plus', 'teens')).toBe(false);
  });

  it('18plus includes all age groups', () => {
    (['kids', 'teens', 'young_adult', 'adult', '18plus'] as const).forEach((age) =>
      expect(matchesAgeGroup(age, '18plus')).toBe(true),
    );
  });

  it('kids only matches kids', () => {
    expect(matchesAgeGroup('kids', 'kids')).toBe(true);
    expect(matchesAgeGroup('teens', 'kids')).toBe(false);
  });
});

describe('isCategoryAccessible', () => {
  it('free category is accessible with no unlocks', () => {
    expect(isCategoryAccessible('friendship', [])).toBe(true);
  });

  it('premium category is NOT accessible without its pack', () => {
    expect(isCategoryAccessible('couples_edition', [])).toBe(false);
    expect(isCategoryAccessible('couples_edition', ['adult_18'])).toBe(false);
  });

  it('premium category accessible once the right pack is unlocked', () => {
    expect(isCategoryAccessible('couples_edition', ['couples'])).toBe(true);
  });

  it('18+ category gated behind adult_18 pack', () => {
    expect(isCategoryAccessible('relationships_18plus', [])).toBe(false);
    expect(isCategoryAccessible('relationships_18plus', ['adult_18'])).toBe(true);
  });

  it('unknown category is never accessible', () => {
    expect(isCategoryAccessible('does_not_exist', ['couples', 'adult_18'])).toBe(false);
  });
});

describe('buildQuestionPool — core filters', () => {
  it('applies age group inheritance (adult includes kids/teens/young_adult/adult)', () => {
    const qs = [
      makeQuestion({ id: 'k', age_group: 'kids' }),
      makeQuestion({ id: 't', age_group: 'teens' }),
      makeQuestion({ id: 'y', age_group: 'young_adult' }),
      makeQuestion({ id: 'a', age_group: 'adult' }),
      makeQuestion({ id: '18', age_group: '18plus' }),
    ];
    const result = buildQuestionPool(qs, { ...baseConfig, ageGroup: 'adult' }, []);
    expect(result.map((q) => q.id).sort()).toEqual(['a', 'k', 't', 'y']);
  });

  it('applies mood filter', () => {
    const qs = [
      makeQuestion({ id: 'p', mood: 'party' }),
      makeQuestion({ id: 'i', mood: 'intimate' }),
    ];
    expect(buildQuestionPool(qs, { ...baseConfig, mood: 'party' }, [])).toHaveLength(1);
  });

  it('excludes flagged questions', () => {
    const qs = [
      makeQuestion({ id: 'ok', flagged: false }),
      makeQuestion({ id: 'bad', flagged: true }),
    ];
    expect(buildQuestionPool(qs, baseConfig, [])).toHaveLength(1);
  });

  it('excludes premium categories without the unlock', () => {
    const qs = [
      makeQuestion({ id: 'free', category_id: 'friendship' }),
      makeQuestion({ id: 'paid', category_id: 'couples_edition' }),
    ];
    expect(buildQuestionPool(qs, baseConfig, [])).toHaveLength(1);
    expect(buildQuestionPool(qs, baseConfig, ['couples'])).toHaveLength(2);
  });

  it('applies type filter', () => {
    const qs = [
      makeQuestion({ id: 't', type: 'truth' }),
      makeQuestion({ id: 'd', type: 'dare' }),
    ];
    expect(buildQuestionPool(qs, { ...baseConfig, typeFilter: 'dare' }, [])).toHaveLength(1);
  });

  it('applies specific category filter', () => {
    const qs = [
      makeQuestion({ id: 'a', category_id: 'friendship' }),
      makeQuestion({ id: 'b', category_id: 'romance' }),
    ];
    const result = buildQuestionPool(qs, { ...baseConfig, categoryIds: ['romance'] }, []);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('b');
  });

  it('18plus age selection with adult_18 unlocks explicit content', () => {
    const explicit = makeQuestion({
      id: 'ex',
      age_group: '18plus',
      category_id: 'relationships_18plus',
    });
    expect(
      buildQuestionPool([explicit], { ...baseConfig, ageGroup: '18plus' }, []),
    ).toHaveLength(0);
    expect(
      buildQuestionPool([explicit], { ...baseConfig, ageGroup: '18plus' }, ['adult_18']),
    ).toHaveLength(1);
  });
});

describe('getTranslatedText', () => {
  it('returns English base text when lang is en', () => {
    const q = makeQuestion({ text: 'hello', translations: { es: 'hola' } });
    expect(getTranslatedText(q, 'en')).toBe('hello');
  });

  it('returns translation when present', () => {
    const q = makeQuestion({ text: 'hello', translations: { es: 'hola' } });
    expect(getTranslatedText(q, 'es')).toBe('hola');
  });

  it('falls back to English when translation is missing', () => {
    const q = makeQuestion({ text: 'hello', translations: { es: 'hola' } });
    expect(getTranslatedText(q, 'ja')).toBe('hello');
  });
});

describe('applyChainPrompt', () => {
  it('substitutes {player} with player name (all occurrences)', () => {
    expect(applyChainPrompt('Based on {player}... what about {player}?', 'Alex')).toBe(
      'Based on Alex... what about Alex?',
    );
  });

  it('leaves strings without {player} unchanged', () => {
    expect(applyChainPrompt('No substitution needed', 'Alex')).toBe('No substitution needed');
  });
});
