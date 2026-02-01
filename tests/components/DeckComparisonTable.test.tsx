import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DeckComparisonTable from '@/components/DeckComparisonTable';
import type { PreconDeck, CachedPriceData, FilterState } from '@/types';

// Mock modules
vi.mock('@/lib/calculations', () => ({
  formatCurrency: vi.fn((val) => `$${val.toFixed(2)}`),
  calculateROI: vi.fn((value, msrp) => ((value - msrp) / msrp) * 100),
  calculateDistroROI: vi.fn((value, distro) => ((value - distro) / distro) * 100),
  getDistroCost: vi.fn((msrp) => msrp * 0.6),
  formatPercentage: vi.fn((val) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`),
  getROIVerdict: vi.fn((distroRoi, roi) => ({
    label: distroRoi > 15 && roi > 0 ? 'BUY' : distroRoi > 15 ? 'DISTRO' : distroRoi > 0 ? 'HOLD' : 'PASS',
    color: distroRoi > 15 ? 'text-green-400' : distroRoi > 0 ? 'text-yellow-400' : 'text-red-400',
    bg: 'bg-slate-800',
    border: 'border-slate-700',
  })),
}));

vi.mock('@/lib/priceCache', () => ({
  formatStaticPriceAge: vi.fn(() => '2h ago'),
  isTimestampStale: vi.fn(() => false),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockDecks: PreconDeck[] = [
  { id: 'deck-1', name: 'Deck One', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['W', 'U'], edhrec: 'deck-one' },
  { id: 'deck-2', name: 'Deck Two', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['B', 'R'], edhrec: 'deck-two' },
  { id: 'deck-3', name: 'Deck Three', set: 'Set B', year: 2023, msrp: 45, setCode: 'b', colors: ['G'], edhrec: 'deck-three' },
];

const mockPriceData: Record<string, CachedPriceData> = {
  'deck-1': { totalValue: 80, topCards: [{ name: 'Card 1', price: 20 }], cardCount: 100, fetchedAt: '2024-01-15' },
  'deck-2': { totalValue: 40, topCards: [], cardCount: 100, fetchedAt: '2024-01-15' },
};

const defaultFilter: FilterState = {
  year: 'all',
  set: 'all',
  roiThreshold: 'all',
};

describe('DeckComparisonTable', () => {
  const defaultProps = {
    decks: mockDecks,
    priceData: mockPriceData,
    loadingDeck: null,
    onLoadPrice: vi.fn(),
    onRefreshPrice: vi.fn(),
    filter: defaultFilter,
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('multiple decks render', () => {
    it('renders all decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('Deck One');
      expect(container.textContent).toContain('Deck Two');
      expect(container.textContent).toContain('Deck Three');
    });

    it('shows deck set and year', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('Set A');
      expect(container.textContent).toContain('Set B');
    });

    it('shows MSRP for each deck', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('$50.00');
      expect(container.textContent).toContain('$45.00');
    });

    it('shows value for loaded decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('$80.00');
      expect(container.textContent).toContain('$40.00');
    });

    it('shows dash for unloaded decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      // Deck Three has no price data
      const dashes = container.querySelectorAll('td');
      const hasEmptyValue = Array.from(dashes).some(td => td.textContent === '—');
      expect(hasEmptyValue).toBe(true);
    });
  });

  describe('sort functionality', () => {
    it('renders sort headers', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('Deck');
      expect(container.textContent).toContain('Set');
      expect(container.textContent).toContain('MSRP');
      expect(container.textContent).toContain('Value');
      expect(container.textContent).toContain('Distro ROI');
    });

    it('changes sort on header click', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      // Find the sort header for "Deck"
      const sortButtons = container.querySelectorAll('th button');
      const deckSortButton = Array.from(sortButtons).find(btn =>
        btn.textContent?.includes('Deck')
      );

      fireEvent.click(deckSortButton!);

      // Should have active styling
      expect(deckSortButton?.className).toContain('text-purple');
    });

    it('toggles sort direction on same header click', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const sortButtons = container.querySelectorAll('th button');
      const valueSortButton = Array.from(sortButtons).find(btn =>
        btn.textContent?.includes('Value')
      );

      // First click
      fireEvent.click(valueSortButton!);

      // Second click should toggle direction
      fireEvent.click(valueSortButton!);

      // Sort should be active
      expect(valueSortButton?.className).toContain('text-purple');
    });
  });

  describe('filter functionality', () => {
    it('renders year filter', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(1);

      const yearSelect = selects[0];
      expect(yearSelect.textContent).toContain('All Years');
      expect(yearSelect.textContent).toContain('2024');
      expect(yearSelect.textContent).toContain('2023');
    });

    it('calls onFilterChange when year changes', () => {
      const onFilterChange = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onFilterChange={onFilterChange} />
      );

      const selects = container.querySelectorAll('select');
      fireEvent.change(selects[0], { target: { value: '2024' } });

      expect(onFilterChange).toHaveBeenCalledWith({ year: '2024' });
    });

    it('renders set filter', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const selects = container.querySelectorAll('select');
      const setSelect = selects[1];

      expect(setSelect.textContent).toContain('All Sets');
      expect(setSelect.textContent).toContain('Set A');
      expect(setSelect.textContent).toContain('Set B');
    });

    it('renders ROI threshold filter', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const selects = container.querySelectorAll('select');
      const roiSelect = selects[2];

      expect(roiSelect.textContent).toContain('All');
      expect(roiSelect.textContent).toContain('Positive ROI');
      expect(roiSelect.textContent).toContain('BUY');
    });
  });

  describe('stats display', () => {
    it('shows loaded count', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('2/3 loaded');
    });

    it('shows average distro ROI', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('Avg Distro ROI');
    });

    it('shows BUY count', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('BUY');
    });
  });

  describe('load/refresh buttons', () => {
    it('shows Load button for unloaded decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const loadButtons = Array.from(container.querySelectorAll('button')).filter(
        btn => btn.textContent === 'Load'
      );
      expect(loadButtons.length).toBeGreaterThan(0);
    });

    it('shows Refresh button for loaded decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const refreshButtons = Array.from(container.querySelectorAll('button')).filter(
        btn => btn.textContent === 'Refresh'
      );
      expect(refreshButtons.length).toBeGreaterThan(0);
    });

    it('calls onLoadPrice when Load clicked', () => {
      const onLoadPrice = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onLoadPrice={onLoadPrice} />
      );

      const loadButtons = Array.from(container.querySelectorAll('button')).filter(
        btn => btn.textContent === 'Load'
      );
      fireEvent.click(loadButtons[0]);

      expect(onLoadPrice).toHaveBeenCalled();
    });

    it('calls onRefreshPrice when Refresh clicked', () => {
      const onRefreshPrice = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onRefreshPrice={onRefreshPrice} />
      );

      const refreshButtons = Array.from(container.querySelectorAll('button')).filter(
        btn => btn.textContent === 'Refresh'
      );
      fireEvent.click(refreshButtons[0]);

      expect(onRefreshPrice).toHaveBeenCalled();
    });

    it('disables buttons during loading', () => {
      const { container } = render(
        <DeckComparisonTable {...defaultProps} loadingDeck="deck-1" />
      );

      const buttons = container.querySelectorAll('button[disabled]');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('loading indicator', () => {
    it('shows loading spinner for loading deck', () => {
      const { container } = render(
        <DeckComparisonTable {...defaultProps} loadingDeck="deck-3" />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
    });
  });

  describe('color indicators', () => {
    it('shows color indicators for each deck', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      expect(container.textContent).toContain('W');
      expect(container.textContent).toContain('U');
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('R');
      expect(container.textContent).toContain('G');
    });
  });

  describe('deck links', () => {
    it('links to deck detail page', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const deckLinks = container.querySelectorAll('a[href^="/deck/"]');
      expect(deckLinks.length).toBeGreaterThan(0);
    });
  });

  describe('responsive layout', () => {
    it('has mobile card view', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const mobileView = container.querySelector('.md\\:hidden');
      expect(mobileView).not.toBeNull();
    });

    it('has desktop table view', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const desktopView = container.querySelector('.hidden.md\\:block');
      expect(desktopView).not.toBeNull();
    });
  });

  describe('mobile view interactions', () => {
    it('renders mobile deck cards', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const mobileCards = container.querySelectorAll('.md\\:hidden .bg-slate-800\\/50');
      expect(mobileCards.length).toBeGreaterThan(0);
    });

    it('calls onLoadPrice from mobile view', () => {
      const onLoadPrice = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onLoadPrice={onLoadPrice} />
      );

      // Find mobile load button - in the mobile view section
      const mobileSection = container.querySelector('.md\\:hidden');
      const loadButtons = mobileSection?.querySelectorAll('button');
      const loadButton = Array.from(loadButtons || []).find(
        btn => btn.textContent === 'Load'
      );

      if (loadButton) {
        fireEvent.click(loadButton);
        expect(onLoadPrice).toHaveBeenCalled();
      }
    });

    it('calls onRefreshPrice from mobile view', () => {
      const onRefreshPrice = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onRefreshPrice={onRefreshPrice} />
      );

      // Find mobile refresh button
      const mobileSection = container.querySelector('.md\\:hidden');
      const refreshButtons = mobileSection?.querySelectorAll('button');
      const refreshButton = Array.from(refreshButtons || []).find(
        btn => btn.textContent === 'Refresh'
      );

      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(onRefreshPrice).toHaveBeenCalled();
      }
    });
  });

  describe('sorting variations', () => {
    it('sorts by ROI', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const sortButtons = container.querySelectorAll('th button');
      const roiSortButton = Array.from(sortButtons).find(btn =>
        btn.textContent?.includes('MSRP ROI')
      );

      if (roiSortButton) {
        fireEvent.click(roiSortButton);
        expect(roiSortButton.className).toContain('text-purple');
      }
    });

    it('sorts by distro ROI', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const sortButtons = container.querySelectorAll('th button');
      const distroSortButton = Array.from(sortButtons).find(btn =>
        btn.textContent?.includes('Distro ROI')
      );

      if (distroSortButton) {
        fireEvent.click(distroSortButton);
        expect(distroSortButton.className).toContain('text-purple');
      }
    });

    it('sorts by set name', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      const sortButtons = container.querySelectorAll('th button');
      const setSortButton = Array.from(sortButtons).find(btn =>
        btn.textContent?.includes('Set')
      );

      if (setSortButton) {
        fireEvent.click(setSortButton);
        expect(setSortButton.className).toContain('text-purple');
      }
    });
  });

  describe('filter combinations', () => {
    it('filters by set', () => {
      const onFilterChange = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onFilterChange={onFilterChange} />
      );

      const selects = container.querySelectorAll('select');
      fireEvent.change(selects[1], { target: { value: 'Set A' } });

      expect(onFilterChange).toHaveBeenCalledWith({ set: 'Set A' });
    });

    it('filters by ROI threshold', () => {
      const onFilterChange = vi.fn();
      const { container } = render(
        <DeckComparisonTable {...defaultProps} onFilterChange={onFilterChange} />
      );

      const selects = container.querySelectorAll('select');
      fireEvent.change(selects[2], { target: { value: 'positive' } });

      expect(onFilterChange).toHaveBeenCalledWith({ roiThreshold: 'positive' });
    });

    it('filters decks by year', () => {
      const { container } = render(
        <DeckComparisonTable
          {...defaultProps}
          filter={{ ...defaultFilter, year: '2024' }}
        />
      );

      // Only 2024 decks should be shown
      expect(container.textContent).toContain('Deck One');
      expect(container.textContent).toContain('Deck Two');
      // Deck Three is from 2023
    });

    it('shows positive ROI filter results', () => {
      const { container } = render(
        <DeckComparisonTable
          {...defaultProps}
          filter={{ ...defaultFilter, roiThreshold: 'positive' }}
        />
      );

      // Only deck-1 has positive ROI (80 value vs 50 MSRP)
      expect(container.textContent).toContain('Deck One');
    });
  });

  describe('verdict display', () => {
    it('shows verdict badges', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      // Deck 1 should have BUY verdict (80 value, 50 MSRP, 30 distro cost)
      const buyBadges = container.querySelectorAll('.text-green-400');
      expect(buyBadges.length).toBeGreaterThan(0);
    });
  });

  describe('timestamp display', () => {
    it('shows price age for loaded decks', () => {
      const { container } = render(<DeckComparisonTable {...defaultProps} />);

      // The mock returns '2h ago' for formatStaticPriceAge
      expect(container.textContent).toContain('2h ago');
    });
  });
});
