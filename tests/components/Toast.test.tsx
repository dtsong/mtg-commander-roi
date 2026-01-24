import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Toast } from '@/components/ui/Toast';

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message text', () => {
    const { container } = render(
      <Toast message="Test message" type="success" onClose={() => {}} />
    );
    expect(container.textContent).toContain('Test message');
  });

  it('renders with role="status" and aria-live', () => {
    const { container } = render(<Toast message="Accessible toast" type="info" onClose={() => {}} />);
    const toast = container.querySelector('[role="status"]');
    expect(toast).not.toBeNull();
    expect(toast?.getAttribute('aria-live')).toBe('polite');
  });

  it('calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Auto close" type="success" duration={3000} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses default 5s duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Default" type="info" onClose={onClose} />);

    act(() => { vi.advanceTimersByTime(4999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders dismiss button for non-loading types', () => {
    const { container } = render(
      <Toast message="Dismissable" type="error" onClose={() => {}} />
    );
    const dismissBtn = container.querySelector('button[aria-label="Dismiss"]');
    expect(dismissBtn).not.toBeNull();
  });

  it('does not render dismiss button for loading type', () => {
    const { container } = render(
      <Toast message="Loading..." type="loading" onClose={() => {}} />
    );
    const dismissBtn = container.querySelector('button[aria-label="Dismiss"]');
    expect(dismissBtn).toBeNull();
  });

  it('calls onClose when dismiss button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast message="Click dismiss" type="success" onClose={onClose} />
    );
    const dismissBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]');
    dismissBtn?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses 30s max duration for loading type', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Loading..." type="loading" onClose={onClose} />);

    act(() => { vi.advanceTimersByTime(29999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalled();
  });
});
