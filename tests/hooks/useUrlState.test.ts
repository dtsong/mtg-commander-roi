import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlState } from '@/hooks/useUrlState';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

describe('useUrlState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('year');
    mockSearchParams.delete('set');
    mockSearchParams.delete('deck');
  });

  it('returns defaults when URL has no params', () => {
    const defaults = { year: null as number | null, set: null as string | null };
    const onUrlChange = vi.fn();

    renderHook(() => useUrlState({ defaults, onUrlChange }));

    expect(onUrlChange).toHaveBeenCalledWith({ year: null, set: null });
  });

  it('parses string params from URL', () => {
    mockSearchParams.set('set', 'Duskmourn');
    const defaults = { set: null as string | null };
    const onUrlChange = vi.fn();

    renderHook(() => useUrlState({ defaults, onUrlChange }));

    expect(onUrlChange).toHaveBeenCalledWith({ set: 'Duskmourn' });
  });

  it('parses number params from URL', () => {
    mockSearchParams.set('year', '2024');
    const defaults = { year: null as number | null };
    const onUrlChange = vi.fn();

    renderHook(() => useUrlState({ defaults, onUrlChange }));

    expect(onUrlChange).toHaveBeenCalledWith({ year: 2024 });
  });

  it('uses default for invalid number params', () => {
    mockSearchParams.set('year', 'invalid');
    const defaults = { year: 2025 };
    const onUrlChange = vi.fn();

    renderHook(() => useUrlState({ defaults, onUrlChange }));

    expect(onUrlChange).toHaveBeenCalledWith({ year: 2025 });
  });

  it('setParams updates URL with shallow routing', () => {
    const defaults = { year: null as number | null, set: null as string | null };

    const { result } = renderHook(() => useUrlState({ defaults }));

    act(() => {
      result.current.setParams({ year: 2024, set: 'DSK' });
    });

    expect(mockPush).toHaveBeenCalledWith('/?year=2024&set=DSK', { scroll: false });
  });

  it('setParams removes params that match defaults', () => {
    mockSearchParams.set('year', '2024');
    const defaults = { year: null as number | null };

    const { result } = renderHook(() => useUrlState({ defaults }));

    act(() => {
      result.current.setParams({ year: null });
    });

    expect(mockPush).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('setParams removes null values', () => {
    mockSearchParams.set('set', 'Duskmourn');
    const defaults = { set: 'all' };

    const { result } = renderHook(() => useUrlState({ defaults }));

    act(() => {
      result.current.setParams({ set: null });
    });

    expect(mockPush).toHaveBeenCalledWith('/', { scroll: false });
  });

  it('setParams keeps existing params when updating others', () => {
    mockSearchParams.set('year', '2024');
    const defaults = { year: null as number | null, set: null as string | null };

    const { result } = renderHook(() => useUrlState({ defaults }));

    act(() => {
      result.current.setParams({ set: 'DSK' });
    });

    expect(mockPush).toHaveBeenCalledWith('/?year=2024&set=DSK', { scroll: false });
  });
});
