import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import BulkImport from '@/components/BulkImport';
import type { ScryfallCard } from '@/types';

// Mock scryfall module
vi.mock('@/lib/scryfall', () => ({
  getCardsByNames: vi.fn(),
}));

const mockCards: ScryfallCard[] = [
  { id: '1', name: 'Sol Ring', set_name: 'Commander Masters' } as ScryfallCard,
  { id: '2', name: 'Command Tower', set_name: 'Commander Legends' } as ScryfallCard,
];

describe('BulkImport', () => {
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('textarea input', () => {
    it('renders textarea', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea');
      expect(textarea).not.toBeNull();
      expect(textarea?.getAttribute('placeholder')).toContain('Paste decklist here');
    });

    it('has aria-label for accessibility', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const label = container.querySelector('label[for="bulk-import-input"]');
      expect(label).not.toBeNull();
    });

    it('updates value on input', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '1 Sol Ring\n1 Command Tower' } });

      expect(textarea.value).toBe('1 Sol Ring\n1 Command Tower');
    });

    it('has maxLength attribute', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea');
      expect(textarea?.getAttribute('maxLength')).toBe('50000');
    });
  });

  describe('parse callback', () => {
    it('parses standard decklist format', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: mockCards,
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '1 Sol Ring\n1 Command Tower' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(getCardsByNames).toHaveBeenCalledWith(
          ['Sol Ring', 'Command Tower'],
          expect.any(Function)
        );
      });
    });

    it('parses format without quantity', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: mockCards.slice(0, 1),
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Sol Ring' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(getCardsByNames).toHaveBeenCalled();
      });
    });

    it('handles "x" in quantity format', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: mockCards.slice(0, 1),
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '2x Sol Ring' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalled();
        // Should have 2 copies of Sol Ring
        const importedCards = mockOnImport.mock.calls[0][0];
        expect(importedCards.length).toBe(2);
      });
    });
  });

  describe('import button', () => {
    it('is disabled when textarea is empty', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const importButton = container.querySelector('button');
      expect(importButton?.hasAttribute('disabled')).toBe(true);
    });

    it('is enabled when textarea has content', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Sol Ring' } });

      const importButton = container.querySelector('button');
      expect(importButton?.hasAttribute('disabled')).toBe(false);
    });

    it('shows loading state during import', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Sol Ring' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      expect(container.textContent).toContain('Importing…');
    });
  });

  describe('warning messages', () => {
    it('shows warning when decklist exceeds max cards', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: [],
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      // Create decklist with 160 cards
      const manyCards = Array.from({ length: 160 }, (_, i) => `Card ${i}`).join('\n');
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: manyCards } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Decklist truncated from 160 to 150 cards');
      });
    });

    it('shows warning for not found cards', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: [],
        notFound: ['Nonexistent Card'],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Nonexistent Card' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('not found');
      });
    });
  });

  describe('progress display', () => {
    it('shows progress bar during loading', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockImplementation(
        (names, progressCallback) => {
          // Simulate progress
          progressCallback(1, 2);
          return new Promise(() => {}); // Never resolves
        }
      );

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Sol Ring\nCommand Tower' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      expect(container.textContent).toContain('Loading card');
    });
  });

  describe('onImport callback', () => {
    it('calls onImport with found cards', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: mockCards,
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '1 Sol Ring\n1 Command Tower' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalled();
        const importedCards = mockOnImport.mock.calls[0][0];
        expect(importedCards.length).toBe(2);
      });
    });

    it('clears textarea after successful import', async () => {
      const { getCardsByNames } = await import('@/lib/scryfall');
      (getCardsByNames as ReturnType<typeof vi.fn>).mockResolvedValue({
        found: mockCards,
        notFound: [],
      });

      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '1 Sol Ring' } });

      const importButton = container.querySelector('button');
      await act(async () => {
        fireEvent.click(importButton!);
      });

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('header', () => {
    it('shows Bulk Import header', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      expect(container.textContent).toContain('Bulk Import');
    });

    it('shows FileText icon', () => {
      const { container } = render(<BulkImport onImport={mockOnImport} />);

      const svg = container.querySelector('h3 svg');
      expect(svg).not.toBeNull();
    });
  });
});
