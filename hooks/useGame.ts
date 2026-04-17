import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  completeQuestion,
  endGame,
  nextQuestion,
  resetGame,
  skipQuestion,
  startGame,
} from '@/store/slices/gameSlice';
import { buildQuestionPool } from '@/utils/questionFilter';
import { preparePool, pushRecentId } from '@/utils/shuffle';
import { storageApi } from '@/utils/storage';
import type { GameConfig, Player } from '@/types/game';
import type { QuestionType } from '@/types/question';

export function useGame() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.game.session);
  const isActive = useAppSelector((s) => s.game.isActive);
  const history = useAppSelector((s) => s.game.history);
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const unlockedPacks = useAppSelector((s) => s.packs.unlockedPackIds);

  const currentQuestion =
    session && session.questionPool[session.currentQuestionIndex]
      ? session.questionPool[session.currentQuestionIndex]
      : null;
  const currentPlayer =
    session && session.players[session.currentPlayerIndex]
      ? session.players[session.currentPlayerIndex]
      : null;

  const start = useCallback(
    (config: GameConfig, players: Player[]) => {
      const pool = buildQuestionPool(allQuestions, config, unlockedPacks);
      const recentIds = storageApi.loadRecentIds();
      const shuffled = preparePool(pool, recentIds);

      dispatch(startGame({ config, players, questionPool: shuffled }));

      storageApi.saveLastConfig(config);
      storageApi.saveLastPlayers(players.map((p) => p.name));
    },
    [dispatch, allQuestions, unlockedPacks],
  );

  const complete = useCallback(
    (type: QuestionType) => {
      if (currentQuestion) {
        const next = pushRecentId(storageApi.loadRecentIds(), currentQuestion.id);
        storageApi.saveRecentIds(next);
      }
      dispatch(completeQuestion(type));
    },
    [dispatch, currentQuestion],
  );

  const skip = useCallback(() => {
    if (currentQuestion) {
      const next = pushRecentId(storageApi.loadRecentIds(), currentQuestion.id);
      storageApi.saveRecentIds(next);
    }
    dispatch(skipQuestion());
  }, [dispatch, currentQuestion]);

  const next = useCallback(() => dispatch(nextQuestion()), [dispatch]);
  const end = useCallback(() => dispatch(endGame()), [dispatch]);
  const reset = useCallback(() => dispatch(resetGame()), [dispatch]);

  return {
    session,
    isActive,
    history,
    currentQuestion,
    currentPlayer,
    start,
    next,
    complete,
    skip,
    end,
    reset,
  };
}
