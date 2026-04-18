import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  completeQuestion,
  endGame,
  nextQuestion,
  resetGame,
  skipQuestion,
  startGame,
  undoLastTurn,
} from '@/store/slices/gameSlice';
import { setTtsEnabled } from '@/store/slices/settingsSlice';
import { buildQuestionPool } from '@/utils/questionFilter';
import { prepareEscalatingPool, preparePool, pushRecentId } from '@/utils/shuffle';
import { storageApi } from '@/utils/storage';
import type { GameConfig, Player } from '@/types/game';
import type { Question, QuestionType } from '@/types/question';

export function useGame() {
  const dispatch = useAppDispatch();
  const session = useAppSelector((s) => s.game.session);
  const isActive = useAppSelector((s) => s.game.isActive);
  const history = useAppSelector((s) => s.game.history);
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const customQuestions = useAppSelector((s) => s.game.customQuestions);
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
    (config: GameConfig, players: Player[], poolOverride?: Question[]) => {
      const recentIds = storageApi.loadRecentIds();

      let mergedPool: Question[];

      if (poolOverride) {
        // Bypass filtering and custom-question merge — use caller-supplied pool
        // as-is (e.g., Favorites viewer plays the starred set directly).
        mergedPool = poolOverride;
      } else {
        const basePool = buildQuestionPool(allQuestions, config, unlockedPacks);

        // Convert user-authored custom questions to the Question shape so they
        // mix into the session pool alongside bundled ones.
        const customQs: Question[] = customQuestions.map(
          (cq) =>
            ({
              id: cq.id,
              category_id: 'custom',
              type: cq.type,
              age_group: config.ageGroup,
              text: cq.text,
              tags: [],
              sub_tags: [],
              group_size: 'group',
              intensity: 3,
              duration_seconds: null,
              seasonal: 'none',
              flagged: false,
              community_submitted: true,
              mood: config.mood,
              props: [],
              relationship_type: [],
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
            } as Question),
        );

        mergedPool = [...basePool, ...customQs];
      }

      // Escalating series: preserve 1→5 ordering per bundle instead of shuffling
      const isEscalatingOnly =
        !poolOverride &&
        Array.isArray(config.categoryIds) &&
        config.categoryIds.length === 1 &&
        config.categoryIds[0] === 'escalating_mode';

      const ordered = isEscalatingOnly
        ? prepareEscalatingPool(mergedPool)
        : preparePool(mergedPool, recentIds);

      dispatch(startGame({ config, players, questionPool: ordered }));

      storageApi.saveLastConfig(config);
      storageApi.saveLastPlayers(players.map((p) => p.name));
    },
    [dispatch, allQuestions, customQuestions, unlockedPacks],
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
  const reset = useCallback(() => {
    dispatch(resetGame());
    dispatch(setTtsEnabled(true));
  }, [dispatch]);
  const undo = useCallback(() => dispatch(undoLastTurn()), [dispatch]);

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
    undo,
    end,
    reset,
  };
}
