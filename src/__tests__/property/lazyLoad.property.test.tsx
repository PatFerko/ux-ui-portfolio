/**
 * Property 5: Lazy loading defers off-screen media
 *
 * For any <img> or <video> element that is below the initial viewport at
 * render time, the src attribute must not be set to the real asset URL until
 * the element enters the viewport via IntersectionObserver.
 *
 * Feature: ux-ui-portfolio, Property 5: Lazy loading defers off-screen media
 * Validates: Requirements 2.8, 3.8, 9.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { useLazyLoad } from '../../hooks/useLazyLoad';

// ---------------------------------------------------------------------------
// IntersectionObserver mock helpers
// ---------------------------------------------------------------------------

// Track the last observer instance created so tests can inspect it
let lastObserverInstance: {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
} | null = null;

let MockIOConstructor: ReturnType<typeof vi.fn> | null = null;

/**
 * Replace the global IntersectionObserver with a class-compatible mock.
 * When isIntersecting=true the observer fires immediately on observe().
 */
function setupMockIO(isIntersecting: boolean) {
  lastObserverInstance = null;

  // Must be a real class so `new IntersectionObserver(...)` works
  class MockIO {
    private callback: IntersectionObserverCallback;
    observe = vi.fn((el: Element) => {
      if (isIntersecting) {
        this.callback(
          [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        );
      }
    });
    disconnect = vi.fn();
    unobserve = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastObserverInstance = this;
    }
  }

  MockIOConstructor = vi.fn().mockImplementation(
    (cb: IntersectionObserverCallback) => new MockIO(cb)
  );

  vi.stubGlobal('IntersectionObserver', MockIO);
}

// ---------------------------------------------------------------------------
// Minimal test components
// ---------------------------------------------------------------------------

function TestImg({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useLazyLoad(ref);
  return <img ref={ref} data-src={src} alt="test" />;
}

function TestVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useLazyLoad(ref);
  return <video ref={ref} data-src={src} />;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Property 5: Lazy loading defers off-screen media', () => {
  it('img src is NOT set before the element enters the viewport', () => {
    // IO that never fires intersection (element is off-screen)
    setupMockIO(false);

    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const { container, unmount } = render(<TestImg src={url} />);
        const img = container.querySelector('img')!;

        // src must not be the real URL — it should be empty/absent
        expect(img.getAttribute('src')).not.toBe(url);
        // data-src must still hold the deferred URL
        expect(img.getAttribute('data-src')).toBe(url);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('img src IS set to the real URL once the element enters the viewport', () => {
    // IO that fires intersection immediately on observe()
    setupMockIO(true);

    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        let container!: HTMLElement;
        let unmount!: () => void;

        act(() => {
          ({ container, unmount } = render(<TestImg src={url} />));
        });

        const img = container.querySelector('img')!;

        // After intersection, src should be the real URL
        expect(img.getAttribute('src')).toBe(url);
        // data-src should be removed after swap
        expect(img.getAttribute('data-src')).toBeNull();

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('video src is NOT set before the element enters the viewport', () => {
    setupMockIO(false);

    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const { container, unmount } = render(<TestVideo src={url} />);
        const video = container.querySelector('video')!;

        expect(video.getAttribute('src')).not.toBe(url);
        expect(video.getAttribute('data-src')).toBe(url);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('video src IS set to the real URL once the element enters the viewport', () => {
    setupMockIO(true);

    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        let container!: HTMLElement;
        let unmount!: () => void;

        act(() => {
          ({ container, unmount } = render(<TestVideo src={url} />));
        });

        const video = container.querySelector('video')!;

        expect(video.getAttribute('src')).toBe(url);
        expect(video.getAttribute('data-src')).toBeNull();

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('hook is a no-op when element has no data-src attribute', () => {
    // Track whether IO was instantiated
    let ioCreated = false;

    class NoOpIO {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      constructor() {
        ioCreated = true;
      }
    }

    vi.stubGlobal('IntersectionObserver', NoOpIO);

    function NoDataSrcImg() {
      const ref = useRef<HTMLImageElement>(null);
      useLazyLoad(ref);
      return <img ref={ref} src="https://example.com/real.jpg" alt="no lazy" />;
    }

    const { unmount } = render(<NoDataSrcImg />);
    // IntersectionObserver should not have been instantiated
    expect(ioCreated).toBe(false);
    unmount();
  });

  it('observer is disconnected on cleanup (no memory leak)', () => {
    setupMockIO(false);

    const { unmount } = render(<TestImg src="https://example.com/img.jpg" />);

    // Observer was created
    expect(lastObserverInstance).not.toBeNull();

    // Unmount triggers useEffect cleanup
    unmount();

    expect(lastObserverInstance!.disconnect).toHaveBeenCalled();
  });
});
