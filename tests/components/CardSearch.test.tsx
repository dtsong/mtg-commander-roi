import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import CardSearch from '@/components/CardSearch';

// Mock modules
vi.mock('@/lib/scryfall', () => ({
  searchCards: vi.fn(),
  getCardImage: vi.fn(() => 'https://example.com/card.jpg'),
  getCardPrice: vi.fn(() => 1.99),
}));

vi.mock('@/lib/calculations', () => ({
  formatCurrency: vi.fn((val) => `$${val.toFixed(2)}`),
}));

vi.mock('@/components/ui/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockCards = [
  { id: '1', name: 'Sol Ring', set_name: 'Commander Masters' },
  { id: '2', name: 'Command Tower', set_name: 'Commander Legends' },
];

describe('CardSearch', () => {
  const mockOnAddCard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('input handling', () => {
    it('renders search input', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
      expect(input?.getAttribute('placeholder')).toContain('Search by card name');
    });

    it('updates query on input change', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      expect(input.value).toBe('Sol Ring');
    });

    it('has aria-label for accessibility', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input');
      expect(input?.getAttribute('aria-label')).toBe('Search cards by name');
    });
  });

  describe('search callback', () => {
    it('triggers search on button click', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(mockCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      expect(searchCards).toHaveBeenCalledWith('Sol Ring');
    });

    it('triggers search on Enter key', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(mockCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(searchCards).toHaveBeenCalledWith('Sol Ring');
    });

    it('does not search with less than 2 characters', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'S' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      expect(searchCards).not.toHaveBeenCalled();
    });

    it('disables search button when query is too short', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'S' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      expect(searchButton?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('clear button', () => {
    it('shows clear button when query is not empty', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      const clearButton = container.querySelector('button[aria-label="Clear search"]');
      expect(clearButton).not.toBeNull();
    });

    it('hides clear button when query is empty', () => {
      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const clearButton = container.querySelector('button[aria-label="Clear search"]');
      expect(clearButton).toBeNull();
    });

    it('clears query and results when clicked', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(mockCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      // Search for something first
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      // Wait for results
      await waitFor(() => {
        expect(container.textContent).toContain('Sol Ring');
      });

      // Click clear
      const clearButton = container.querySelector('button[aria-label="Clear search"]');
      fireEvent.click(clearButton!);

      // Query should be cleared
      expect(input.value).toBe('');
      // Results should be cleared
      expect(container.textContent).not.toContain('Commander Masters');
    });
  });

  describe('results display', () => {
    it('displays search results', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(mockCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Sol Ring');
        expect(container.textContent).toContain('Command Tower');
      });
    });

    it('limits results to 10 cards', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      const manyCards = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        name: `Card ${i}`,
        set_name: 'Test Set',
      }));
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(manyCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Card' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      await waitFor(() => {
        // Should only show 10 results
        const results = container.querySelectorAll('[class*="bg-slate-700/30"]');
        expect(results.length).toBe(10);
      });
    });
  });

  describe('error handling', () => {
    it('shows error message on search failure', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol Ring' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Failed to search cards');
      });
    });
  });

  describe('add card callback', () => {
    it('calls onAddCard when plus button clicked', async () => {
      const { searchCards } = await import('@/lib/scryfall');
      (searchCards as ReturnType<typeof vi.fn>).mockResolvedValue(mockCards);

      const { container } = render(<CardSearch onAddCard={mockOnAddCard} />);

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Sol' } });

      const searchButton = container.querySelector('button:not([aria-label])');
      await act(async () => {
        fireEvent.click(searchButton!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Sol Ring');
      });

      // Click add button on first result
      const addButton = container.querySelector('button[title="Add to deck"]');
      fireEvent.click(addButton!);

      expect(mockOnAddCard).toHaveBeenCalledWith(mockCards[0]);
    });
  });
});
