import gameReducer, {
  addCustomQuestion,
  clearCustomQuestions,
  completeQuestion,
  endGame,
  loadQuestions,
  nextQuestion,
  resetGame,
  skipQuestion,
  startGame,
  type GameState,
} from '@/store/slices/gameSlice';
import type { CustomQuestion, GameConfig, Player } from '@/types/game';
import type { Question } from '@/types/question';

const makeQuestion = (over: Partial<Question> = {}): Question => ({
  id: over.id ?? 'q_1',
  type: 'truth',
  age_group: 'teens',
  category_id: 'friendship',
  text: 'base',
  tags: [],
  sub_tags: [],
  group_size: 'group',
  intensity: 1,
  duration_seconds: null,
  seasonal: 'none',
  flagged: false,
  mood: 'party',
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
  ...over,
});

const makePlayer = (name: string): Player => ({
  id: `p_${name}`,
  name,
  score: 0,
  truthsCompleted: 0,
  daresCompleted: 0,
  skips: 0,
  streak: 0,
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

const initialState: GameState = {
  allQuestions: [],
  session: null,
  history: [],
  isActive: false,
};

describe('gameSlice — loadQuestions', () => {
  it('populates allQuestions', () => {
    const qs = [makeQuestion({ id: 'a' }), makeQuestion({ id: 'b' })];
    const state = gameReducer(initialState, loadQuestions(qs));
    expect(state.allQuestions).toHaveLength(2);
    expect(state.allQuestions[0]?.id).toBe('a');
  });
});

describe('gameSlice — startGame', () => {
  it('creates a session, sets isActive, clears history', () => {
    const pool = [makeQuestion({ id: '1' }), makeQuestion({ id: '2' })];
    const players = [makePlayer('Alex'), makePlayer('Sam')];
    const state = gameReducer(
      initialState,
      startGame({ config: baseConfig, players, questionPool: pool }),
    );
    expect(state.isActive).toBe(true);
    expect(state.session).not.toBeNull();
    expect(state.session?.players).toHaveLength(2);
    expect(state.session?.currentPlayerIndex).toBe(0);
    expect(state.session?.currentQuestionIndex).toBe(0);
    expect(state.session?.questionPool).toHaveLength(2);
    expect(state.history).toHaveLength(0);
  });

  it('resets incoming player stats to zero', () => {
    const pool = [makeQuestion({ id: '1' })];
    const dirty: Player = {
      ...makePlayer('Alex'),
      score: 100,
      daresCompleted: 5,
      streak: 3,
    };
    const state = gameReducer(
      initialState,
      startGame({ config: baseConfig, players: [dirty], questionPool: pool }),
    );
    expect(state.session?.players[0]?.score).toBe(0);
    expect(state.session?.players[0]?.daresCompleted).toBe(0);
    expect(state.session?.players[0]?.streak).toBe(0);
  });
});

describe('gameSlice — nextQuestion', () => {
  it('advances question index and rotates to next player', () => {
    const pool = [
      makeQuestion({ id: '1' }),
      makeQuestion({ id: '2' }),
      makeQuestion({ id: '3' }),
    ];
    const players = [makePlayer('A'), makePlayer('B')];
    let state = gameReducer(
      initialState,
      startGame({ config: baseConfig, players, questionPool: pool }),
    );
    state = gameReducer(state, nextQuestion());
    expect(state.session?.currentQuestionIndex).toBe(1);
    expect(state.session?.currentPlayerIndex).toBe(1);
    state = gameReducer(state, nextQuestion());
    expect(state.session?.currentQuestionIndex).toBe(2);
    expect(state.session?.currentPlayerIndex).toBe(0);
  });

  it('is a no-op when no session', () => {
    const state = gameReducer(initialState, nextQuestion());
    expect(state.session).toBeNull();
  });
});

describe('gameSlice — completeQuestion', () => {
  const setup = () =>
    gameReducer(
      initialState,
      startGame({
        config: baseConfig,
        players: [makePlayer('Alex')],
        questionPool: [makeQuestion({ id: '1' })],
      }),
    );

  it('truth: +1 score, +1 truthsCompleted, streak resets to 0', () => {
    let state = setup();
    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, completeQuestion('truth'));
    const p = state.session?.players[0];
    expect(p?.score).toBe(2 + 1);
    expect(p?.truthsCompleted).toBe(1);
    expect(p?.daresCompleted).toBe(1);
    expect(p?.streak).toBe(0);
  });

  it('dare: +2 score, +1 daresCompleted, +1 streak', () => {
    const state = gameReducer(setup(), completeQuestion('dare'));
    const p = state.session?.players[0];
    expect(p?.score).toBe(2);
    expect(p?.daresCompleted).toBe(1);
    expect(p?.streak).toBe(1);
  });

  it('streak bonus: +1 extra on every 3rd consecutive dare', () => {
    let state = setup();
    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, completeQuestion('dare'));
    expect(state.session?.players[0]?.streak).toBe(3);
    expect(state.session?.players[0]?.score).toBe(7);

    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, completeQuestion('dare'));
    expect(state.session?.players[0]?.score).toBe(14);
  });

  it('appends a completed entry to history', () => {
    const state = gameReducer(setup(), completeQuestion('truth'));
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({ completed: true, skipped: false });
    expect(state.history[0]?.questionId).toBe('1');
  });
});

