import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import PriceDataTimestamp from '@/components/PriceDataTimestamp';

vi.mock('@/lib/scryfall', () => ({
  getPriceDataTimestamp: vi.fn(),
}));

vi.mock('@/lib/priceCache', () => ({
  formatStaticPriceAge: vi.fn(),
}));

describe('PriceDataTimestamp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('returns null while loading', async () => {
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    (getPriceDataTimestamp as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) // Never resolves
    );

    const { container } = render(<PriceDataTimestamp />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no timestamp', async () => {
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    const { formatStaticPriceAge } = await import('@/lib/priceCache');

    (getPriceDataTimestamp as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (formatStaticPriceAge as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { container } = render(<PriceDataTimestamp />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders formatted age when timestamp available', async () => {
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    const { formatStaticPriceAge } = await import('@/lib/priceCache');

    (getPriceDataTimestamp as ReturnType<typeof vi.fn>).mockResolvedValue('2024-01-01');
    (formatStaticPriceAge as ReturnType<typeof vi.fn>).mockReturnValue('2 days ago');

    const { container } = render(<PriceDataTimestamp />);

    await waitFor(() => {
      expect(container.textContent).toContain('Prices updated');
      expect(container.textContent).toContain('2 days ago');
    });
  });

  it('renders clock icon', async () => {
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    const { formatStaticPriceAge } = await import('@/lib/priceCache');

    (getPriceDataTimestamp as ReturnType<typeof vi.fn>).mockResolvedValue('2024-01-01');
    (formatStaticPriceAge as ReturnType<typeof vi.fn>).mockReturnValue('today');

    const { container } = render(<PriceDataTimestamp />);

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    });
  });

  it('has correct styling', async () => {
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    const { formatStaticPriceAge } = await import('@/lib/priceCache');

    (getPriceDataTimestamp as ReturnType<typeof vi.fn>).mockResolvedValue('2024-01-01');
    (formatStaticPriceAge as ReturnType<typeof vi.fn>).mockReturnValue('yesterday');

    const { container } = render(<PriceDataTimestamp />);

    await waitFor(() => {
      const div = container.querySelector('div');
      expect(div?.className).toContain('flex');
      expect(div?.className).toContain('items-center');
      expect(div?.className).toContain('text-sm');
    });
  });
});
