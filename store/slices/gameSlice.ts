import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { GAME_CONFIG } from '@/constants/config';
import type { GameConfig, GameSession, Player, QuestionHistory } from '@/types/game';
import type { Question, QuestionType } from '@/types/question';

export interface GameState {
  allQuestions: Question[];
  session: GameSession | null;
  history: QuestionHistory[];
  isActive: boolean;
}

const initialState: GameState = {
  allQuestions: [],
  session: null,
  history: [],
  isActive: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /** Load the bundled question database once at app boot. */
    loadQuestions(state, action: PayloadAction<Question[]>) {
      state.allQuestions = action.payload;
    },

    /**
     * Start a game. The pool is pre-built and pre-shuffled by the hook
     * (useGame.start) so this reducer stays pure and fast.
     */
    startGame(
      state,
      action: PayloadAction<{
        config: GameConfig;
        players: Player[];
        questionPool: Question[];
      }>,
    ) {
      const { config, players, questionPool } = action.payload;
      state.session = {
        id: `game_${Date.now()}`,
        players: players.map((p) => ({
          ...p,
          score: 0,
          truthsCompleted: 0,
          daresCompleted: 0,
          skips: 0,
          streak: 0,
        })),
        currentPlayerIndex: 0,
        config,
        questionPool,
        currentQuestionIndex: 0,
        startedAtMs: Date.now(),
      };
      state.isActive = true;
      state.history = [];
    },

    /** Advance to the next question and rotate to the next player. */
    nextQuestion(state) {
      if (!state.session) return;
      state.session.currentQuestionIndex += 1;
      state.session.currentPlayerIndex =
        (state.session.currentPlayerIndex + 1) % state.session.players.length;
    },

    /** Record a completed question for the current player. */
    completeQuestion(state, action: PayloadAction<QuestionType>) {
      if (!state.session) return;
      const player = state.session.players[state.session.currentPlayerIndex];
      if (!player) return;

      if (action.payload === 'dare') {
        player.score += GAME_CONFIG.POINTS_DARE;
        player.daresCompleted += 1;
        player.streak += 1;
        if (
          player.streak > 0 &&
          player.streak % GAME_CONFIG.STREAK_BONUS_THRESHOLD === 0
        ) {
          player.score += GAME_CONFIG.STREAK_BONUS_POINTS;
        }
      } else {
        player.score += GAME_CONFIG.POINTS_TRUTH;
        player.truthsCompleted += 1;
        player.streak = 0;
      }

      const current = state.session.questionPool[state.session.currentQuestionIndex];
      if (current) {
        state.history.push({
          questionId: current.id,
          playerId: player.id,
          completed: true,
          skipped: false,
          timestampMs: Date.now(),
        });
      }
    },

    /** Record a skipped question; applies point penalty and resets streak. */
    skipQuestion(state) {
      if (!state.session) return;
      const player = state.session.players[state.session.currentPlayerIndex];
      if (!player) return;

      player.score += GAME_CONFIG.POINTS_SKIP;
      player.skips += 1;
      player.streak = 0;

      const current = state.session.questionPool[state.session.currentQuestionIndex];
      if (current) {
        state.history.push({
          questionId: current.id,
          playerId: player.id,
          completed: false,
          skipped: true,
          timestampMs: Date.now(),
        });
      }
    },

    /** Mark the game over but keep session + history for results screen. */
    endGame(state) {
      state.isActive = false;
    },

    /** Full reset — clears the session and history (used by Play Again). */
    resetGame(state) {
      state.session = null;
      state.history = [];
      state.isActive = false;
    },
  },
});

export const {
  loadQuestions,
  startGame,
  nextQuestion,
  completeQuestion,
  skipQuestion,
  endGame,
  resetGame,
} = gameSlice.actions;
export default gameSlice.reducer;
