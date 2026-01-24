import { describe, it, expect, beforeEach } from 'vitest';
import { deduplicatedFetch, getInflightCount, clearInflight } from '@/lib/deduplicator';

describe('deduplicator', () => {
  beforeEach(() => {
    clearInflight();
  });

  it('deduplicates concurrent requests with same key', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return new Promise<string>(resolve => setTimeout(() => resolve('result'), 10));
    };

    const [r1, r2, r3] = await Promise.all([
      deduplicatedFetch('key1', fetcher),
      deduplicatedFetch('key1', fetcher),
      deduplicatedFetch('key1', fetcher),
    ]);

    expect(callCount).toBe(1);
    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(r3).toBe('result');
  });

  it('allows different keys to run independently', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return Promise.resolve('result');
    };

    await Promise.all([
      deduplicatedFetch('key1', fetcher),
      deduplicatedFetch('key2', fetcher),
    ]);

    expect(callCount).toBe(2);
  });

  it('cleans up after promise resolves', async () => {
    await deduplicatedFetch('key1', () => Promise.resolve('done'));
    expect(getInflightCount()).toBe(0);
  });

  it('cleans up after promise rejects', async () => {
    try {
      await deduplicatedFetch('key1', () => Promise.reject(new Error('fail')));
    } catch {
      // expected
    }
    expect(getInflightCount()).toBe(0);
  });

  it('allows new request after previous completes', async () => {
    let callCount = 0;
    const fetcher = () => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    };

    const r1 = await deduplicatedFetch('key1', fetcher);
    const r2 = await deduplicatedFetch('key1', fetcher);

    expect(callCount).toBe(2);
    expect(r1).toBe('result-1');
    expect(r2).toBe('result-2');
  });

  it('propagates errors to all waiters', async () => {
    const fetcher = () => Promise.reject(new Error('network error'));

    const results = await Promise.allSettled([
      deduplicatedFetch('key1', fetcher),
      deduplicatedFetch('key1', fetcher),
    ]);

    expect(results[0].status).toBe('rejected');
    expect(results[1].status).toBe('rejected');
  });

  it('tracks inflight count correctly', async () => {
    let resolve1: (v: string) => void;
    let resolve2: (v: string) => void;
    const p1 = new Promise<string>(r => { resolve1 = r; });
    const p2 = new Promise<string>(r => { resolve2 = r; });

    const f1 = deduplicatedFetch('key1', () => p1);
    const f2 = deduplicatedFetch('key2', () => p2);

    expect(getInflightCount()).toBe(2);

    resolve1!('done');
    await f1;
    expect(getInflightCount()).toBe(1);

    resolve2!('done');
    await f2;
    expect(getInflightCount()).toBe(0);
  });
});
