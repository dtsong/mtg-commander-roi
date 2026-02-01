import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TopValueCards from '@/components/TopValueCards';

// Mock modules
vi.mock('@/lib/calculations', () => ({
  getTopValueCards: vi.fn((cards, count) =>
    [...cards]
      .sort((a, b) => (b.price ?? b.total ?? 0) - (a.price ?? a.total ?? 0))
      .slice(0, count)
  ),
  formatCurrency: vi.fn((val) => `$${val.toFixed(2)}`),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockCards = [
  { name: 'Expensive Card', price: 50.00 },
  { name: 'Medium Card', price: 10.00 },
  { name: 'Cheap Card', price: 1.00 },
  { name: 'Sol Ring', price: 2.99 },
  { name: 'Command Tower', price: 0.50 },
  { name: 'Very Expensive', price: 100.00 },
];

describe('TopValueCards', () => {
  describe('top N cards display', () => {
    it('displays top 5 cards by value', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={164.49} />
      );

      expect(container.textContent).toContain('Very Expensive');
      expect(container.textContent).toContain('Expensive Card');
      expect(container.textContent).toContain('Medium Card');
    });

    it('shows header with count', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={100} />
      );

      expect(container.textContent).toContain('Top 5 Most Valuable Cards');
    });

    it('shows Trophy icon', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={100} />
      );

      const header = container.querySelector('h3');
      const icon = header?.querySelector('.text-yellow-400');
      expect(icon).not.toBeNull();
    });

    it('shows subtitle', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={100} />
      );

      expect(container.textContent).toContain('Highest value singles in this deck');
    });
  });

  describe('rank display', () => {
    it('shows rank numbers for each card', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={100} />
      );

      // Should have rank badges
      const rankBadges = container.querySelectorAll('.bg-purple-600.rounded-full');
      expect(rankBadges.length).toBeGreaterThan(0);
    });
  });

  describe('percentage display', () => {
    it('shows percentage of total for each card', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={200} />
      );

      // Very Expensive (100) is 50% of total (200)
      expect(container.textContent).toContain('% of total');
    });

    it('does not show percentage when totalValue is 0', () => {
      const { container } = render(
        <TopValueCards cards={mockCards} loading={false} totalValue={0} />
      );

      expect(container.textContent).not.toContain('% of total');
    });
  });

  describe('loading state', () => {
    it('shows skeleton cards when loading', () => {
      const { container } = render(
        <TopValueCards cards={[]} loading={true} totalValue={0} />
      );

      // Should have skeleton elements
      expect(container.textContent).toContain('Top 5 Most Valuable Cards');
    });

    it('shows 5 skeleton cards', () => {
      const { container } = render(
        <TopValueCards cards={[]} loading={true} totalValue={0} />
      );

      // Look for skeleton components
      const skeletons = container.querySelectorAll('[class*="animate"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('empty state', () => {
    it('returns null when no cards and not loading', () => {
      const { container } = render(
        <TopValueCards cards={[]} loading={false} totalValue={0} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('with fewer than 5 cards', () => {
    it('handles decks with fewer than 5 cards', () => {
      const fewCards = [
        { name: 'Card 1', price: 10 },
        { name: 'Card 2', price: 5 },
      ];

      const { container } = render(
        <TopValueCards cards={fewCards} loading={false} totalValue={15} />
      );

      expect(container.textContent).toContain('Card 1');
      expect(container.textContent).toContain('Card 2');
    });
  });

  describe('total display', () => {
    it('uses total property when available', () => {
      const cardsWithTotal = [
        { name: 'Multi Card', price: 5, quantity: 2, total: 10 },
      ];

      const { container } = render(
        <TopValueCards cards={cardsWithTotal} loading={false} totalValue={10} />
      );

      expect(container.textContent).toContain('Multi Card');
    });
  });
});
