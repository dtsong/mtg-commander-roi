import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ColorIndicator from '@/components/ColorIndicator';
import type { ManaColor } from '@/types';

describe('ColorIndicator', () => {
  describe('rendering colors', () => {
    it('renders all mana colors correctly', () => {
      const colors: ManaColor[] = ['W', 'U', 'B', 'R', 'G'];
      const { container } = render(<ColorIndicator colors={colors} />);

      const indicators = container.querySelectorAll('span');
      expect(indicators).toHaveLength(5);

      expect(container.textContent).toContain('W');
      expect(container.textContent).toContain('U');
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('R');
      expect(container.textContent).toContain('G');
    });

    it('renders colorless indicator', () => {
      const colors: ManaColor[] = ['C'];
      const { container } = render(<ColorIndicator colors={colors} />);

      expect(container.textContent).toContain('C');
    });

    it('renders single color', () => {
      const colors: ManaColor[] = ['U'];
      const { container } = render(<ColorIndicator colors={colors} />);

      const indicators = container.querySelectorAll('span');
      expect(indicators).toHaveLength(1);
      expect(container.textContent).toBe('U');
    });

    it('renders two colors', () => {
      const colors: ManaColor[] = ['W', 'B'];
      const { container } = render(<ColorIndicator colors={colors} />);

      const indicators = container.querySelectorAll('span');
      expect(indicators).toHaveLength(2);
    });
  });

  describe('empty array handling', () => {
    it('returns null for empty array', () => {
      const { container } = render(<ColorIndicator colors={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null for undefined colors', () => {
      const { container } = render(<ColorIndicator colors={undefined as unknown as ManaColor[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('title attributes', () => {
    it('has correct title for White', () => {
      const { container } = render(<ColorIndicator colors={['W']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('White');
    });

    it('has correct title for Blue', () => {
      const { container } = render(<ColorIndicator colors={['U']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('Blue');
    });

    it('has correct title for Black', () => {
      const { container } = render(<ColorIndicator colors={['B']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('Black');
    });

    it('has correct title for Red', () => {
      const { container } = render(<ColorIndicator colors={['R']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('Red');
    });

    it('has correct title for Green', () => {
      const { container } = render(<ColorIndicator colors={['G']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('Green');
    });

    it('has correct title for Colorless', () => {
      const { container } = render(<ColorIndicator colors={['C']} />);
      const span = container.querySelector('span');
      expect(span?.getAttribute('title')).toBe('Colorless');
    });
  });

  describe('styling', () => {
    it('applies correct styling for each color', () => {
      const { container } = render(<ColorIndicator colors={['W']} />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('bg-amber');
    });

    it('renders as flex container with gap', () => {
      const { container } = render(<ColorIndicator colors={['W', 'U']} />);
      const div = container.querySelector('div');
      expect(div?.className).toContain('flex');
      expect(div?.className).toContain('gap-1');
    });

    it('has rounded-full class for circular indicators', () => {
      const { container } = render(<ColorIndicator colors={['R']} />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('rounded-full');
    });
  });
});
