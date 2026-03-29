import { motion, useReducedMotion } from 'framer-motion';
import { LazyImage } from './LazyImage';
import { useTheme } from '../context/ThemeContext';

export interface GalleryItemData {
  id: string;
  type: 'component' | 'motion' | 'branding';
  src: string;
  alt: string;
  isInteractive: boolean;
}

interface GalleryItemProps {
  item: GalleryItemData;
  onSelect: (item: GalleryItemData) => void;
}

const typeLabel: Record<GalleryItemData['type'], string> = {
  component: 'Component',
  motion: 'Motion',
  branding: 'Branding',
};

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
        className="w-full h-auto object-cover block"
      />
      <div className={`absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between
        ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm`}>
        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {typeLabel[item.type]}
        </span>
        {item.isInteractive && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500 text-white font-medium">
            Interactive
          </span>
        )}
      </div>
    </motion.div>
  );
}
