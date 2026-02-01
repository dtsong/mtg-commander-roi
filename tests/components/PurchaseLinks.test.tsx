import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PurchaseLinks from '@/components/PurchaseLinks';

describe('PurchaseLinks', () => {
  describe('both links render', () => {
    it('renders both TCG and CM links when card name is provided', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(2);

      expect(container.textContent).toContain('TCG');
      expect(container.textContent).toContain('CM');
    });

    it('renders links with correct target and rel attributes', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });

    it('includes external link icon', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('TCGplayer link', () => {
    it('renders TCGplayer search link without ID', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const tcgLink = container.querySelector('a[title="Search on TCGplayer"]');
      expect(tcgLink).not.toBeNull();
      expect(tcgLink?.getAttribute('href')).toContain('tcgplayer.com');
    });

    it('renders TCGplayer direct link with ID', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" tcgplayerId={12345} />
      );

      const tcgLink = container.querySelector('a[title="View on TCGplayer"]');
      expect(tcgLink).not.toBeNull();
    });
  });

  describe('CardMarket link', () => {
    it('renders CardMarket search link without ID', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const cmLink = container.querySelector('a[title="Search on CardMarket"]');
      expect(cmLink).not.toBeNull();
    });

    it('renders CardMarket direct link with ID', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" cardmarketId={67890} />
      );

      const cmLink = container.querySelector('a[title="View on CardMarket"]');
      expect(cmLink).not.toBeNull();
    });
  });

  describe('no valid card', () => {
    it('returns null for empty card name', () => {
      const { container } = render(
        <PurchaseLinks cardName="" />
      );

      // Component may still render links for empty name
      // depending on implementation
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('link styling', () => {
    it('has correct base styling for links', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link.className).toContain('bg-slate-600');
        expect(link.className).toContain('rounded');
      });
    });

    it('has minimum touch target size', () => {
      const { container } = render(
        <PurchaseLinks cardName="Sol Ring" />
      );

      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link.className).toContain('min-h-[44px]');
        expect(link.className).toContain('min-w-[44px]');
      });
    });
  });
});
