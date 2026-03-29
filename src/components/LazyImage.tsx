import { useRef } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

// Inline SVG placeholder shown when the real image fails to load
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The real image URL — will be placed on data-src and swapped in lazily */
  src: string;
  alt: string;
  /** Optional custom placeholder shown on load error */
  placeholder?: string;
}

/**
 * LazyImage — renders an <img> that defers loading until it enters the
 * viewport (via useLazyLoad / IntersectionObserver).  Falls back to a
 * placeholder SVG on load error.
 */
export function LazyImage({
  src,
  alt,
  placeholder = PLACEHOLDER_SVG,
  className,
  ...rest
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  useLazyLoad(imgRef);

  function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.src = placeholder;
    e.currentTarget.onerror = null; // prevent infinite loop
  }

  return (
    <img
      ref={imgRef}
      data-src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}
