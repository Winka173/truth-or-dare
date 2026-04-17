import { GAME_CONFIG } from '@/constants/config';

export function fisherYates<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function preparePool<T extends { id: string }>(
  pool: readonly T[],
  recentIds: readonly string[],
  minPoolSize = 10,
): T[] {
  const recentSet = new Set(recentIds);
  const deduped = pool.filter((q) => !recentSet.has(q.id));
  const source = deduped.length >= minPoolSize ? deduped : pool;
  return fisherYates(source);
}

export function pushRecentId(recentIds: readonly string[], newId: string): string[] {
  const next = [newId, ...recentIds.filter((id) => id !== newId)];
  return next.slice(0, GAME_CONFIG.RECENT_IDS_LIMIT);
}
