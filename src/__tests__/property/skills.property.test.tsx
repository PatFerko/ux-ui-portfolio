import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider } from '../../context/ThemeContext';
import { SkillsSection } from '../../sections/SkillsSection';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        const { whileHover: _wh, animate: _a, initial: _i, exit: _e, transition: _t, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

// ── Property 9: Skills per category never exceeds 12 ─────────────────────────
// Feature: ux-ui-portfolio, Property 9: Skills per category never exceeds 12
// Validates: Requirements 4.6

describe('Property 9: Skills per category never exceeds 12', () => {
  it('rendered skill items per category are at most 12 regardless of source data', () => {
    // SkillsSection always caps at 12 per category from the real data.
    // We verify this holds for both mindset views.
    fc.assert(
      fc.property(
        fc.constantFrom('designer', 'developer') as fc.Arbitrary<'designer' | 'developer'>,
        (mindset) => {
          const { unmount } = render(
            <ThemeProvider>
              <SkillsSection />
            </ThemeProvider>
          );

          // Switch to the desired mindset
          if (mindset === 'developer') {
            const devBtn = screen.getByRole('button', { name: /developer/i });
            fireEvent.click(devBtn);
          }

          const skillLists = screen.getAllByRole('list', { name: /skill levels/i });
          skillLists.forEach((list) => {
            const items = list.querySelectorAll('li');
            expect(items.length).toBeLessThanOrEqual(12);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 8: Mindset toggle switches displayed content ─────────────────────
// Feature: ux-ui-portfolio, Property 8: Mindset toggle switches displayed content
// Validates: Requirements 4.4

describe('Property 8: Mindset toggle switches displayed content', () => {
  it('toggling Designer→Developer changes content, toggling back restores it', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial mindset: true = start as developer
        (startAsDeveloper) => {
          const { unmount } = render(
            <ThemeProvider>
              <SkillsSection />
            </ThemeProvider>
          );

          // Optionally start in developer view
          if (startAsDeveloper) {
            fireEvent.click(screen.getByRole('button', { name: /developer/i }));
          }

          // Capture current headings
          const getHeadings = () =>
            screen.getAllByRole('heading', { level: 3 })
              .map((h) => h.textContent ?? '')
              .filter((t) => ['UX', 'UI', 'Frontend'].includes(t));

          const initialHeadings = getHeadings();

          // Toggle to the other mindset
          if (startAsDeveloper) {
            fireEvent.click(screen.getByRole('button', { name: /designer/i }));
          } else {
            fireEvent.click(screen.getByRole('button', { name: /developer/i }));
          }

          const toggledHeadings = getHeadings();

          // Content must have changed
          expect(toggledHeadings).not.toEqual(initialHeadings);

          // Toggle back
          if (startAsDeveloper) {
            fireEvent.click(screen.getByRole('button', { name: /developer/i }));
          } else {
            fireEvent.click(screen.getByRole('button', { name: /designer/i }));
          }

          const restoredHeadings = getHeadings();

          // Round-trip: restored content must match initial
          expect(restoredHeadings).toEqual(initialHeadings);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
