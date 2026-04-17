import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = {
  ids: [],
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    /** Replace the full list — used at boot hydration from MMKV. */
    hydrate(state, action: PayloadAction<string[]>) {
      state.ids = action.payload;
    },
    /** Star a question (idempotent). */
    add(state, action: PayloadAction<string>) {
      if (!state.ids.includes(action.payload)) state.ids.push(action.payload);
    },
    /** Remove a star (no-op if not present). */
    remove(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    /** Star ↔ unstar. */
    toggle(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
      } else {
        state.ids.push(id);
      }
    },
    /** Wipe all favorites. */
    clear(state) {
      state.ids = [];
    },
  },
});

export const { hydrate, add, remove, toggle, clear } = favoritesSlice.actions;
export default favoritesSlice.reducer;
