'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type ParamValue = string | number | null;

interface UseUrlStateOptions<T extends Record<string, ParamValue>> {
  defaults: T;
  /** Called when URL params change (e.g., on initial load or browser navigation) */
  onUrlChange?: (params: T) => void;
}

/**
 * Bidirectional sync between React state and URL search params.
 * Uses shallow routing to avoid page reloads.
 */
export function useUrlState<T extends Record<string, ParamValue>>({
  defaults,
  onUrlChange,
}: UseUrlStateOptions<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isInitialMount = useRef(true);
  const lastUrlRef = useRef<string>('');

  // Parse URL params into typed object
  const parseParams = useCallback((): T => {
    const result = { ...defaults };

    for (const key of Object.keys(defaults)) {
      const urlValue = searchParams.get(key);
      const defaultValue = defaults[key];

      if (urlValue === null) {
        (result as Record<string, ParamValue>)[key] = defaultValue;
      } else if (typeof defaultValue === 'number') {
        // Default is a number, so parse URL value as number
        const parsed = parseInt(urlValue, 10);
        (result as Record<string, ParamValue>)[key] = isNaN(parsed) ? defaultValue : parsed;
      } else if (defaultValue === null && /^\d+$/.test(urlValue)) {
        // Default is null but URL value looks like a number - parse it
        (result as Record<string, ParamValue>)[key] = parseInt(urlValue, 10);
      } else {
        (result as Record<string, ParamValue>)[key] = urlValue;
      }
    }

    return result;
  }, [searchParams, defaults]);

  // Call onUrlChange on initial mount and when URL changes via browser navigation
  useEffect(() => {
    const currentUrl = searchParams.toString();

    if (isInitialMount.current || currentUrl !== lastUrlRef.current) {
      isInitialMount.current = false;
      lastUrlRef.current = currentUrl;
      onUrlChange?.(parseParams());
    }
  }, [searchParams, parseParams, onUrlChange]);

  // Update URL with new params (shallow routing)
  const setParams = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const defaultValue = defaults[key];

        // Remove param if it matches default or is null/undefined
        if (value === null || value === undefined || value === defaultValue) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      lastUrlRef.current = params.toString();
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router, defaults]
  );

  return {
    params: parseParams(),
    setParams,
  };
}
