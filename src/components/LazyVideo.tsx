import { useRef } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /** The real video URL — will be placed on data-src and swapped in lazily */
  src: string;
}

/**
 * LazyVideo — renders a <video> that defers loading until it enters the
 * viewport (via useLazyLoad / IntersectionObserver).
 */
export function LazyVideo({ src, className, children, ...rest }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useLazyLoad(videoRef);

  return (
    <video ref={videoRef} data-src={src} className={className} {...rest}>
      {children}
    </video>
  );
}
