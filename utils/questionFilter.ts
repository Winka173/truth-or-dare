import { CATEGORY_BY_ID } from '@/constants/categories';
import { AGE_INCLUDES } from '@/constants/config';
import type { GameConfig } from '@/types/game';
import type { AgeGroup, LanguageCode, PackId, Question } from '@/types/question';

export function matchesAgeGroup(questionAge: AgeGroup, selectedAge: AgeGroup): boolean {
  return AGE_INCLUDES[selectedAge].includes(questionAge);
}

export function isCategoryAccessible(
  categoryId: string,
  unlockedPacks: readonly PackId[],
): boolean {
  const cat = CATEGORY_BY_ID[categoryId];
  if (!cat) return false;
  if (cat.packId === null) return true;
  return unlockedPacks.includes(cat.packId);
}

export function buildQuestionPool(
  allQuestions: readonly Question[],
  config: GameConfig,
  unlockedPacks: readonly PackId[],
): Question[] {
  return allQuestions.filter((q) => {
    if (!matchesAgeGroup(q.age_group, config.ageGroup)) return false;
    if (config.mood && q.mood !== config.mood) return false;
    if (q.flagged) return false;
    if (!isCategoryAccessible(q.category_id, unlockedPacks)) return false;
    if (config.typeFilter !== 'both' && q.type !== config.typeFilter) return false;
    if (config.categoryIds !== 'all' && !config.categoryIds.includes(q.category_id)) return false;
    return true;
  });
}

export function getTranslatedText(question: Question, lang: LanguageCode): string {
  if (lang === 'en') return question.text;
  return question.translations[lang] ?? question.text;
}

export function applyChainPrompt(chainPrompt: string, playerName: string): string {
  return chainPrompt.replace(/\{player\}/g, playerName);
}
