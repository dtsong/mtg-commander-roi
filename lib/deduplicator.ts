const inFlightRequests = new Map<string, Promise<unknown>>();

export function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
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
