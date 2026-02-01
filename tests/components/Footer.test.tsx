import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Footer from '@/components/Footer';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock PriceDataTimestamp component
vi.mock('@/components/PriceDataTimestamp', () => ({
  default: () => <div data-testid="price-timestamp">Mock Timestamp</div>,
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  describe('links render', () => {
    it('renders Home link', () => {
      const { container } = render(<Footer />);
      const homeLink = container.querySelector('a[href="/"]');
      expect(homeLink).not.toBeNull();
      expect(homeLink?.textContent).toBe('Home');
    });

    it('renders Compare Decks link', () => {
      const { container } = render(<Footer />);
      const compareLink = container.querySelector('a[href="/compare"]');
      expect(compareLink).not.toBeNull();
      expect(compareLink?.textContent).toBe('Compare Decks');
    });

    it('renders Blog link', () => {
      const { container } = render(<Footer />);
      const blogLink = container.querySelector('a[href="/blog"]');
      expect(blogLink).not.toBeNull();
      expect(blogLink?.textContent).toBe('Blog');
    });

    it('renders About Us link', () => {
      const { container } = render(<Footer />);
      const aboutLink = container.querySelector('a[href="/about"]');
      expect(aboutLink).not.toBeNull();
      expect(aboutLink?.textContent).toBe('About Us');
    });

    it('renders Contact link', () => {
      const { container } = render(<Footer />);
      const contactLink = container.querySelector('a[href="/contact"]');
      expect(contactLink).not.toBeNull();
      expect(contactLink?.textContent).toBe('Contact');
    });

    it('renders Privacy Policy link', () => {
      const { container } = render(<Footer />);
      const privacyLink = container.querySelector('a[href="/privacy"]');
      expect(privacyLink).not.toBeNull();
      expect(privacyLink?.textContent).toBe('Privacy Policy');
    });

    it('renders Terms of Service link', () => {
      const { container } = render(<Footer />);
      const termsLink = container.querySelector('a[href="/terms"]');
      expect(termsLink).not.toBeNull();
      expect(termsLink?.textContent).toBe('Terms of Service');
    });
  });

  describe('current year', () => {
    it('displays current year in copyright', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('2024');
      expect(container.textContent).toContain('MTG Commander ROI');
      expect(container.textContent).toContain('All rights reserved');
    });
  });

  describe('PriceDataTimestamp presence', () => {
    it('renders PriceDataTimestamp component', () => {
      const { container } = render(<Footer />);
      const timestamp = container.querySelector('[data-testid="price-timestamp"]');
      expect(timestamp).not.toBeNull();
    });
  });

  describe('Scryfall attribution', () => {
    it('includes Scryfall credit with link', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('Scryfall');

      const scryfallLink = container.querySelector('a[href="https://scryfall.com"]');
      expect(scryfallLink).not.toBeNull();
      expect(scryfallLink?.getAttribute('target')).toBe('_blank');
      expect(scryfallLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('includes disclaimer about Wizards of the Coast', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('not affiliated with Wizards of the Coast');
    });
  });

  describe('section headers', () => {
    it('renders Quick Links section', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('Quick Links');
    });

    it('renders About section', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('About');
    });

    it('renders Legal section', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).toContain('Legal');
    });
  });

  describe('layout', () => {
    it('uses grid layout for sections', () => {
      const { container } = render(<Footer />);
      const grid = container.querySelector('.grid');
      expect(grid).not.toBeNull();
    });

    it('has border-t for top border', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer?.className).toContain('border-t');
    });
  });
});
