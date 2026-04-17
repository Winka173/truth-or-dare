import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IapStatus, PackState } from '@/types/game';
import type { PackId } from '@/types/question';

const INDIVIDUAL_PACKS: readonly PackId[] = ['couples', 'adult_life', 'deep_dive', 'adult_18'];

const initialState: PackState = {
  unlockedPackIds: [],
  iapStatus: 'idle',
};

export const packsSlice = createSlice({
  name: 'packs',
  initialState,
  reducers: {
    /** Replace the whole unlocked-pack list — used at boot hydration. */
    hydrate(state, action: PayloadAction<PackId[]>) {
      state.unlockedPackIds = action.payload;
    },
    setIapStatus(state, action: PayloadAction<IapStatus>) {
      state.iapStatus = action.payload;
    },
    /**
     * Unlock a single pack. If `all_packs` is purchased, unlocks the 4
     * individual packs as well so category-accessibility checks work
     * without special-casing the bundle.
     */
    unlock(state, action: PayloadAction<PackId>) {
      const id = action.payload;
      if (!state.unlockedPackIds.includes(id)) {
        state.unlockedPackIds.push(id);
      }
      if (id === 'all_packs') {
        for (const p of INDIVIDUAL_PACKS) {
          if (!state.unlockedPackIds.includes(p)) state.unlockedPackIds.push(p);
        }
      }
    },
    /** Merge restored pack ids (e.g., from IAP history) into the unlocked set. */
    restore(state, action: PayloadAction<PackId[]>) {
      const set = new Set(state.unlockedPackIds);
      for (const id of action.payload) set.add(id);
      state.unlockedPackIds = Array.from(set);
    },
  },
});

export const { hydrate, setIapStatus, unlock, restore } = packsSlice.actions;
export default packsSlice.reducer;
