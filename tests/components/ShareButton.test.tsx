import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ShareButton from '@/components/ShareButton';

describe('ShareButton', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window.location.origin
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
        location: {
          origin: 'https://example.com',
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  describe('copy fallback (no navigator.share)', () => {
    beforeEach(() => {
      // Mock navigator without share
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: vi.fn().mockResolvedValue(undefined),
          },
        },
        writable: true,
      });
    });

    it('shows Copy icon when share API not available', () => {
      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      // Should have copy icon, not share icon
      const button = container.querySelector('button');
      expect(button?.getAttribute('title')).toBe('Copy link');
      expect(button?.getAttribute('aria-label')).toBe('Copy link to clipboard');
    });

    it('copies URL to clipboard on click', async () => {
      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/deck/test-deck'
      );
    });
  });

  describe('copied state change', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: vi.fn().mockResolvedValue(undefined),
          },
        },
        writable: true,
      });
    });

    it('shows Check icon after copying', async () => {
      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      // Should show green check icon
      const svg = container.querySelector('svg');
      expect(svg?.classList.contains('text-green-400')).toBe(true);
    });

    it('reverts to Copy icon after 2 seconds', async () => {
      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      // Check icon should be shown
      let svg = container.querySelector('svg');
      expect(svg?.classList.contains('text-green-400')).toBe(true);

      // Advance time
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should revert to copy icon
      svg = container.querySelector('svg');
      expect(svg?.classList.contains('text-green-400')).toBe(false);
    });
  });

  describe('share API call (mock)', () => {
    it('calls navigator.share when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(global, 'navigator', {
        value: {
          share: mockShare,
          clipboard: {
            writeText: vi.fn(),
          },
        },
        writable: true,
      });

      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Deck - MTG Commander ROI',
        url: 'https://example.com/deck/test-deck',
      });
    });

    it('shows Share icon when share API available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          share: vi.fn(),
        },
        writable: true,
      });

      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      expect(button?.getAttribute('title')).toBe('Share deck');
    });

    it('falls back to clipboard when share is aborted', async () => {
      const mockShare = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'));
      const mockClipboard = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(global, 'navigator', {
        value: {
          share: mockShare,
          clipboard: {
            writeText: mockClipboard,
          },
        },
        writable: true,
      });

      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      // Should not fall back to clipboard for AbortError
      expect(mockClipboard).not.toHaveBeenCalled();
    });

    it('falls back to clipboard on share error', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'));
      const mockClipboard = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(global, 'navigator', {
        value: {
          share: mockShare,
          clipboard: {
            writeText: mockClipboard,
          },
        },
        writable: true,
      });

      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      await act(async () => {
        fireEvent.click(button!);
      });

      expect(mockClipboard).toHaveBeenCalled();
    });
  });

  describe('button styling', () => {
    it('has minimum touch target size', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: vi.fn(),
          },
        },
        writable: true,
      });

      const { container } = render(
        <ShareButton deckId="test-deck" deckName="Test Deck" />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('min-h-[44px]');
      expect(button?.className).toContain('min-w-[44px]');
    });
  });

});
