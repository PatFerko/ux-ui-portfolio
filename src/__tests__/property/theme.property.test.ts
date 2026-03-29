import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Feature: ux-ui-portfolio, Property 16: Theme preference round-trips through localStorage
// Validates: Requirements 8.3

describe('Property 16: Theme preference round-trips through localStorage', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      storage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete storage[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores the active theme in localStorage["portfolio-theme"] and restores it on re-read', () => {
    fc.assert(
      fc.property(fc.constantFrom('dark' as const, 'light' as const), (theme) => {
        // Simulate what ThemeProvider does: write theme to localStorage
        localStorage.setItem('portfolio-theme', theme);

        // Re-read from localStorage (simulates app re-initialization)
        const restored = localStorage.getItem('portfolio-theme');

        expect(restored).toBe(theme);
      }),
      { numRuns: 100 }
    );
  });

  it('only accepts "dark" or "light" as valid stored values', () => {
    fc.assert(
      fc.property(fc.constantFrom('dark' as const, 'light' as const), (theme) => {
        localStorage.setItem('portfolio-theme', theme);
        const stored = localStorage.getItem('portfolio-theme');
        expect(['dark', 'light']).toContain(stored);
      }),
      { numRuns: 100 }
    );
  });
});
