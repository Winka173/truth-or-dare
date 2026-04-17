import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IapStatus, PackState } from '@/types/game';
import type { PackId } from '@/types/question';

const initialState: PackState = {
  unlockedPackIds: [],
  iapStatus: 'idle',
};

export const packsSlice = createSlice({
  name: 'packs',
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<PackId[]>) {
      state.unlockedPackIds = action.payload;
    },
    setIapStatus(state, action: PayloadAction<IapStatus>) {
      state.iapStatus = action.payload;
    },
  },
});

export const { hydrate, setIapStatus } = packsSlice.actions;
export default packsSlice.reducer;
