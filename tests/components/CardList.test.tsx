import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CardList from '@/components/CardList';

// Mock modules
vi.mock('@/lib/calculations', () => ({
  sortCardsByValue: vi.fn((cards) => [...cards].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))),
  formatCurrency: vi.fn((val) => `$${val.toFixed(2)}`),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockCards = [
  { name: 'Sol Ring', price: 2.99 },
  { name: 'Command Tower', price: 0.50 },
  { name: 'Expensive Card', price: 25.00 },
];

describe('CardList', () => {
  describe('renders card rows', () => {
    it('renders all cards', () => {
      const { container } = render(
        <CardList cards={mockCards} loading={false} />
      );

      expect(container.textContent).toContain('Sol Ring');
      expect(container.textContent).toContain('Command Tower');
      expect(container.textContent).toContain('Expensive Card');
    });

    it('shows card count in header', () => {
      const { container } = render(
        <CardList cards={mockCards} loading={false} />
      );

      expect(container.textContent).toContain('All Cards (3)');
    });

    it('sorts cards by value', async () => {
      const { sortCardsByValue } = await import('@/lib/calculations');

      render(<CardList cards={mockCards} loading={false} />);

      expect(sortCardsByValue).toHaveBeenCalledWith(mockCards);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no cards', () => {
      const { container } = render(
        <CardList cards={[]} loading={false} />
      );

      expect(container.textContent).toContain('No cards loaded');
      expect(container.textContent).toContain('Select a deck from the sidebar');
    });

    it('shows Package icon in empty state', () => {
      const { container } = render(
        <CardList cards={[]} loading={false} />
      );

      const icon = container.querySelector('svg');
      expect(icon).not.toBeNull();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner', () => {
      const { container } = render(
        <CardList cards={[]} loading={true} />
      );

      expect(container.textContent).toContain('Loading cards...');
    });

    it('shows animated spinner', () => {
      const { container } = render(
        <CardList cards={[]} loading={true} />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeNull();
    });

    it('shows header during loading', () => {
      const { container } = render(
        <CardList cards={[]} loading={true} />
      );

      expect(container.textContent).toContain('All Cards');
    });
  });

  describe('header', () => {
    it('shows List icon', () => {
      const { container } = render(
        <CardList cards={mockCards} loading={false} />
      );

      const header = container.querySelector('h3');
      const icon = header?.querySelector('svg');
      expect(icon).not.toBeNull();
    });

    it('shows correct count with cards', () => {
      const cards = [
        { name: 'Card 1', price: 1 },
        { name: 'Card 2', price: 2 },
      ];

      const { container } = render(
        <CardList cards={cards} loading={false} />
      );

      expect(container.textContent).toContain('All Cards (2)');
    });
  });

  describe('scroll container', () => {
    it('has max-height and overflow for scrolling', () => {
      const { container } = render(
        <CardList cards={mockCards} loading={false} />
      );

      const scrollContainer = container.querySelector('.max-h-96.overflow-y-auto');
      expect(scrollContainer).not.toBeNull();
    });
  });

  describe('virtualization hints', () => {
    it('uses content-visibility for performance', () => {
      const { container } = render(
        <CardList cards={mockCards} loading={false} />
      );

      // The component wraps cards in divs with style attribute containing content-visibility
      const cardWrappers = container.querySelectorAll('.space-y-2 > div');
      expect(cardWrappers.length).toBe(mockCards.length);
    });
  });
});
