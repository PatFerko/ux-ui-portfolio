import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, within, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { ContactSection } from '../../sections/ContactSection';
import { ThemeProvider } from '../../context/ThemeContext';

// Feature: ux-ui-portfolio

// Stub framer-motion for all property tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

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

// Clean up DOM between each test to prevent accumulation
afterEach(() => {
  cleanup();
});

function renderContact() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const result = render(
    <ThemeProvider>
      <ContactSection />
    </ThemeProvider>,
    { container }
  );
  return { ...result, container };
}

// ── Generators ────────────────────────────────────────────────────────────────

// Blank/whitespace-only strings (invalid name/message)
const blankStringArb = fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.constant('\t\t'),
  fc.constant('\n\n')
);

// Invalid email strings (no @, no domain, etc.)
const invalidEmailArb = fc.oneof(
  fc.constant(''),
  fc.constant('notanemail'),
  fc.constant('@nodomain'),
  fc.constant('missing@'),
  fc.constant('spaces in@email.com'),
  fc.constant('double@@email.com'),
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes('@'))
);

// Valid non-empty strings (for valid fields) — exclude { and } which userEvent treats as special keys
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0 && !s.includes('{') && !s.includes('}') && !s.includes('[') && !s.includes(']'));

// Valid email strings
const validEmailArb = fc.tuple(
  fc.stringMatching(/^[a-z]{1,8}$/),
  fc.stringMatching(/^[a-z]{2,8}$/),
  fc.constantFrom('com', 'net', 'org', 'io', 'dev')
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// ── Property 12: Contact form validation rejects invalid inputs ───────────────

describe('Property 12: Contact form validation rejects invalid inputs', () => {
  it('rejects submission when name is blank', async () => {
    // Feature: ux-ui-portfolio, Property 12: Contact form validation rejects invalid inputs
    await fc.assert(
      fc.asyncProperty(
        blankStringArb,
        validEmailArb,
        nonEmptyStringArb,
        async (blankName, validEmail, validMessage) => {
          cleanup();
          const { container, unmount } = renderContact();
          const user = userEvent.setup();
          const scope = within(container);

          const nameInput = scope.getByLabelText('Name');
          const emailInput = scope.getByLabelText('Email');
          const messageInput = scope.getByLabelText('Message');

          if (blankName.length > 0) {
            await user.type(nameInput, blankName);
          }
          await user.type(emailInput, validEmail);
          await user.type(messageInput, validMessage);
          await user.click(scope.getByRole('button', { name: /send message/i }));

          await waitFor(() => {
            expect(scope.getByText(/name is required/i)).toBeInTheDocument();
          });

          // Success animation must NOT appear
          expect(scope.queryByText(/message sent/i)).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('rejects submission when email is invalid', async () => {
    // Feature: ux-ui-portfolio, Property 12: Contact form validation rejects invalid inputs
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArb,
        invalidEmailArb,
        nonEmptyStringArb,
        async (validName, invalidEmail, validMessage) => {
          cleanup();
          const { container, unmount } = renderContact();
          const user = userEvent.setup();
          const scope = within(container);

          await user.type(scope.getByLabelText('Name'), validName);
          if (invalidEmail.length > 0) {
            await user.type(scope.getByLabelText('Email'), invalidEmail);
          }
          await user.type(scope.getByLabelText('Message'), validMessage);
          await user.click(scope.getByRole('button', { name: /send message/i }));

          await waitFor(() => {
            const emailError =
              scope.queryByText(/email is required/i) ||
              scope.queryByText(/valid email/i);
            expect(emailError).toBeInTheDocument();
          });

          expect(scope.queryByText(/message sent/i)).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('rejects submission when message is blank', async () => {
    // Feature: ux-ui-portfolio, Property 12: Contact form validation rejects invalid inputs
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArb,
        validEmailArb,
        blankStringArb,
        async (validName, validEmail, blankMessage) => {
          cleanup();
          const { container, unmount } = renderContact();
          const user = userEvent.setup();
          const scope = within(container);

          await user.type(scope.getByLabelText('Name'), validName);
          await user.type(scope.getByLabelText('Email'), validEmail);
          if (blankMessage.length > 0) {
            await user.type(scope.getByLabelText('Message'), blankMessage);
          }
          await user.click(scope.getByRole('button', { name: /send message/i }));

          await waitFor(() => {
            expect(scope.getByText(/message is required/i)).toBeInTheDocument();
          });

          expect(scope.queryByText(/message sent/i)).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ── Property 13: Validation errors preserve other field values ────────────────

describe('Property 13: Validation errors preserve other field values', () => {
  it('preserves valid field values when name is invalid', async () => {
    // Feature: ux-ui-portfolio, Property 13: Validation errors preserve other field values
    await fc.assert(
      fc.asyncProperty(
        validEmailArb,
        nonEmptyStringArb,
        async (validEmail, validMessage) => {
          cleanup();
          const { container, unmount } = renderContact();
          const user = userEvent.setup();
          const scope = within(container);

          // Leave name blank, fill email and message
          await user.type(scope.getByLabelText('Email'), validEmail);
          await user.type(scope.getByLabelText('Message'), validMessage);
          await user.click(scope.getByRole('button', { name: /send message/i }));

          await waitFor(() => {
            expect(scope.getByText(/name is required/i)).toBeInTheDocument();
          });

          // Email and message values must be preserved
          expect(scope.getByLabelText('Email')).toHaveValue(validEmail);
          expect(scope.getByLabelText('Message')).toHaveValue(validMessage);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('preserves valid field values when email is invalid', async () => {
    // Feature: ux-ui-portfolio, Property 13: Validation errors preserve other field values
    await fc.assert(
      fc.asyncProperty(
        nonEmptyStringArb,
        nonEmptyStringArb,
        async (validName, validMessage) => {
          cleanup();
          const { container, unmount } = renderContact();
          const user = userEvent.setup();
          const scope = within(container);

          await user.type(scope.getByLabelText('Name'), validName);
          // Leave email blank (invalid)
          await user.type(scope.getByLabelText('Message'), validMessage);
          await user.click(scope.getByRole('button', { name: /send message/i }));

          await waitFor(() => {
            expect(scope.getByText(/email is required/i)).toBeInTheDocument();
          });

          // Name and message values must be preserved
          expect(scope.getByLabelText('Name')).toHaveValue(validName);
          expect(scope.getByLabelText('Message')).toHaveValue(validMessage);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ── Property 18: Form inputs have associated labels ───────────────────────────

describe('Property 18: Form inputs have associated labels', () => {
  it('all form inputs have associated labels or aria-label', () => {
    // Feature: ux-ui-portfolio, Property 18: Form inputs have associated labels
    fc.assert(
      fc.property(fc.constant(null), () => {
        cleanup();
        const { container, unmount } = renderContact();

        // Get all visible inputs and textareas (exclude honeypot which is hidden)
        const inputs = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'input:not([aria-hidden="true"]), textarea'
        );

        inputs.forEach((input) => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');

          if (id) {
            const label = container.querySelector(`label[for="${id}"]`);
            const hasLabel = label !== null;
            const hasAriaLabel = ariaLabel !== null && ariaLabel.trim().length > 0;
            const hasAriaLabelledBy = ariaLabelledBy !== null && ariaLabelledBy.trim().length > 0;
            expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
          } else {
            const hasAriaLabel = ariaLabel !== null && ariaLabel.trim().length > 0;
            const hasAriaLabelledBy = ariaLabelledBy !== null && ariaLabelledBy.trim().length > 0;
            expect(hasAriaLabel || hasAriaLabelledBy).toBe(true);
          }
        });

        unmount();
      }),
      { numRuns: 1 }
    );
  });
});
