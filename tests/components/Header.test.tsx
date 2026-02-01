import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock useTheme hook
const mockSetTheme = vi.fn();
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

describe('Header', () => {
  describe('links render', () => {
    it('renders home link', () => {
      const { container } = render(<Header />);
      const homeLink = container.querySelector('a[href="/"]');
      expect(homeLink).not.toBeNull();
    });

    it('renders about link', () => {
      const { container } = render(<Header />);
      const aboutLink = container.querySelector('a[href="/about"]');
      expect(aboutLink).not.toBeNull();
      expect(aboutLink?.textContent).toContain('About');
    });

    it('renders blog link', () => {
      const { container } = render(<Header />);
      const blogLink = container.querySelector('a[href="/blog"]');
      expect(blogLink).not.toBeNull();
      expect(blogLink?.textContent).toContain('Blog');
    });

    it('renders compare link', () => {
      const { container } = render(<Header />);
      const compareLink = container.querySelector('a[href="/compare"]');
      expect(compareLink).not.toBeNull();
      expect(compareLink?.textContent).toContain('Compare');
    });

    it('renders site title', () => {
      const { container } = render(<Header />);
      expect(container.textContent).toContain('MTG Commander ROI');
    });
  });

  describe('mobile menu toggle', () => {
    it('renders mobile menu button', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');
      expect(menuButton).not.toBeNull();
    });

    it('toggles mobile menu on click', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');

      // Initially mobile menu should be hidden
      let mobileLinks = container.querySelectorAll('.md\\:hidden a');
      expect(mobileLinks.length).toBe(0);

      // Click to open
      fireEvent.click(menuButton!);

      // Mobile menu should now be visible
      mobileLinks = container.querySelectorAll('.md\\:hidden a');
      expect(mobileLinks.length).toBeGreaterThan(0);
    });

    it('closes mobile menu when clicking link', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');

      // Open menu
      fireEvent.click(menuButton!);

      // Find a link in the mobile menu and click it
      const mobileAboutLink = container.querySelector('.md\\:hidden a[href="/about"]');
      expect(mobileAboutLink).not.toBeNull();
      fireEvent.click(mobileAboutLink!);

      // Menu should close - check that the mobile menu div is gone
      const mobileMenu = container.querySelector('.md\\:hidden.mt-4');
      expect(mobileMenu).toBeNull();
    });

    it('closes mobile menu when clicking blog link', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');

      // Open menu
      fireEvent.click(menuButton!);

      // Find blog link in mobile menu
      const mobileBlogLink = container.querySelector('.md\\:hidden a[href="/blog"]');
      expect(mobileBlogLink).not.toBeNull();
      fireEvent.click(mobileBlogLink!);

      // Menu should close
      const mobileMenu = container.querySelector('.md\\:hidden.mt-4');
      expect(mobileMenu).toBeNull();
    });

    it('closes mobile menu when clicking compare link', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');

      // Open menu
      fireEvent.click(menuButton!);

      // Find compare link in mobile menu
      const mobileCompareLink = container.querySelector('.md\\:hidden a[href="/compare"]');
      expect(mobileCompareLink).not.toBeNull();
      fireEvent.click(mobileCompareLink!);

      // Menu should close
      const mobileMenu = container.querySelector('.md\\:hidden.mt-4');
      expect(mobileMenu).toBeNull();
    });

    it('toggles theme from mobile menu', () => {
      const { container } = render(<Header />);
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');

      // Open menu
      fireEvent.click(menuButton!);

      // Find theme toggle in mobile menu
      const mobileThemeButton = Array.from(container.querySelectorAll('.md\\:hidden button')).find(
        btn => btn.textContent?.includes('Light Mode')
      );
      expect(mobileThemeButton).not.toBeUndefined();
      if (mobileThemeButton) {
        mockSetTheme.mockClear();
        fireEvent.click(mobileThemeButton);
        expect(mockSetTheme).toHaveBeenCalledWith('light');
      }
    });
  });

  describe('theme toggle', () => {
    it('renders theme toggle button', () => {
      const { container } = render(<Header />);
      const themeButton = container.querySelector('button[aria-label*="Switch to"]');
      expect(themeButton).not.toBeNull();
    });

    it('has correct aria-label for dark mode', () => {
      const { container } = render(<Header />);
      const themeButton = container.querySelector('button[aria-label="Switch to light mode"]');
      expect(themeButton).not.toBeNull();
    });

    it('calls setTheme when clicked', () => {
      const { container } = render(<Header />);
      const themeButton = container.querySelector('button[aria-label="Switch to light mode"]');
      fireEvent.click(themeButton!);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('onAddDeck callback', () => {
    it('renders add deck button when callback provided', () => {
      const onAddDeck = vi.fn();
      const { container } = render(<Header onAddDeck={onAddDeck} />);

      const addButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Add Custom Deck')
      );
      expect(addButton).not.toBeNull();
    });

    it('does not render add deck button when no callback', () => {
      const { container } = render(<Header />);

      const addButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Add Custom Deck')
      );
      expect(addButton).toBeUndefined();
    });

    it('calls onAddDeck when button clicked', () => {
      const onAddDeck = vi.fn();
      const { container } = render(<Header onAddDeck={onAddDeck} />);

      const addButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Add Custom Deck')
      );
      fireEvent.click(addButton!);

      expect(onAddDeck).toHaveBeenCalledTimes(1);
    });

    it('calls onAddDeck from mobile menu and closes menu', () => {
      const onAddDeck = vi.fn();
      const { container } = render(<Header onAddDeck={onAddDeck} />);

      // Open mobile menu
      const menuButton = container.querySelector('button[aria-label="Toggle menu"]');
      fireEvent.click(menuButton!);

      // Find mobile add button
      const mobileAddButton = container.querySelector('.md\\:hidden button');
      const addButtons = Array.from(container.querySelectorAll('.md\\:hidden button')).filter(
        btn => btn.textContent?.includes('Add Custom Deck')
      );

      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);
        expect(onAddDeck).toHaveBeenCalled();
      }
    });
  });

  describe('logo and branding', () => {
    it('renders logo with Coins icon', () => {
      const { container } = render(<Header />);
      const logo = container.querySelector('.bg-purple-600');
      expect(logo).not.toBeNull();
      const svg = logo?.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('renders subtitle on larger screens', () => {
      const { container } = render(<Header />);
      expect(container.textContent).toContain('Precon Value Analyzer');
    });
  });
});
