import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameSession, QuestionHistory } from '@/types/game';
import type { Question } from '@/types/question';

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
    loadQuestions(state, action: PayloadAction<Question[]>) {
      state.allQuestions = action.payload;
    },
  },
});

export const { loadQuestions } = gameSlice.actions;
export default gameSlice.reducer;
