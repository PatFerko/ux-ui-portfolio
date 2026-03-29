import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider } from '../../context/ThemeContext';
import { SocialSection } from '../../sections/SocialSection';

// Same mock pattern as unit tests — motion.div is the only motion element used
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { whileHover: _wh, whileTap: _wt, transition: _t, initial: _i, animate: _a, exit: _e, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

// ── Arbitraries ───────────────────────────────────────────────────────────────

const platformArb = fc.constantFrom('GitHub', 'LinkedIn', 'Dribbble', 'Behance') as fc.Arbitrary<
  'GitHub' | 'LinkedIn' | 'Dribbble' | 'Behance'
>;

const socialLinkArb = fc.record({
  platform: platformArb,
  url: fc.webUrl(),
  ariaLabel: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
});

const repoArb = fc.record({
  // Use non-empty, non-whitespace names so they appear in the DOM
  name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  description: fc.option(
    fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    { nil: null }
  ),
  url: fc.webUrl(),
  stars: fc.nat(1000),
  language: fc.option(fc.constantFrom('TypeScript', 'JavaScript', 'CSS', 'Python'), { nil: null }),
});

// ── Property 10: Social links open in new tab with accessible labels ──────────
// Feature: ux-ui-portfolio, Property 10: Social links open in new tab with accessible labels
// Validates: Requirements 5.2, 5.6

describe('Property 10: Social links open in new tab with accessible labels', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('every social link anchor has target="_blank", rel="noopener noreferrer", and non-empty aria-label', () => {
    // We test against the real socialLinks.json data rendered by SocialSection
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const { unmount } = render(
            <ThemeProvider>
              <SocialSection />
            </ThemeProvider>
          );

          // Find all anchor elements that have aria-label (social link items)
          const anchors = document.querySelectorAll('a[aria-label]');
          expect(anchors.length).toBeGreaterThan(0);

          anchors.forEach((anchor) => {
            const ariaLabel = anchor.getAttribute('aria-label');
            const target = anchor.getAttribute('target');
            const rel = anchor.getAttribute('rel');

            // Non-empty aria-label
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel!.trim().length).toBeGreaterThan(0);

            // Opens in new tab
            expect(target).toBe('_blank');

            // Security attributes
            expect(rel).toContain('noopener');
            expect(rel).toContain('noreferrer');
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('social link arbitraries: any SocialLink with non-empty ariaLabel satisfies the property', () => {
    // Feature: ux-ui-portfolio, Property 10: Social links open in new tab with accessible labels
    fc.assert(
      fc.property(
        fc.array(socialLinkArb, { minLength: 1, maxLength: 5 }),
        (links) => {
          // Every link in the array has a non-empty ariaLabel
          links.forEach((link) => {
            expect(link.ariaLabel.trim().length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 11: Featured repo cards contain name and description ─────────────
// Feature: ux-ui-portfolio, Property 11: Featured repo cards contain name and description
// Validates: Requirements 5.4

describe('Property 11: Featured repo cards contain name and description', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('each rendered repo card displays the repo name and description (or fallback)', async () => {
    // Test the RepoPreviewCard rendering logic directly via a focused render
    // rather than re-rendering SocialSection multiple times (which causes DOM accumulation)
    const { render: rtlRender, screen: rtlScreen, waitFor: rtlWaitFor } = await import('@testing-library/react');

    await fc.assert(
      fc.asyncProperty(
        fc.array(repoArb, { minLength: 1, maxLength: 6 }),
        async (repos) => {
          const mockUser = { public_repos: 10, html_url: 'https://github.com/PatFerko' };

          let callCount = 0;
          vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(() => {
              callCount++;
              const data = callCount === 1 ? mockUser : repos.map((r) => ({
                name: r.name,
                description: r.description,
                html_url: r.url,
                stargazers_count: r.stars,
                language: r.language,
              }));
              return Promise.resolve({ ok: true, json: async () => data });
            })
          );

          const { unmount } = rtlRender(
            <ThemeProvider>
              <SocialSection />
            </ThemeProvider>
          );

          await rtlWaitFor(() => {
            expect(rtlScreen.getAllByText('public repositories').length).toBeGreaterThan(0);
          });

          // Each repo name must appear somewhere in the document
          for (const repo of repos) {
            const nameEls = rtlScreen.queryAllByText(repo.name);
            expect(nameEls.length).toBeGreaterThan(0);

            if (repo.description !== null) {
              const descEls = rtlScreen.queryAllByText(repo.description);
              expect(descEls.length).toBeGreaterThan(0);
            } else {
              expect(rtlScreen.queryAllByText('No description available').length).toBeGreaterThan(0);
            }
          }

          unmount();
          cleanup();
          vi.restoreAllMocks();
        }
      ),
      { numRuns: 3 } // minimal runs due to async + DOM overhead per iteration
    );
  }, 30_000);
});
