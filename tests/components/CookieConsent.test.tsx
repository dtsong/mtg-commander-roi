import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import CookieConsent from '@/components/CookieConsent';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('CookieConsent', () => {
  let mockStorage: Record<string, string>;
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockStorage = {};
    mockGtag = vi.fn();

    // Mock localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
        removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
      },
      writable: true,
      configurable: true,
    });

    // Mock window.gtag
    Object.defineProperty(globalThis, 'gtag', {
      value: mockGtag,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('renders banner', () => {
    it('shows banner when no consent stored', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
        expect(container.textContent).toContain('Privacy Policy');
      });
    });

    it('does not show banner when accepted', async () => {
      mockStorage['cookie-consent'] = 'accepted';

      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('does not show banner when rejected', async () => {
      mockStorage['cookie-consent'] = 'rejected';

      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('accept handler', () => {
    it('hides banner on accept', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const acceptButton = container.querySelector('button:last-child');
      expect(acceptButton?.textContent).toContain('Accept');

      await act(async () => {
        fireEvent.click(acceptButton!);
      });

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('stores accepted consent in localStorage', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const acceptButton = container.querySelector('button:last-child');

      await act(async () => {
        fireEvent.click(acceptButton!);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'accepted');
    });

    it('updates gtag consent to granted', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const acceptButton = container.querySelector('button:last-child');

      await act(async () => {
        fireEvent.click(acceptButton!);
      });

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    });
  });

  describe('reject handler', () => {
    it('hides banner on reject', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const rejectButton = container.querySelector('button:first-of-type');
      expect(rejectButton?.textContent).toContain('Reject');

      await act(async () => {
        fireEvent.click(rejectButton!);
      });

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('stores rejected consent in localStorage', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const rejectButton = container.querySelector('button:first-of-type');

      await act(async () => {
        fireEvent.click(rejectButton!);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'rejected');
    });

    it('updates gtag consent to denied', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        expect(container.textContent).toContain('We use cookies');
      });

      const rejectButton = container.querySelector('button:first-of-type');

      await act(async () => {
        fireEvent.click(rejectButton!);
      });

      expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      });
    });
  });

  describe('localStorage persistence', () => {
    it('updates gtag on mount when previously accepted', async () => {
      mockStorage['cookie-consent'] = 'accepted';

      render(<CookieConsent />);

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      });
    });

    it('updates gtag on mount when previously rejected', async () => {
      mockStorage['cookie-consent'] = 'rejected';

      render(<CookieConsent />);

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
        });
      });
    });
  });

  describe('privacy policy link', () => {
    it('renders link to privacy policy', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        const link = container.querySelector('a[href="/privacy"]');
        expect(link).not.toBeNull();
        expect(link?.textContent).toBe('Privacy Policy');
      });
    });
  });

  describe('styling', () => {
    it('has fixed positioning at bottom', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        const banner = container.firstChild as HTMLElement;
        expect(banner?.className).toContain('fixed');
        expect(banner?.className).toContain('bottom-0');
      });
    });

    it('has high z-index', async () => {
      const { container } = render(<CookieConsent />);

      await waitFor(() => {
        const banner = container.firstChild as HTMLElement;
        expect(banner?.className).toContain('z-50');
      });
    });
  });
});
