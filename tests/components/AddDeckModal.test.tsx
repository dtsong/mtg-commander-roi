import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import AddDeckModal from '@/components/AddDeckModal';

describe('AddDeckModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = render(
        <AddDeckModal {...defaultProps} isOpen={false} />
      );

      expect(container.textContent).toBe('');
    });

    it('renders modal when open', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      expect(container.textContent).toContain('Add Custom Deck');
    });

    it('renders all form fields', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      expect(container.querySelector('input[placeholder*="My Custom Deck"]')).not.toBeNull();
      expect(container.querySelector('input[placeholder*="Commander 2024"]')).not.toBeNull();
      expect(container.querySelector('input[type="number"][min="2000"]')).not.toBeNull();
      expect(container.querySelector('input[placeholder="49.99"]')).not.toBeNull();
      expect(container.querySelector('input[placeholder="e.g., dsc"]')).not.toBeNull();
    });

    it('renders submit and cancel buttons', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      expect(container.textContent).toContain('Add Deck');
      expect(container.textContent).toContain('Cancel');
    });
  });

  describe('close button', () => {
    it('calls onClose when X button clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <AddDeckModal {...defaultProps} onClose={onClose} />
      );

      const closeButton = container.querySelector('button[aria-label="Close dialog"]');
      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <AddDeckModal {...defaultProps} onClose={onClose} />
      );

      const cancelButton = container.querySelector('button[type="button"]');
      fireEvent.click(cancelButton!);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls onAdd with deck data on submit', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();
      const { container } = render(
        <AddDeckModal {...defaultProps} onAdd={onAdd} onClose={onClose} />
      );

      // Fill form
      const nameInput = container.querySelector('input[placeholder*="My Custom Deck"]');
      const setInput = container.querySelector('input[placeholder*="Commander 2024"]');
      const msrpInput = container.querySelector('input[placeholder="49.99"]');
      const setCodeInput = container.querySelector('input[placeholder="e.g., dsc"]');

      fireEvent.change(nameInput!, { target: { value: 'Test Deck' } });
      fireEvent.change(setInput!, { target: { value: 'Test Set' } });
      fireEvent.change(msrpInput!, { target: { value: '99.99' } });
      fireEvent.change(setCodeInput!, { target: { value: 'TST' } });

      // Submit
      const form = container.querySelector('form');
      fireEvent.submit(form!);

      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Deck',
        set: 'Test Set',
        msrp: 99.99,
        setCode: 'tst', // lowercase
        isCustom: true,
      }));
      expect(onClose).toHaveBeenCalled();
    });

    it('uses default set name when not provided', () => {
      const onAdd = vi.fn();
      const { container } = render(
        <AddDeckModal {...defaultProps} onAdd={onAdd} />
      );

      const nameInput = container.querySelector('input[placeholder*="My Custom Deck"]');
      const msrpInput = container.querySelector('input[placeholder="49.99"]');

      fireEvent.change(nameInput!, { target: { value: 'Test Deck' } });
      fireEvent.change(msrpInput!, { target: { value: '50' } });

      const form = container.querySelector('form');
      fireEvent.submit(form!);

      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        set: 'Custom',
      }));
    });

    it('does not submit without required fields', () => {
      const onAdd = vi.fn();
      const { container } = render(
        <AddDeckModal {...defaultProps} onAdd={onAdd} />
      );

      const form = container.querySelector('form');
      fireEvent.submit(form!);

      expect(onAdd).not.toHaveBeenCalled();
    });

    it('resets form after submission', () => {
      const onAdd = vi.fn();
      const onClose = vi.fn();

      // Render twice to simulate reopening
      const { container, rerender } = render(
        <AddDeckModal isOpen={true} onAdd={onAdd} onClose={onClose} />
      );

      const nameInput = container.querySelector('input[placeholder*="My Custom Deck"]') as HTMLInputElement;
      const msrpInput = container.querySelector('input[placeholder="49.99"]') as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'Test Deck' } });
      fireEvent.change(msrpInput, { target: { value: '50' } });

      const form = container.querySelector('form');
      fireEvent.submit(form!);

      // Close and reopen
      rerender(<AddDeckModal isOpen={false} onAdd={onAdd} onClose={onClose} />);
      rerender(<AddDeckModal isOpen={true} onAdd={onAdd} onClose={onClose} />);

      const newNameInput = container.querySelector('input[placeholder*="My Custom Deck"]') as HTMLInputElement;
      expect(newNameInput.value).toBe('');
    });
  });

  describe('keyboard navigation', () => {
    it('closes on Escape key', () => {
      const onClose = vi.fn();
      render(<AddDeckModal {...defaultProps} onClose={onClose} />);

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('traps focus with Tab key', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, input'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Focus last element
      last.focus();

      // Tab should go to first
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(event);
      });

      // Shift+Tab from first should go to last
      first.focus();
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        document.dispatchEvent(event);
      });
    });
  });

  describe('accessibility', () => {
    it('has role="dialog"', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    });

    it('has aria-modal="true"', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      expect(container.querySelector('[aria-modal="true"]')).not.toBeNull();
    });

    it('has aria-labelledby pointing to title', () => {
      const { container } = render(<AddDeckModal {...defaultProps} />);

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-labelledby')).toBe('add-deck-title');
      expect(container.querySelector('[id="add-deck-title"]')).not.toBeNull();
    });
  });
});
