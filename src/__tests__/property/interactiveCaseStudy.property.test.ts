// Feature: ux-ui-portfolio, Property 20: Prototype navigation covers all screens
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { navigatePrototype } from '../../components/InteractiveCaseStudy';

/**
 * Validates: Requirements 12.2
 *
 * For any interactive case study prototype with N screens (N ≥ 2),
 * repeatedly pressing "next" from the first screen must visit all N screens
 * exactly once before wrapping, and "previous" must navigate in reverse order.
 */

// Arbitrary for generating screen counts (N ≥ 2)
const screenCountArb = fc.integer({ min: 2, max: 50 });

describe('Property 20: Prototype navigation covers all screens', () => {
  it('pressing next N times from screen 0 visits all screens exactly once before wrapping', () => {
    fc.assert(
      fc.property(screenCountArb, (n) => {
        const visited: number[] = [];
        let current = 0;

        for (let i = 0; i < n; i++) {
          current = navigatePrototype(current, 'next', n);
          visited.push(current);
        }

        // After N next presses from 0, we should be back at 0 (wrapped)
        expect(current).toBe(0);

        // All N screens should have been visited exactly once
        const uniqueVisited = new Set(visited);
        expect(uniqueVisited.size).toBe(n);

        // Every screen index 0..N-1 should appear
        for (let i = 0; i < n; i++) {
          expect(uniqueVisited.has(i)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('pressing previous N times from screen 0 visits all screens in reverse order', () => {
    fc.assert(
      fc.property(screenCountArb, (n) => {
        const visited: number[] = [];
        let current = 0;

        for (let i = 0; i < n; i++) {
          current = navigatePrototype(current, 'previous', n);
          visited.push(current);
        }

        // After N previous presses from 0, we should be back at 0 (wrapped)
        expect(current).toBe(0);

        // All N screens should have been visited exactly once
        const uniqueVisited = new Set(visited);
        expect(uniqueVisited.size).toBe(n);

        // Every screen index 0..N-1 should appear
        for (let i = 0; i < n; i++) {
          expect(uniqueVisited.has(i)).toBe(true);
        }

        // The order should be reverse: N-1, N-2, ..., 1, 0
        for (let i = 0; i < n; i++) {
          const expectedIndex = (n - 1 - i + n) % n;
          expect(visited[i]).toBe(expectedIndex);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('next and previous are inverses — next then previous returns to same screen', () => {
    fc.assert(
      fc.property(
        screenCountArb,
        fc.integer({ min: 0, max: 49 }).chain((idx) =>
          screenCountArb.map((n) => ({ n: Math.max(n, idx + 1), startIndex: idx }))
        ),
        (_n, { n, startIndex }) => {
          const afterNext = navigatePrototype(startIndex, 'next', n);
          const backToPrev = navigatePrototype(afterNext, 'previous', n);
          expect(backToPrev).toBe(startIndex);
        }
      ),
      { numRuns: 100 }
    );
  });
});
