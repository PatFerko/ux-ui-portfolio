import { motion, useReducedMotion } from 'framer-motion';
import { LazyImage } from './LazyImage';
import { useTheme } from '../context/ThemeContext';

export interface GalleryItemData {
  id: string;
  type: 'component' | 'motion' | 'branding';
  src: string;
  alt: string;
  isInteractive: boolean;
  height?: string;
}

interface GalleryItemProps {
  item: GalleryItemData;
  onSelect: (item: GalleryItemData) => void;
}

export function GalleryItem({ item, onSelect }: GalleryItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  }

  return (
    <motion.div
      layoutId={`gallery-item-${item.id}`}
      className={`relative overflow-hidden rounded-xl cursor-pointer mb-4 break-inside-avoid
        ${theme === 'dark'
          ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50'
          : 'bg-white border border-gray-100 shadow-sm'
        } shadow-md`}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.alt}`}
      onClick={() => onSelect(item)}
      onKeyDown={handleKeyDown}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileFocus={{ outline: '2px solid #6366f1', outlineOffset: '2px' }}
    >
      <LazyImage
        src={item.src}
        alt={item.alt}
        className={`w-full ${item.height || 'h-auto'} object-cover block`}
      />
    </motion.div>
  );
}
