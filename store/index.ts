import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import settingsReducer from './slices/settingsSlice';
import packsReducer from './slices/packsSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer,
    packs: packsReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { warnAfter: 128 },
    }),
});
