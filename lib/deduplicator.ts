const inFlightRequests = new Map<string, Promise<unknown>>();

const WARN_THRESHOLD = 100;
const HARD_LIMIT = 500;

export function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const size = inFlightRequests.size;
  if (size >= HARD_LIMIT) {
    return Promise.reject(new Error(`Deduplicator queue full (${size}/${HARD_LIMIT})`));
  }
  if (size >= WARN_THRESHOLD && size % 10 === 0) {
    console.warn(`Deduplicator queue depth: ${size}/${HARD_LIMIT}`);
  }

  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

export function getInflightCount(): number {
  return inFlightRequests.size;
}

export function clearInflight(): void {
  inFlightRequests.clear();
}
