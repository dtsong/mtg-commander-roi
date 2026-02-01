import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ROISummary from '@/components/ROISummary';
import type { PreconDeck } from '@/types';

const mockDeck: PreconDeck = {
  id: 'test-deck',
  name: 'Test Deck',
  set: 'Test Set',
  year: 2024,
  msrp: 50,
  setCode: 'tst',
  colors: ['W', 'U'],
  edhrec: 'test-deck',
};

describe('ROISummary', () => {
  describe('no deck selected', () => {
    it('shows placeholder message when deck is null', () => {
      const { container } = render(
        <ROISummary deck={null} totalValue={0} loading={false} />
      );

      expect(container.textContent).toContain('Select a deck to view ROI analysis');
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={0} loading={true} />
      );

      expect(container.textContent).toContain('Loading prices...');
    });
  });

  describe('verdict display', () => {
    it('shows BUY verdict for high positive distro ROI', () => {
      // totalValue needs to be high enough for >15% distro ROI
      // Distro cost = 50 * 0.6 = 30
      // For >15% distro ROI: totalValue > 30 * 1.15 = 34.5
      // Also need positive MSRP ROI: totalValue > 50
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('BUY');
    });

    it('shows DISTRO verdict for positive distro but negative MSRP ROI', () => {
      // Distro cost = 30, need >15% distro ROI but negative MSRP ROI
      // totalValue > 34.5 for positive distro, < 50 for negative MSRP
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={40} loading={false} />
      );

      expect(container.textContent).toContain('DISTRO');
      expect(container.textContent).toContain('Only at distributor pricing');
    });

    it('shows HOLD verdict for low positive distro ROI', () => {
      // Distro cost = 30, need 0-15% distro ROI
      // 30 < totalValue < 34.5
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={32} loading={false} />
      );

      expect(container.textContent).toContain('HOLD');
    });

    it('shows PASS verdict for negative distro ROI', () => {
      // totalValue < 30 for negative distro ROI
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={20} loading={false} />
      );

      expect(container.textContent).toContain('PASS');
    });
  });

  describe('value and MSRP display', () => {
    it('displays formatted total value', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={75.50} loading={false} />
      );

      expect(container.textContent).toContain('$75.50');
    });

    it('displays MSRP', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('$50.00');
      expect(container.textContent).toContain('MSRP');
    });

    it('displays distro cost with discount info', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('$30.00');
      expect(container.textContent).toContain('Distro Cost');
      expect(container.textContent).toContain('40% discount');
    });

    it('displays profit calculation', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('Profit');
      expect(container.textContent).toContain('+$30.00');
    });
  });

  describe('excluded cards warning', () => {
    it('shows warning when cards are excluded', () => {
      const { container } = render(
        <ROISummary
          deck={mockDeck}
          totalValue={60}
          loading={false}
          excludedCount={3}
        />
      );

      expect(container.textContent).toContain('3 cards excluded');
      expect(container.textContent).toContain('no price data');
    });

    it('uses singular form for one excluded card', () => {
      const { container } = render(
        <ROISummary
          deck={mockDeck}
          totalValue={60}
          loading={false}
          excludedCount={1}
        />
      );

      expect(container.textContent).toContain('1 card excluded');
    });

    it('does not show warning when no cards excluded', () => {
      const { container } = render(
        <ROISummary
          deck={mockDeck}
          totalValue={60}
          loading={false}
          excludedCount={0}
        />
      );

      expect(container.textContent).not.toContain('excluded');
    });

    it('does not show warning during loading', () => {
      const { container } = render(
        <ROISummary
          deck={mockDeck}
          totalValue={60}
          loading={true}
          excludedCount={5}
        />
      );

      expect(container.textContent).not.toContain('excluded');
    });
  });

  describe('ROI percentage display', () => {
    it('shows distro ROI percentage', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('Distro ROI');
      expect(container.textContent).toContain('%');
    });

    it('shows MSRP ROI percentage', () => {
      const { container } = render(
        <ROISummary deck={mockDeck} totalValue={60} loading={false} />
      );

      expect(container.textContent).toContain('vs MSRP');
    });
  });
});
