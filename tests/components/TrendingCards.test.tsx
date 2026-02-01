import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import TrendingCards from '@/components/TrendingCards';
import type { TrendingData, TrendingInPrecons } from '@/types';

// Mock modules
vi.mock('@/lib/trending', () => ({
  loadTrendingData: vi.fn(),
  findTrendingInPrecons: vi.fn(),
  formatTrendingAge: vi.fn((date) => date ? '2h ago' : 'Unknown'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockTrendingData: TrendingData = {
  trendingCards: [
    { name: 'Sol Ring', sanitized: 'sol-ring' },
    { name: 'Command Tower', sanitized: 'command-tower' },
    { name: 'Arcane Signet', sanitized: 'arcane-signet' },
    { name: 'Lightning Greaves', sanitized: 'lightning-greaves' },
    { name: 'Swiftfoot Boots', sanitized: 'swiftfoot-boots' },
    { name: 'Cyclonic Rift', sanitized: 'cyclonic-rift' },
  ],
  weeklyCommanders: [],
  dailyCommander: null,
  updatedAt: '2024-01-15T12:00:00Z',
};

const mockTrendingInPrecons: TrendingInPrecons[] = [
  {
    card: { name: 'Sol Ring', sanitized: 'sol-ring' },
    decks: [
      { id: 'deck-1', name: 'Deck One', set: 'Set A', year: 2024 },
      { id: 'deck-2', name: 'Deck Two', set: 'Set B', year: 2023 },
    ],
  },
];

describe('TrendingCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading spinner', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<TrendingCards />);

      expect(container.textContent).toContain('Loading trending data...');
      expect(container.querySelector('.animate-spin')).not.toBeNull();
    });

    it('shows header during loading', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<TrendingCards />);

      expect(container.textContent).toContain('Trending Cards');
    });
  });

  describe('trending data display', () => {
    it('displays trending cards', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingInPrecons);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Sol Ring');
        expect(container.textContent).toContain('Command Tower');
      });
    });

    it('shows rank numbers', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        // Should show numbers 1-5 initially
        expect(container.textContent).toMatch(/[12345]/);
      });
    });

    it('shows updated timestamp', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('2h ago');
      });
    });

    it('shows EDHREC header', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Trending on EDHREC');
      });
    });
  });

  describe('precon indicators', () => {
    it('shows precon badges for cards in precons', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingInPrecons);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Deck One');
        expect(container.textContent).toContain('In 2 precons');
      });
    });

    it('limits precon badges to 3', async () => {
      const manyPrecons: TrendingInPrecons[] = [
        {
          card: { name: 'Sol Ring', sanitized: 'sol-ring' },
          decks: [
            { id: 'deck-1', name: 'Deck One', set: 'Set A', year: 2024 },
            { id: 'deck-2', name: 'Deck Two', set: 'Set B', year: 2023 },
            { id: 'deck-3', name: 'Deck Three', set: 'Set C', year: 2023 },
            { id: 'deck-4', name: 'Deck Four', set: 'Set D', year: 2022 },
          ],
        },
      ];

      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue(manyPrecons);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('+1 more');
      });
    });
  });

  describe('empty state', () => {
    it('returns null when no trending data', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('returns null when no trending cards', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue({
        trendingCards: [],
        weeklyCommanders: [],
        dailyCommander: null,
        updatedAt: null,
      });
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('expand/collapse', () => {
    it('shows expand button when more than 5 cards', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Show all 6 trending cards');
      });
    });

    it('expands to show all cards when clicked', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Show all');
      });

      const expandButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(expandButton!);
      });

      expect(container.textContent).toContain('Show less');
      expect(container.textContent).toContain('Cyclonic Rift');
    });

    it('collapses when clicking Show less', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        expect(container.textContent).toContain('Show all');
      });

      // Expand
      const expandButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(expandButton!);
      });

      // Collapse
      const collapseButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(collapseButton!);
      });

      expect(container.textContent).toContain('Show all');
    });
  });

  describe('EDHREC links', () => {
    it('links to EDHREC for each card', async () => {
      const { loadTrendingData, findTrendingInPrecons } = await import('@/lib/trending');
      (loadTrendingData as ReturnType<typeof vi.fn>).mockResolvedValue(mockTrendingData);
      (findTrendingInPrecons as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<TrendingCards />);

      await waitFor(() => {
        const edhrecLinks = container.querySelectorAll('a[href*="edhrec.com"]');
        expect(edhrecLinks.length).toBeGreaterThan(0);
      });
    });
  });
});
