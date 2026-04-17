import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { buildQuestionPool } from '@/utils/questionFilter';
import type { GameConfig } from '@/types/game';

export function useQuestions(config: GameConfig) {
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const unlockedPacks = useAppSelector((s) => s.packs.unlockedPackIds);

  return useMemo(
    () => buildQuestionPool(allQuestions, config, unlockedPacks),
    [allQuestions, config, unlockedPacks],
  );
}
