import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ContactForm from '@/components/ContactForm';

describe('ContactForm', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_FORMSPREE_ID: 'test-form-id' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('form fields render', () => {
    it('renders name input', () => {
      const { container } = render(<ContactForm />);

      const nameInput = container.querySelector('input[name="name"]');
      expect(nameInput).not.toBeNull();
      expect(nameInput?.getAttribute('type')).toBe('text');
    });

    it('renders email input', () => {
      const { container } = render(<ContactForm />);

      const emailInput = container.querySelector('input[type="email"]');
      expect(emailInput).not.toBeNull();
    });

    it('renders subject input', () => {
      const { container } = render(<ContactForm />);

      const subjectInput = container.querySelector('input[name="subject"]');
      expect(subjectInput).not.toBeNull();
    });

    it('renders message textarea', () => {
      const { container } = render(<ContactForm />);

      const messageTextarea = container.querySelector('textarea');
      expect(messageTextarea).not.toBeNull();
      expect(messageTextarea?.getAttribute('rows')).toBe('5');
    });

    it('renders submit button', () => {
      const { container } = render(<ContactForm />);

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).not.toBeNull();
      expect(submitButton?.textContent).toContain('Send Message');
    });

    it('renders labels for all fields', () => {
      const { container } = render(<ContactForm />);

      expect(container.querySelector('label[for="name"]')).not.toBeNull();
      expect(container.querySelector('label[for="email"]')).not.toBeNull();
      expect(container.querySelector('label[for="subject"]')).not.toBeNull();
      expect(container.querySelector('label[for="message"]')).not.toBeNull();
    });
  });

  describe('form validation', () => {
    it('has required attribute on all fields', () => {
      const { container } = render(<ContactForm />);

      const nameInput = container.querySelector('input[name="name"]');
      const emailInput = container.querySelector('input[type="email"]');
      const subjectInput = container.querySelector('input[name="subject"]');
      const messageTextarea = container.querySelector('textarea');

      expect(nameInput?.hasAttribute('required')).toBe(true);
      expect(emailInput?.hasAttribute('required')).toBe(true);
      expect(subjectInput?.hasAttribute('required')).toBe(true);
      expect(messageTextarea?.hasAttribute('required')).toBe(true);
    });
  });

  describe('submit handler', () => {
    it('shows loading state when submitting', async () => {
      globalThis.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<ContactForm />);

      // Fill form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message content' } });

      // Submit
      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      expect(container.textContent).toContain('Sending...');
    });

    it('shows success message on successful submit', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

      const { container } = render(<ContactForm />);

      // Fill form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message content' } });

      // Submit
      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Message Sent!');
        expect(container.textContent).toContain('Thank you for reaching out');
      });
    });

    it('shows error message on failed submit', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

      const { container } = render(<ContactForm />);

      // Fill form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message content' } });

      // Submit
      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Something went wrong');
      });
    });

    it('shows error on network failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { container } = render(<ContactForm />);

      // Fill form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message content' } });

      // Submit
      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Network error');
      });
    });

    it('allows sending another message after success', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

      const { container } = render(<ContactForm />);

      // Fill and submit form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message' } });

      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('Message Sent!');
      });

      // Click "Send another message"
      const sendAnotherButton = container.querySelector('button');
      fireEvent.click(sendAnotherButton!);

      // Form should be shown again
      await waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });
    });

    it('shows error for oversized message', async () => {
      const { container } = render(<ContactForm />);

      // Fill form with large content
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'x'.repeat(6000) } });

      // Submit
      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      await waitFor(() => {
        expect(container.textContent).toContain('message is too large');
      });
    });
  });

  describe('button states', () => {
    it('disables button while submitting', async () => {
      globalThis.fetch = vi.fn().mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<ContactForm />);

      // Fill form
      fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: 'Test User' } });
      fireEvent.change(container.querySelector('input[type="email"]')!, { target: { value: 'test@example.com' } });
      fireEvent.change(container.querySelector('input[name="subject"]')!, { target: { value: 'Test Subject' } });
      fireEvent.change(container.querySelector('textarea')!, { target: { value: 'Test message' } });

      const form = container.querySelector('form');
      await act(async () => {
        fireEvent.submit(form!);
      });

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton?.hasAttribute('disabled')).toBe(true);
    });
  });
});
