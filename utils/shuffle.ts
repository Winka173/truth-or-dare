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

/**
 * Order-preserving pool prep for the escalating_mode category.
 * Groups by `bundle_id` (each bundle is a narrative arc) and within
 * each bundle sorts by `escalation_level` ascending so the 1→5
 * progression is preserved. Unbundled escalating questions fall
 * through to a single group.
 */
export function prepareEscalatingPool<
  T extends { id: string; bundle_id: string | null; escalation_level: number | null },
>(pool: readonly T[]): T[] {
  const byBundle = new Map<string, T[]>();
  for (const q of pool) {
    const key = q.bundle_id ?? '__unbundled__';
    const arr = byBundle.get(key);
    if (arr) arr.push(q);
    else byBundle.set(key, [q]);
  }
  const result: T[] = [];
  for (const arr of byBundle.values()) {
    const sorted = [...arr].sort(
      (a, b) => (a.escalation_level ?? 0) - (b.escalation_level ?? 0),
    );
    result.push(...sorted);
  }
  return result;
}
