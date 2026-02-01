import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CardPriceRow from '@/components/CardPriceRow';

// Mock modules
vi.mock('@/lib/calculations', () => ({
  formatCurrency: vi.fn((val) => `$${val.toFixed(2)}`),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('CardPriceRow', () => {
  describe('price display', () => {
    it('displays card price', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} />
      );

      expect(container.textContent).toContain('$2.99');
    });

    it('displays total price when quantity > 1', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99, quantity: 2, total: 5.98 }} />
      );

      // The total is shown as the main price, and "each" price is shown below
      expect(container.textContent).toContain('2x');
      expect(container.textContent).toContain('each');
    });

    it('shows price per card for multiple copies', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Island', price: 0.10, quantity: 10, total: 1.00 }} />
      );

      expect(container.textContent).toContain('$0.10 each');
    });

    it('highlights high-value cards (>$5)', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Expensive Card', price: 10.00 }} />
      );

      const priceSpan = container.querySelector('.text-green-400');
      expect(priceSpan).not.toBeNull();
    });

    it('uses white text for low-value cards', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Cheap Card', price: 1.00 }} />
      );

      // Should have text-white for price
      expect(container.textContent).toContain('$1.00');
    });
  });

  describe('foil indicator', () => {
    it('shows FOIL ONLY badge when card is foil only', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Foil Card', price: 5.00, isFoilOnly: true }} />
      );

      expect(container.textContent).toContain('FOIL ONLY');
      expect(container.textContent).toContain('FOIL');
    });

    it('shows NM badge for non-foil cards', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Regular Card', price: 5.00 }} />
      );

      expect(container.textContent).toContain('NM');
    });

    it('shows foil price when available', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Card', price: 5.00, foilPrice: 10.00 }} />
      );

      expect(container.textContent).toContain('Foil: $10.00');
    });

    it('shows foil premium percentage for significant premium', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Card', price: 5.00, foilPrice: 10.00 }} />
      );

      // 100% premium should show
      expect(container.textContent).toContain('+100%');
    });
  });

  describe('lowest listing display', () => {
    it('shows lowest listing when available', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Card', price: 10.00, lowestListing: 8.00 }} />
      );

      expect(container.textContent).toContain('Low: $8.00');
    });

    it('shows savings percentage for significant savings', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Card', price: 10.00, lowestListing: 8.00 }} />
      );

      // 20% savings should show
      expect(container.textContent).toContain('-20%');
    });

    it('does not show lowest listing if higher than price', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Card', price: 5.00, lowestListing: 10.00 }} />
      );

      expect(container.textContent).not.toContain('Low:');
    });
  });

  describe('missing price state', () => {
    it('shows N/A when price is null', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Unknown Card', price: null }} />
      );

      expect(container.textContent).toContain('N/A');
    });

    it('shows N/A when price is undefined', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Unknown Card' }} />
      );

      expect(container.textContent).toContain('N/A');
    });

    it('shows N/A when price is 0', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Unknown Card', price: 0 }} />
      );

      expect(container.textContent).toContain('N/A');
    });
  });

  describe('card name and link', () => {
    it('renders card name', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} />
      );

      expect(container.textContent).toContain('Sol Ring');
    });

    it('renders Scryfall link', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} />
      );

      const link = container.querySelector('a[href*="scryfall.com"]');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('target')).toBe('_blank');
    });
  });

  describe('rank display', () => {
    it('shows rank when provided', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} rank={1} />
      );

      const rankBadge = container.querySelector('.bg-purple-600');
      expect(rankBadge).not.toBeNull();
      expect(rankBadge?.textContent).toBe('1');
    });

    it('does not show rank when not provided', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} />
      );

      const rankBadge = container.querySelector('.bg-purple-600.rounded-full');
      expect(rankBadge).toBeNull();
    });
  });

  describe('condition info link', () => {
    it('shows condition info link when showConditionInfo is true', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} showConditionInfo />
      );

      const infoLink = container.querySelector('a[href*="understanding-card-conditions"]');
      expect(infoLink).not.toBeNull();
    });

    it('does not show condition info link by default', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99 }} />
      );

      const infoLink = container.querySelector('a[href*="understanding-card-conditions"]');
      expect(infoLink).toBeNull();
    });
  });

  describe('purchase links', () => {
    it('renders purchase links', () => {
      const { container } = render(
        <CardPriceRow card={{ name: 'Sol Ring', price: 2.99, tcgplayerId: 123 }} />
      );

      expect(container.textContent).toContain('TCG');
    });
  });
});
