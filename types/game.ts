import type { AgeGroup, Mood, PackId, Question, QuestionType } from './question';

export interface Player {
  id: string;
  name: string;
  score: number;
  truthsCompleted: number;
  daresCompleted: number;
  skips: number;
  streak: number;
}

export type TimerDuration = 0 | 30 | 60 | 90;

export type QuestionsPerRound = 5 | 10 | 15 | 20 | 'unlimited';

export type TypeFilter = 'both' | 'truth' | 'dare';

export interface GameConfig {
  ageGroup: AgeGroup;
  mood: Mood;
  categoryIds: string[] | 'all';
  timer: TimerDuration;
  questionsPerRound: QuestionsPerRound;
  allowSkips: boolean;
  typeFilter: TypeFilter;
}

export interface QuestionHistory {
  questionId: string;
  playerId: string;
  completed: boolean;
  skipped: boolean;
  timestampMs: number;
}

export interface GameSession {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  config: GameConfig;
  questionPool: Question[];
  currentQuestionIndex: number;
  startedAtMs: number;
}

export interface TurnResult {
  questionId: string;
  type: QuestionType;
  completed: boolean;
  skipped: boolean;
  scoreDelta: number;
}

export type IapStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PackState {
  unlockedPackIds: PackId[];
  iapStatus: IapStatus;
}
