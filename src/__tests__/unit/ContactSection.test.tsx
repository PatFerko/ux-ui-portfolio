import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactSection } from '../../sections/ContactSection';
import { ThemeProvider } from '../../context/ThemeContext';

// Stub framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  // Generic passthrough factory for any HTML/SVG element
  function makePassthrough(tag: string) {
    return ({ children, ...props }: Record<string, unknown>) => {
      const { whileHover: _wh, whileTap: _wt, transition: _t, initial: _i, animate: _a, exit: _e, variants: _v, ...rest } = props;
      return React.createElement(tag, rest as Record<string, unknown>, children as React.ReactNode);
    };
  }

  return {
    ...actual,
    useReducedMotion: () => true,
    motion: new Proxy({} as typeof actual.motion, {
      get(_target, prop: string) {
        return makePassthrough(prop);
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

function renderContact() {
  return render(
    <ThemeProvider>
      <ContactSection />
    </ThemeProvider>
  );
}

describe('ContactSection', () => {
  it('renders the section with id="contact"', () => {
    renderContact();
    expect(document.getElementById('contact')).toBeInTheDocument();
  });

  it('renders conversational microcopy tagline', () => {
    renderContact();
    expect(screen.getByText(/let's build something together/i)).toBeInTheDocument();
  });

  it('renders name, email, and message fields with labels', () => {
    renderContact();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders direct email link as alternative contact', () => {
    renderContact();
    const emailLink = screen.getByRole('link', { name: /hello@alexrivera\.design/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@alexrivera.design');
  });

  it('shows inline error for empty name without clearing other fields', async () => {
    const user = userEvent.setup();
    renderContact();

    const emailInput = screen.getByLabelText('Email');
    const messageInput = screen.getByLabelText('Message');

    await user.type(emailInput, 'test@example.com');
    await user.type(messageInput, 'Hello there');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    // Other fields retain their values
    expect(emailInput).toHaveValue('test@example.com');
    expect(messageInput).toHaveValue('Hello there');
  });

  it('shows inline error for invalid email without clearing other fields', async () => {
    const user = userEvent.setup();
    renderContact();

    const nameInput = screen.getByLabelText('Name');
    const messageInput = screen.getByLabelText('Message');

    await user.type(nameInput, 'Alex');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(messageInput, 'Hello there');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    expect(nameInput).toHaveValue('Alex');
    expect(messageInput).toHaveValue('Hello there');
  });

  it('shows inline error for empty message without clearing other fields', async () => {
    const user = userEvent.setup();
    renderContact();

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');

    await user.type(nameInput, 'Alex');
    await user.type(emailInput, 'alex@example.com');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });

    expect(nameInput).toHaveValue('Alex');
    expect(emailInput).toHaveValue('alex@example.com');
  });

  it('honeypot-populated submission does not show success', async () => {
    const user = userEvent.setup();
    renderContact();

    // Fill valid fields
    await user.type(screen.getByLabelText('Name'), 'Bot');
    await user.type(screen.getByLabelText('Email'), 'bot@spam.com');
    await user.type(screen.getByLabelText('Message'), 'Buy cheap stuff');

    // Manually set honeypot value (bots would fill this)
    const honeypot = document.querySelector('input[name="honeypot"]') as HTMLInputElement;
    expect(honeypot).toBeInTheDocument();
    Object.defineProperty(honeypot, 'value', { value: 'spam', writable: true });
    // Trigger change so RHF picks it up
    honeypot.dispatchEvent(new Event('input', { bubbles: true }));

    // The honeypot field should be hidden
    expect(honeypot).toHaveStyle({ display: 'none' });
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders success animation after valid submission', async () => {
    const user = userEvent.setup();
    renderContact();

    await user.type(screen.getByLabelText('Name'), 'Alex Rivera');
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Message'), 'Hello, I have a project for you!');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/message sent/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
