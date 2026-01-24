import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSetCards, searchCards } from '@/lib/scryfall';
import { clearInflight } from '@/lib/deduplicator';

describe('scryfall error handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.advanceTimersByTime(120000);
    clearInflight();
  });

  afterEach(() => {
    clearInflight();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('throws timeout error when request aborts', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    const promise = searchCards('AbortTest');
    const assertion = expect(promise).rejects.toThrow('Request timed out');
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('throws service unavailable on 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    }));

    const promise = searchCards('ServiceDown');
    const assertion = expect(promise).rejects.toThrow('Scryfall is temporarily unavailable');
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('maps AbortError to user-friendly timeout message', async () => {
    const error = new Error('AbortError');
    error.name = 'AbortError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const promise = searchCards('TimeoutCard');
    const assertion = expect(promise).rejects.toThrow('Request timed out. Please try again.');
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('retries on 429 with exponential backoff', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' })
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: [], has_more: false }) });
    vi.stubGlobal('fetch', fetchMock);

    const promise = loadSetCards('ret');
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 15000);

  // This test must be last - persistent 429 mock leaves module-level state dirty
  it('throws after max retries on persistent 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    }));

    const promise = loadSetCards('exh');
    const assertion = expect(promise).rejects.toThrow('Scryfall API Error: 429');
    await vi.advanceTimersByTimeAsync(60000);
    await assertion;
  }, 15000);
});
