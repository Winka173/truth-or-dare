import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggle as toggleAction } from '@/store/slices/favoritesSlice';
import { storageApi } from '@/utils/storage';

/**
 * Favorite-question hook. Star/unstar a question by ID.
 * Redux is the source of truth; MMKV is synced on every toggle so
 * the star survives restarts.
 */
export function useFavorites() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector((s) => s.favorites.ids);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      dispatch(toggleAction(id));
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      storageApi.saveFavoriteIds(next);
    },
    [dispatch, ids],
  );

  return { ids, isFavorite, toggle };
}