describe('gameSlice — skipQuestion', () => {
  it('-1 score, +1 skips, streak resets to 0, history entry marked skipped', () => {
    const pool = [makeQuestion({ id: '1' })];
    let state = gameReducer(
      initialState,
      startGame({
        config: baseConfig,
        players: [makePlayer('Alex')],
        questionPool: pool,
      }),
    );
    state = gameReducer(state, completeQuestion('dare'));
    state = gameReducer(state, skipQuestion());

    const p = state.session?.players[0];
    expect(p?.score).toBe(2 - 1);
    expect(p?.skips).toBe(1);
    expect(p?.streak).toBe(0);
    expect(state.history).toHaveLength(2);
    expect(state.history[1]?.skipped).toBe(true);
    expect(state.history[1]?.completed).toBe(false);
  });
});

describe('gameSlice — endGame / resetGame', () => {
  const setup = () =>
    gameReducer(
      initialState,
      startGame({
        config: baseConfig,
        players: [makePlayer('A')],
        questionPool: [makeQuestion({ id: '1' })],
      }),
    );

  it('endGame: sets isActive false, keeps session for results', () => {
    const state = gameReducer(setup(), endGame());
    expect(state.isActive).toBe(false);
    expect(state.session).not.toBeNull();
  });

  it('resetGame: clears session, history, isActive', () => {
    let state = gameReducer(setup(), completeQuestion('truth'));
    state = gameReducer(state, resetGame());
    expect(state.session).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.isActive).toBe(false);
  });
});

describe('gameSlice — customQuestions', () => {
  it('initialises as empty array', () => {
    const state = gameReducer(undefined, { type: '@@INIT' });
    expect(state.customQuestions).toEqual([]);
  });

  it('addCustomQuestion appends a question', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Do a handstand', type: 'dare' };
    const state = gameReducer(undefined, addCustomQuestion(q));
    expect(state.customQuestions).toHaveLength(1);
    expect(state.customQuestions[0]).toEqual(q);
  });

  it('clearCustomQuestions empties the array', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Tell a secret', type: 'truth' };
    let state = gameReducer(undefined, addCustomQuestion(q));
    state = gameReducer(state, clearCustomQuestions());
    expect(state.customQuestions).toEqual([]);
  });

  it('resetGame also clears customQuestions', () => {
    const q: CustomQuestion = { id: 'custom_1', text: 'Tell a secret', type: 'truth' };
    let state = gameReducer(undefined, addCustomQuestion(q));
    state = gameReducer(state, resetGame());
    expect(state.customQuestions).toEqual([]);
  });
});
