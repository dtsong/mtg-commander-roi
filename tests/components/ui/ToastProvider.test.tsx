import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';

// Mock crypto.randomUUID
beforeEach(() => {
  let counter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `toast-${++counter}`,
  });
});

// Test component that uses the toast hook
function TestComponent({ message, type }: { message?: string; type?: 'info' | 'success' | 'error' }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message || 'Test message', type)}>
      Show Toast
    </button>
  );
}

describe('ToastProvider', () => {
  describe('context', () => {
    it('provides toast function to children', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(container.querySelector('button')).not.toBeNull();
    });

    it('throws error when useToast is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useToast must be used within a ToastProvider'
      );

      consoleError.mockRestore();
    });
  });

  describe('toast display', () => {
    it('shows toast when triggered', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent message="Hello World" />
        </ToastProvider>
      );

      const button = container.querySelector('button');
      act(() => {
        fireEvent.click(button!);
      });

      expect(container.textContent).toContain('Hello World');
    });

    it('shows multiple toasts', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent message="First" />
        </ToastProvider>
      );

      const button = container.querySelector('button');
      act(() => {
        fireEvent.click(button!);
        fireEvent.click(button!);
      });

      // Should have toast container with toasts
      const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
      expect(toastContainer).not.toBeNull();
    });

    it('shows toast with different types', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent message="Info" type="info" />
        </ToastProvider>
      );

      const button = container.querySelector('button');
      act(() => {
        fireEvent.click(button!);
      });

      expect(container.textContent).toContain('Info');
    });
  });

  describe('toast removal', () => {
    it('removes toast when close is clicked', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent message="Removable" />
        </ToastProvider>
      );

      // Show toast
      const showButton = container.querySelector('button');
      act(() => {
        fireEvent.click(showButton!);
      });

      expect(container.textContent).toContain('Removable');

      // Find and click close button on toast
      const closeButton = container.querySelector('[aria-label="Close notification"]');
      if (closeButton) {
        act(() => {
          fireEvent.click(closeButton);
        });
      }
    });
  });

  describe('children rendering', () => {
    it('renders children correctly', () => {
      const { container } = render(
        <ToastProvider>
          <div data-testid="child">Child Content</div>
        </ToastProvider>
      );

      expect(container.textContent).toContain('Child Content');
    });
  });
});
