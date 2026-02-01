import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import Tooltip from '@/components/ui/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders children', () => {
      const { container } = render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(container.textContent).toContain('Hover me');
    });

    it('does not show tooltip initially', () => {
      const { container } = render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(container.textContent).not.toContain('Tooltip text');
    });
  });

  describe('show/hide behavior', () => {
    it('shows tooltip on mouse enter after delay', async () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={300}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
      });

      // Not visible yet
      expect(container.textContent).not.toContain('Tooltip text');

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(container.textContent).toContain('Tooltip text');
    });

    it('hides tooltip on mouse leave', async () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');

      // Show tooltip
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.textContent).toContain('Tooltip text');

      // Hide tooltip
      act(() => {
        fireEvent.mouseLeave(trigger!);
      });

      expect(container.textContent).not.toContain('Tooltip text');
    });

    it('shows tooltip on focus', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');

      act(() => {
        fireEvent.focus(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.textContent).toContain('Tooltip text');
    });

    it('hides tooltip on blur', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');

      act(() => {
        fireEvent.focus(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.textContent).toContain('Tooltip text');

      act(() => {
        fireEvent.blur(trigger!);
      });

      expect(container.textContent).not.toContain('Tooltip text');
    });

    it('cancels show if mouse leaves before delay', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={300}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');

      act(() => {
        fireEvent.mouseEnter(trigger!);
      });

      // Leave before delay completes
      act(() => {
        vi.advanceTimersByTime(100);
        fireEvent.mouseLeave(trigger!);
      });

      // Complete original delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(container.textContent).not.toContain('Tooltip text');
    });
  });

  describe('positioning', () => {
    it('positions tooltip on top by default', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip?.className).toContain('bottom-full');
    });

    it('positions tooltip on bottom when specified', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" side="bottom" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip?.className).toContain('top-full');
    });

    it('positions tooltip on left when specified', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" side="left" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip?.className).toContain('right-full');
    });

    it('positions tooltip on right when specified', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" side="right" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip?.className).toContain('left-full');
    });
  });

  describe('custom delay', () => {
    it('respects custom delay', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
      });

      // Not visible at 400ms
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(container.textContent).not.toContain('Tooltip text');

      // Visible at 500ms
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(container.textContent).toContain('Tooltip text');
    });
  });

  describe('accessibility', () => {
    it('has role="tooltip"', () => {
      const { container } = render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.querySelector('[role="tooltip"]')).not.toBeNull();
    });
  });

  describe('content rendering', () => {
    it('renders string content', () => {
      const { container } = render(
        <Tooltip content="Simple text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.textContent).toContain('Simple text');
    });

    it('renders complex content', () => {
      const { container } = render(
        <Tooltip content={<span data-testid="complex">Complex content</span>} delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
        vi.advanceTimersByTime(0);
      });

      expect(container.textContent).toContain('Complex content');
    });
  });

  describe('cleanup', () => {
    it('cleans up timeout on unmount', () => {
      const { container, unmount } = render(
        <Tooltip content="Tooltip text" delay={300}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = container.querySelector('.relative.inline-flex');
      act(() => {
        fireEvent.mouseEnter(trigger!);
      });

      // Unmount before delay completes
      unmount();

      // Should not throw
      act(() => {
        vi.advanceTimersByTime(500);
      });
    });
  });
});
