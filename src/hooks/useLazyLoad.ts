import { useEffect } from 'react';

/**
 * useLazyLoad — swaps data-src → src on an img or video element when it
 * enters the viewport via IntersectionObserver.
 *
 * - No-op when the element has no data-src attribute.
 * - Disconnects the observer on swap and on cleanup to prevent memory leaks.
 *
 * @param ref - React ref pointing to an <img> or <video> element
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLImageElement | HTMLVideoElement | null>
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No-op if there is nothing to swap
    const dataSrc = el.getAttribute('data-src');
    if (!dataSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement | HTMLVideoElement;
            const src = target.getAttribute('data-src');
            if (src) {
              target.setAttribute('src', src);
              target.removeAttribute('data-src');
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [ref]);
}
