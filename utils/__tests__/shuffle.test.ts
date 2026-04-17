import { fisherYates, preparePool, pushRecentId } from '@/utils/shuffle';

describe('fisherYates', () => {
  it('returns a new array without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    fisherYates(input);
    expect(input).toEqual(snapshot);
  });

  it('preserves every element (same multiset)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = fisherYates(input);
    expect([...shuffled].sort()).toEqual([...input].sort());
  });

  it('handles the empty array', () => {
    expect(fisherYates([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(fisherYates([42])).toEqual([42]);
  });

  it('produces different orderings on repeated runs for a large enough input', () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const a = fisherYates(input).join(',');
    const b = fisherYates(input).join(',');
    const c = fisherYates(input).join(',');
    expect(a === b && b === c).toBe(false);
  });
});

describe('preparePool', () => {
  const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `q${i}` }));

  it('excludes recent ids when the deduped pool is large enough', () => {
    const pool = mk(20);
    const result = preparePool(pool, ['q0', 'q1', 'q2']);
    const ids = result.map((q) => q.id);
    expect(ids).not.toContain('q0');
    expect(ids).not.toContain('q1');
    expect(ids).not.toContain('q2');
    expect(result).toHaveLength(17);
  });

  it('falls back to the full pool when dedup leaves < 10 items', () => {
    const pool = mk(8);
    const recent = pool.slice(0, 5).map((q) => q.id);
    const result = preparePool(pool, recent);
    expect(result).toHaveLength(8);
  });

  it('honors a custom minPoolSize threshold', () => {
    const pool = mk(8);
    const result = preparePool(pool, ['q0', 'q1'], 5);
    expect(result).toHaveLength(6);
  });

  it('returns a shuffled copy, not reference-equal', () => {
    const pool = mk(25);
    const result = preparePool(pool, []);
    expect(result).not.toBe(pool);
    expect(result).toHaveLength(25);
  });
});

describe('pushRecentId', () => {
  it('prepends new ID and trims to the 20-item limit', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `q${i}`);
    const next = pushRecentId(ids, 'fresh');
    expect(next[0]).toBe('fresh');
    expect(next).toHaveLength(20);
    expect(next).not.toContain('q19');
  });

  it('moves an existing ID to the front without duplicating it', () => {
    const ids = ['q1', 'q2', 'q3'];
    const next = pushRecentId(ids, 'q2');
    expect(next).toEqual(['q2', 'q1', 'q3']);
  });
});
