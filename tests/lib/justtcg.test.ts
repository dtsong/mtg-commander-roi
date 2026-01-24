import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchJustTCGCard, fetchJustTCGCards } from '@/lib/justtcg';

describe('justtcg', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Advance past any existing rate limit window from prior tests
    vi.advanceTimersByTime(120000);
    process.env.JUSTTCG_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete process.env.JUSTTCG_API_KEY;
  });

  describe('fetchJustTCGCard', () => {
    it('returns card data on success', async () => {
      const cardData = { name: 'Sol Ring', marketPrice: 3.5, prices: [] };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: cardData }),
      }));

      const promise = fetchJustTCGCard({ name: 'Sol Ring' });
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;
      expect(result).toEqual(cardData);
    });

    it('returns null on 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }));

      const promise = fetchJustTCGCard({ name: 'Nonexistent' });
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;
      expect(result).toBeNull();
    });

    it('retries on 429 with exponential backoff', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 429 })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: { name: 'Sol Ring', prices: [] } }) });
      vi.stubGlobal('fetch', fetchMock);

      const promise = fetchJustTCGCard({ name: 'Sol Ring' });
      await vi.advanceTimersByTimeAsync(120000);
      const result = await promise;
      expect(result?.name).toBe('Sol Ring');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws after max retries on persistent 429', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }));

      const promise = fetchJustTCGCard({ name: 'Sol Ring' });
      const assertion = expect(promise).rejects.toThrow('JustTCG API Error: 429');
      await vi.advanceTimersByTimeAsync(120000);
      await assertion;
    });

    it('retries on network error', async () => {
      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: { name: 'Sol Ring', prices: [] } }) });
      vi.stubGlobal('fetch', fetchMock);

      const promise = fetchJustTCGCard({ name: 'Sol Ring' });
      await vi.advanceTimersByTimeAsync(120000);
      const result = await promise;
      expect(result?.name).toBe('Sol Ring');
    });
  });

  describe('fetchJustTCGCards batch', () => {
    it('returns batch response on success', async () => {
      const response = { success: true, data: [{ name: 'Sol Ring', prices: [] }] };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(response),
      }));

      const promise = fetchJustTCGCards([{ name: 'Sol Ring' }]);
      await vi.advanceTimersByTimeAsync(120000);
      const result = await promise;
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('retries on 429 with attempt counter', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 429 })
        .mockResolvedValueOnce({ ok: false, status: 429 })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) });
      vi.stubGlobal('fetch', fetchMock);

      const promise = fetchJustTCGCards([{ name: 'Sol Ring' }]);
      await vi.advanceTimersByTimeAsync(120000);
      const result = await promise;
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('throws after max retries on persistent 429', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }));

      const promise = fetchJustTCGCards([{ name: 'Sol Ring' }]);
      const assertion = expect(promise).rejects.toThrow('max retries exceeded');
      await vi.advanceTimersByTimeAsync(120000);
      await assertion;
    });

    it('retries on network error in batch', async () => {
      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) });
      vi.stubGlobal('fetch', fetchMock);

      const promise = fetchJustTCGCards([{ name: 'Sol Ring' }]);
      await vi.advanceTimersByTimeAsync(120000);
      const result = await promise;
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('calls progress callback', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [{ name: 'Sol Ring' }] }),
      }));

      const onProgress = vi.fn();
      const promise = fetchJustTCGCards([{ name: 'Sol Ring' }], onProgress);
      await vi.advanceTimersByTimeAsync(120000);
      await promise;
      expect(onProgress).toHaveBeenCalledWith(1, 1);
    });
  });
});
