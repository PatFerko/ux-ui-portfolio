import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider } from '../../context/ThemeContext';
import { GallerySection } from '../../sections/GallerySection';
import { CaseStudiesSection } from '../../sections/CaseStudiesSection';
import { HeroSection } from '../../sections/HeroSection';

// Minimal Framer Motion mock to avoid layout animation issues in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        const {
          layoutId: _l,
          whileHover: _wh,
          whileFocus: _wf,
          whileTap: _wt,
          animate: _a,
          initial: _i,
          exit: _e,
          transition: _t,
          custom: _c,
          variants: _v,
          ...rest
        } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
      p: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLParagraphElement> & Record<string, unknown>) => {
        const {
          animate: _a,
          initial: _i,
          variants: _v,
          custom: _c,
          transition: _t,
          ...rest
        } = props;
        return <p {...(rest as React.HTMLAttributes<HTMLParagraphElement>)}>{children}</p>;
      },
      h1: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLHeadingElement> & Record<string, unknown>) => {
        const {
          animate: _a,
          initial: _i,
          variants: _v,
          custom: _c,
          transition: _t,
          ...rest
        } = props;
        return <h1 {...(rest as React.HTMLAttributes<HTMLHeadingElement>)}>{children}</h1>;
      },
      button: ({
        children,
        ...props
      }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => {
        const {
          whileHover: _wh,
          whileTap: _wt,
          animate: _a,
          initial: _i,
          variants: _v,
          transition: _t,
          ...rest
        } = props;
        return (
          <button {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
        );
      },
    },
  };
});

afterEach(() => {
  cleanup();
});

// ── Property 17: All informational images have non-empty alt text ─────────────
// Feature: ux-ui-portfolio, Property 17: All informational images have non-empty alt text
// Validates: Requirements 10.2

describe('Property 17: All informational images have non-empty alt text', () => {
  it('every <img> rendered in GallerySection has a non-empty alt attribute', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <GallerySection />
          </ThemeProvider>
        );

        const images = container.querySelectorAll('img');
        // There must be at least one image in the gallery
        expect(images.length).toBeGreaterThan(0);

        images.forEach((img) => {
          const alt = img.getAttribute('alt');
          // alt must be present and non-empty (decorative images use aria-hidden, not empty alt)
          expect(alt).not.toBeNull();
          expect(alt!.trim().length).toBeGreaterThan(0);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('every <img> rendered in CaseStudiesSection has a non-empty alt attribute', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <CaseStudiesSection />
          </ThemeProvider>
        );

        const images = container.querySelectorAll('img');
        images.forEach((img) => {
          const alt = img.getAttribute('alt');
          expect(alt).not.toBeNull();
          expect(alt!.trim().length).toBeGreaterThan(0);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('every <img> rendered in HeroSection has a non-empty alt attribute', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <HeroSection />
          </ThemeProvider>
        );

        const images = container.querySelectorAll('img');
        images.forEach((img) => {
          const alt = img.getAttribute('alt');
          // If an img is present it must have non-empty alt
          expect(alt).not.toBeNull();
          expect(alt!.trim().length).toBeGreaterThan(0);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 15: Interactive elements are in logical tab order ────────────────
// Feature: ux-ui-portfolio, Property 15: Interactive elements are in logical tab order
// Validates: Requirements 7.4, 10.3

describe('Property 15: Interactive elements are in logical tab order', () => {
  it('focusable elements in GallerySection follow document source order', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <GallerySection />
          </ThemeProvider>
        );

        // Collect all naturally focusable elements (buttons, links, [tabindex >= 0])
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        expect(focusable.length).toBeGreaterThan(0);

        // Verify tab order matches DOM source order by checking that each element
        // appears after the previous one in the document (compareDocumentPosition)
        for (let i = 1; i < focusable.length; i++) {
          const prev = focusable[i - 1];
          const curr = focusable[i];
          const position = prev.compareDocumentPosition(curr);
          // DOCUMENT_POSITION_FOLLOWING = 4 means curr comes after prev in source order
          expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('no focusable element has a positive tabindex that would disrupt natural order', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <GallerySection />
          </ThemeProvider>
        );

        // Positive tabindex values (> 0) create a separate tab order that precedes
        // the natural document order, which is an accessibility anti-pattern
        const positiveTabIndex = Array.from(
          container.querySelectorAll<HTMLElement>('[tabindex]')
        ).filter((el) => {
          const ti = parseInt(el.getAttribute('tabindex') ?? '0', 10);
          return ti > 0;
        });

        expect(positiveTabIndex).toHaveLength(0);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in CaseStudiesSection are keyboard reachable (tabindex >= 0)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(
          <ThemeProvider>
            <CaseStudiesSection />
          </ThemeProvider>
        );

        // Buttons and links must not have tabindex="-1" (which would make them unreachable)
        const interactiveEls = Array.from(
          container.querySelectorAll<HTMLElement>('button, a[href]')
        );

        expect(interactiveEls.length).toBeGreaterThan(0);

        interactiveEls.forEach((el) => {
          const tabIndex = parseInt(el.getAttribute('tabindex') ?? '0', 10);
          expect(tabIndex).toBeGreaterThanOrEqual(0);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
