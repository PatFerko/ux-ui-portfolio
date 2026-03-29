import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider } from '../../context/ThemeContext';
import { GalleryItem, type GalleryItemData } from '../../components/GalleryItem';
import { GallerySection } from '../../sections/GallerySection';

// Minimal Framer Motion mock to avoid layout animation issues in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        const { layoutId: _l, whileHover: _wh, whileFocus: _wf, animate: _a, initial: _i, exit: _e, transition: _t, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

// Arbitrary for GalleryItemData
const galleryItemArb = fc.record<GalleryItemData>({
  id: fc.uuid(),
  type: fc.constantFrom('component', 'motion', 'branding') as fc.Arbitrary<GalleryItemData['type']>,
  src: fc.constant('https://placehold.co/400x300/6366f1/ffffff?text=Test'),
  alt: fc.string({ minLength: 1, maxLength: 80 }),
  isInteractive: fc.boolean(),
});

describe('Property 7: Gallery items are keyboard navigable', () => {
  // Feature: ux-ui-portfolio, Property 7: Gallery items are keyboard navigable
  // Validates: Requirements 3.7, 10.3

  it('every gallery item has a non-negative tabIndex and responds to Enter/Space', () => {
    fc.assert(
      fc.property(
        fc.array(galleryItemArb, { minLength: 1, maxLength: 8 }),
        (items) => {
          const onSelect = vi.fn();
          const { unmount } = render(
            <ThemeProvider>
              <div>
                {items.map((item) => (
                  <GalleryItem key={item.id} item={item} onSelect={onSelect} />
                ))}
              </div>
            </ThemeProvider>
          );

          const buttons = screen.getAllByRole('button');
          // Every item must have tabIndex >= 0
          buttons.forEach((btn) => {
            const tabIndex = Number(btn.getAttribute('tabindex') ?? '0');
            expect(tabIndex).toBeGreaterThanOrEqual(0);
          });

          // Enter key triggers onSelect
          onSelect.mockClear();
          fireEvent.keyDown(buttons[0], { key: 'Enter' });
          expect(onSelect).toHaveBeenCalledTimes(1);

          // Space key triggers onSelect
          onSelect.mockClear();
          fireEvent.keyDown(buttons[0], { key: ' ' });
          expect(onSelect).toHaveBeenCalledTimes(1);

          // Click also triggers onSelect
          onSelect.mockClear();
          fireEvent.click(buttons[0]);
          expect(onSelect).toHaveBeenCalledTimes(1);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 6: Theme propagates to all theme-aware components', () => {
  // Feature: ux-ui-portfolio, Property 6: Theme propagates to all theme-aware components
  // Validates: Requirements 3.5, 3.6, 8.2

  it('GallerySection reflects dark/light theme without page reload', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('dark', 'light') as fc.Arbitrary<'dark' | 'light'>,
        (themeValue) => {
          // Set localStorage theme before render
          localStorage.setItem('portfolio-theme', themeValue);

          const { container, unmount } = render(
            <ThemeProvider>
              <GallerySection />
            </ThemeProvider>
          );

          const section = container.querySelector('#gallery');
          expect(section).not.toBeNull();

          // The section should exist and render gallery items regardless of theme
          const items = screen.getAllByRole('button', { name: /view/i });
          expect(items.length).toBeGreaterThanOrEqual(6);

          // Theme-specific class should be applied to the section
          if (themeValue === 'dark') {
            expect(section?.className).toContain('bg-gray-950');
          } else {
            expect(section?.className).toContain('bg-white');
          }

          unmount();
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
