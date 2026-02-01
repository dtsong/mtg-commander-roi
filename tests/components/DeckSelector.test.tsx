import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import DeckSelector from '@/components/DeckSelector';
import type { PreconDeck } from '@/types';

const mockDecks: PreconDeck[] = [
  { id: 'deck-1', name: 'Deck One', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['W', 'U'], edhrec: 'deck-one' },
  { id: 'deck-2', name: 'Deck Two', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['B', 'R'], edhrec: 'deck-two' },
  { id: 'deck-3', name: 'Deck Three', set: 'Set B', year: 2023, msrp: 45, setCode: 'b', colors: ['G'], edhrec: 'deck-three' },
];

vi.mock('@/lib/precons', () => {
  const decks = [
    { id: 'deck-1', name: 'Deck One', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['W', 'U'], edhrec: 'deck-one' },
    { id: 'deck-2', name: 'Deck Two', set: 'Set A', year: 2024, msrp: 50, setCode: 'a', colors: ['B', 'R'], edhrec: 'deck-two' },
    { id: 'deck-3', name: 'Deck Three', set: 'Set B', year: 2023, msrp: 45, setCode: 'b', colors: ['G'], edhrec: 'deck-three' },
  ];
  return {
    getYears: () => [2024, 2023],
    getPreconsByYear: (year: number) => decks.filter(d => d.year === year),
    PRECON_DATABASE: decks,
  };
});

