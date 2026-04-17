import packsReducer, {
  hydrate,
  restore,
  setIapStatus,
  unlock,
} from '@/store/slices/packsSlice';
import type { PackState } from '@/types/game';

const empty: PackState = {
  unlockedPackIds: [],
  iapStatus: 'idle',
};

describe('packsSlice — hydrate', () => {
  it('replaces unlockedPackIds', () => {
    const state = packsReducer(empty, hydrate(['couples']));
    expect(state.unlockedPackIds).toEqual(['couples']);
  });

  it('overwrites any existing unlocks', () => {
    const withExisting: PackState = { ...empty, unlockedPackIds: ['adult_18'] };
    const state = packsReducer(withExisting, hydrate(['couples']));
    expect(state.unlockedPackIds).toEqual(['couples']);
  });
});

describe('packsSlice — setIapStatus', () => {
  it.each(['idle', 'loading', 'success', 'error'] as const)('sets status to %s', (status) => {
    const state = packsReducer(empty, setIapStatus(status));
    expect(state.iapStatus).toBe(status);
  });
});

describe('packsSlice — unlock', () => {
  it('appends a single pack id', () => {
    const state = packsReducer(empty, unlock('couples'));
    expect(state.unlockedPackIds).toEqual(['couples']);
  });

  it('is idempotent — does not duplicate an already-unlocked pack', () => {
    const first = packsReducer(empty, unlock('couples'));
    const second = packsReducer(first, unlock('couples'));
    expect(second.unlockedPackIds).toEqual(['couples']);
  });

  it('all_packs bundle unlocks all 4 individual packs', () => {
    const state = packsReducer(empty, unlock('all_packs'));
    expect(state.unlockedPackIds).toContain('all_packs');
    expect(state.unlockedPackIds).toContain('couples');
    expect(state.unlockedPackIds).toContain('adult_life');
    expect(state.unlockedPackIds).toContain('deep_dive');
    expect(state.unlockedPackIds).toContain('adult_18');
    expect(state.unlockedPackIds).toHaveLength(5);
  });

  it('all_packs does not re-add packs that are already unlocked', () => {
    let state = packsReducer(empty, unlock('couples'));
    state = packsReducer(state, unlock('all_packs'));
    expect(state.unlockedPackIds.filter((p) => p === 'couples')).toHaveLength(1);
    expect(state.unlockedPackIds).toHaveLength(5);
  });
});

describe('packsSlice — restore', () => {
  it('merges restored ids with existing unlocks without duplicates', () => {
    const start: PackState = { ...empty, unlockedPackIds: ['couples'] };
    const state = packsReducer(start, restore(['adult_18', 'couples']));
    expect(state.unlockedPackIds).toContain('couples');
    expect(state.unlockedPackIds).toContain('adult_18');
    expect(state.unlockedPackIds.filter((p) => p === 'couples')).toHaveLength(1);
  });

  it('restore on empty state adds the provided packs', () => {
    const state = packsReducer(empty, restore(['deep_dive', 'adult_life']));
    expect([...state.unlockedPackIds].sort()).toEqual(['adult_life', 'deep_dive']);
  });

  it('restore with empty array is a no-op', () => {
    const start: PackState = { ...empty, unlockedPackIds: ['couples'] };
    const state = packsReducer(start, restore([]));
    expect(state.unlockedPackIds).toEqual(['couples']);
  });
});
