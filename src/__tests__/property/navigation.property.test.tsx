import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { NavBar } from '../../components/NavBar';
import { ThemeProvider } from '../../context/ThemeContext';

// Feature: ux-ui-portfolio, Property 14: Active nav item reflects current viewport section
// Validates: Requirements 7.2

const SECTION_IDS = ['hero', 'work', 'gallery', 'skills', 'social', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/**
 * Simulate IntersectionObserver firing for a given section id.
 * Returns the active section id as reported by aria-current="page" on nav links.
 */
function getActiveNavLink(container: HTMLElement): string | null {
  const active = container.querySelector('[aria-current="page"]');
  return active ? active.getAttribute('href')?.replace('#', '') ?? null : null;
}

describe('Property 14: Active nav item reflects current viewport section', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observedElements: Element[] = [];

  beforeEach(() => {
    observedElements = [];
    // Create section elements
    SECTION_IDS.forEach((id) => {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    });

    // Mock IntersectionObserver
    vi.stubGlobal(
      'IntersectionObserver',
      class MockIntersectionObserver {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe(el: Element) {
          observedElements.push(el);
        }
        unobserve() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    SECTION_IDS.forEach((id) => {
      document.getElementById(id)?.remove();
    });
    observerCallback = null;
    observedElements = [];
  });

  it('highlights exactly the active section link and no other', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SECTION_IDS), (activeSectionId: SectionId) => {
        const { container, unmount } = render(
          <ThemeProvider>
            <NavBar />
          </ThemeProvider>
        );

        // Simulate IntersectionObserver firing for the active section
        act(() => {
          if (observerCallback) {
            const targetEl = document.getElementById(activeSectionId)!;
            const entries: IntersectionObserverEntry[] = [
              {
                target: targetEl,
                isIntersecting: true,
                intersectionRatio: 1,
                boundingClientRect: { top: 100, bottom: 200, left: 0, right: 0, width: 0, height: 100, x: 0, y: 100, toJSON: () => ({}) } as DOMRectReadOnly,
                intersectionRect: { top: 100, bottom: 200, left: 0, right: 0, width: 0, height: 100, x: 0, y: 100, toJSON: () => ({}) } as DOMRectReadOnly,
                rootBounds: null,
                time: 0,
              },
            ];
            observerCallback(entries, {} as IntersectionObserver);
          }
        });

        // The active link should have aria-current="page"
        const activeLinks = container.querySelectorAll('[aria-current="page"]');

        // Collect unique hrefs that are marked active
        const activeHrefs = new Set(
          Array.from(activeLinks).map((l) => l.getAttribute('href'))
        );

        // Exactly one unique section should be active
        expect(activeHrefs.size).toBe(1);

        // The active href should correspond to the intersecting section
        expect(activeHrefs.has(`#${activeSectionId}`)).toBe(true);

        // No other section link should be highlighted
        const allLinks = container.querySelectorAll(`a[href^="#"]`);
        allLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href !== `#${activeSectionId}`) {
            expect(link.getAttribute('aria-current')).toBeNull();
          }
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