describe('DeckSelector', () => {
  const defaultProps = {
    selectedYear: null,
    setSelectedYear: vi.fn(),
    selectedSet: null,
    setSelectedSet: vi.fn(),
    selectedDeck: null,
    setSelectedDeck: vi.fn(),
    customDecks: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('year filtering', () => {
    it('renders year filter dropdown', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      const yearSelect = container.querySelectorAll('select')[0];
      expect(yearSelect).not.toBeNull();
      expect(yearSelect.textContent).toContain('All Years');
      expect(yearSelect.textContent).toContain('2024');
      expect(yearSelect.textContent).toContain('2023');
    });

    it('calls setSelectedYear when year changes', () => {
      const setSelectedYear = vi.fn();
      const { container } = render(
        <DeckSelector {...defaultProps} setSelectedYear={setSelectedYear} />
      );

      const yearSelect = container.querySelectorAll('select')[0];
      fireEvent.change(yearSelect, { target: { value: '2024' } });

      expect(setSelectedYear).toHaveBeenCalledWith(2024);
    });

    it('calls setSelectedSet(null) when year changes', () => {
      const setSelectedSet = vi.fn();
      const { container } = render(
        <DeckSelector {...defaultProps} setSelectedSet={setSelectedSet} />
      );

      const yearSelect = container.querySelectorAll('select')[0];
      fireEvent.change(yearSelect, { target: { value: '2024' } });

      expect(setSelectedSet).toHaveBeenCalledWith(null);
    });

    it('shows All Years option', () => {
      const setSelectedYear = vi.fn();
      const { container } = render(
        <DeckSelector {...defaultProps} selectedYear={2024} setSelectedYear={setSelectedYear} />
      );

      const yearSelect = container.querySelectorAll('select')[0];
      fireEvent.change(yearSelect, { target: { value: '' } });

      expect(setSelectedYear).toHaveBeenCalledWith(null);
    });
  });

  describe('set filtering', () => {
    it('renders set filter dropdown', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      const setSelect = container.querySelectorAll('select')[1];
      expect(setSelect).not.toBeNull();
      expect(setSelect.textContent).toContain('All Sets');
    });

    it('shows filtered sets based on year', () => {
      const { container } = render(
        <DeckSelector {...defaultProps} selectedYear={2024} />
      );

      const setSelect = container.querySelectorAll('select')[1];
      expect(setSelect.textContent).toContain('Set A');
      // Set B is from 2023, should not appear
      expect(setSelect.textContent).not.toContain('Set B');
    });

    it('calls setSelectedSet when set changes', () => {
      const setSelectedSet = vi.fn();
      const { container } = render(
        <DeckSelector {...defaultProps} setSelectedSet={setSelectedSet} />
      );

      const setSelect = container.querySelectorAll('select')[1];
      fireEvent.change(setSelect, { target: { value: 'Set A' } });

      expect(setSelectedSet).toHaveBeenCalledWith('Set A');
    });
  });

  describe('deck selection callback', () => {
    it('shows deck buttons', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      const deckButtons = container.querySelectorAll('button[class*="text-left"]');
      expect(deckButtons.length).toBe(3);
    });

    it('calls setSelectedDeck when deck clicked', () => {
      const setSelectedDeck = vi.fn();
      const { container } = render(
        <DeckSelector {...defaultProps} setSelectedDeck={setSelectedDeck} />
      );

      const deckButtons = container.querySelectorAll('button[class*="text-left"]');
      fireEvent.click(deckButtons[0]);

      expect(setSelectedDeck).toHaveBeenCalledWith(mockDecks[0]);
    });

    it('highlights selected deck', () => {
      const { container } = render(
        <DeckSelector {...defaultProps} selectedDeck={mockDecks[0]} />
      );

      const deckButtons = container.querySelectorAll('button[class*="text-left"]');
      const selectedButton = deckButtons[0];

      expect(selectedButton.className).toContain('bg-purple');
      expect(selectedButton.className).toContain('border-purple');
    });

    it('filters decks by selected set', () => {
      const { container } = render(
        <DeckSelector {...defaultProps} selectedSet="Set A" />
      );

      const deckButtons = container.querySelectorAll('button[class*="text-left"]');
      // Only decks from Set A should appear (deck-1 and deck-2)
      expect(deckButtons.length).toBe(2);
      expect(container.textContent).toContain('Deck One');
      expect(container.textContent).toContain('Deck Two');
      expect(container.textContent).not.toContain('Deck Three');
    });
  });

  describe('deck display', () => {
    it('shows deck name', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      expect(container.textContent).toContain('Deck One');
      expect(container.textContent).toContain('Deck Two');
      expect(container.textContent).toContain('Deck Three');
    });

    it('shows deck set', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      expect(container.textContent).toContain('Set A');
      expect(container.textContent).toContain('Set B');
    });

    it('shows deck MSRP', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      expect(container.textContent).toContain('$50');
      expect(container.textContent).toContain('$45');
    });

    it('shows ColorIndicator for each deck', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      // Check for color indicators
      expect(container.textContent).toContain('W');
      expect(container.textContent).toContain('U');
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('R');
      expect(container.textContent).toContain('G');
    });
  });

  describe('custom decks section', () => {
    it('does not show custom decks section when empty', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      expect(container.textContent).not.toContain('Custom Decks');
    });

    it('shows custom decks section when custom decks exist', () => {
      const customDecks: PreconDeck[] = [
        { id: 'custom-1', name: 'My Custom Deck', set: 'Custom', year: 2024, msrp: 100, setCode: 'cst', colors: ['W'], edhrec: '' },
      ];

      const { container } = render(
        <DeckSelector {...defaultProps} customDecks={customDecks} />
      );

      expect(container.textContent).toContain('Custom Decks');
      expect(container.textContent).toContain('My Custom Deck');
    });

    it('allows selecting custom deck', () => {
      const setSelectedDeck = vi.fn();
      const customDecks: PreconDeck[] = [
        { id: 'custom-1', name: 'My Custom Deck', set: 'Custom', year: 2024, msrp: 100, setCode: 'cst', colors: ['W'], edhrec: '' },
      ];

      const { container } = render(
        <DeckSelector {...defaultProps} customDecks={customDecks} setSelectedDeck={setSelectedDeck} />
      );

      // Find custom deck button
      const customSection = container.querySelector('.border-t.border-slate-700');
      const customButton = customSection?.querySelector('button');
      fireEvent.click(customButton!);

      expect(setSelectedDeck).toHaveBeenCalledWith(customDecks[0]);
    });
  });

  describe('header', () => {
    it('shows Select Deck header', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      expect(container.textContent).toContain('Select Deck');
    });

    it('shows Package icon', () => {
      const { container } = render(<DeckSelector {...defaultProps} />);

      const svg = container.querySelector('h2 svg');
      expect(svg).not.toBeNull();
    });
  });
});
