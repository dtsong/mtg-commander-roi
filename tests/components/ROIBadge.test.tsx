import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ROIBadge from '@/components/ROIBadge';

describe('ROIBadge', () => {
  describe('positive ROI', () => {
    it('renders with green styling for positive ROI', () => {
      const { container } = render(<ROIBadge roi={25} />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-green');
      expect(badge?.className).toContain('text-green');
    });

    it('shows TrendingUp icon for positive ROI', () => {
      const { container } = render(<ROIBadge roi={10} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('renders zero ROI as positive', () => {
      const { container } = render(<ROIBadge roi={0} />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-green');
    });

    it('formats percentage correctly', () => {
      const { container } = render(<ROIBadge roi={25.5} />);
      expect(container.textContent).toContain('+');
      expect(container.textContent).toContain('%');
    });
  });

  describe('negative ROI', () => {
    it('renders with red styling for negative ROI', () => {
      const { container } = render(<ROIBadge roi={-15} />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-red');
      expect(badge?.className).toContain('text-red');
    });

    it('shows TrendingDown icon for negative ROI', () => {
      const { container } = render(<ROIBadge roi={-10} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
    });
  });

  describe('size variants', () => {
    it('renders with default md size', () => {
      const { container } = render(<ROIBadge roi={10} />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-3');
      expect(badge?.className).toContain('py-1.5');
    });

    it('renders with sm size', () => {
      const { container } = render(<ROIBadge roi={10} size="sm" />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-2');
      expect(badge?.className).toContain('py-1');
      expect(badge?.className).toContain('text-sm');
    });

    it('renders with lg size', () => {
      const { container } = render(<ROIBadge roi={10} size="lg" />);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-4');
      expect(badge?.className).toContain('py-2');
      expect(badge?.className).toContain('text-lg');
      expect(badge?.className).toContain('font-semibold');
    });
  });

  describe('icon rendering', () => {
    it('renders icon with correct size', () => {
      const { container } = render(<ROIBadge roi={10} />);
      const svg = container.querySelector('svg');
      expect(svg?.classList.contains('w-4')).toBe(true);
      expect(svg?.classList.contains('h-4')).toBe(true);
    });
  });
});
