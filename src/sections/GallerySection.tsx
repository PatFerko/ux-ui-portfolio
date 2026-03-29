import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GalleryItem, type GalleryItemData } from '../components/GalleryItem';
import { useTheme } from '../context/ThemeContext';

// Placeholder gallery items (6–8 items as per spec)
const GALLERY_ITEMS: GalleryItemData[] = [
  {
    id: 'g1',
    type: 'component',
    src: 'https://placehold.co/400x300/6366f1/ffffff?text=Button+System',
    alt: 'Button component system with variants',
    isInteractive: false,
  },
  {
    id: 'g2',
    type: 'motion',
    src: 'https://placehold.co/400x500/8b5cf6/ffffff?text=Motion+Design',
    alt: 'Micro-interaction motion design preview',
    isInteractive: false,
  },
  {
    id: 'g3',
    type: 'branding',
    src: 'https://placehold.co/400x250/ec4899/ffffff?text=Brand+Identity',
    alt: 'Brand identity and logo system',
    isInteractive: false,
  },
  {
    id: 'g4',
    type: 'component',
    src: 'https://placehold.co/400x350/14b8a6/ffffff?text=Form+Components',
    alt: 'Accessible form component library',
    isInteractive: true,
  },
  {
    id: 'g5',
    type: 'motion',
    src: 'https://placehold.co/400x450/f59e0b/ffffff?text=Page+Transitions',
    alt: 'Animated page transition sequences',
    isInteractive: false,
  },
  {
    id: 'g6',
    type: 'branding',
    src: 'https://placehold.co/400x300/10b981/ffffff?text=Color+System',
    alt: 'Design system color palette and tokens',
    isInteractive: false,
  },
  {
    id: 'g7',
    type: 'component',
    src: 'https://placehold.co/400x400/3b82f6/ffffff?text=Card+Variants',
    alt: 'Card component variants and states',
    isInteractive: true,
  },
  {
    id: 'g8',
    type: 'motion',
    src: 'https://placehold.co/400x280/f43f5e/ffffff?text=Loading+States',
    alt: 'Animated loading state components',
    isInteractive: false,
  },
];

export function GallerySection() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedItem, setSelectedItem] = useState<GalleryItemData | null>(null);

  const isDark = theme === 'dark';

  function handleSelect(item: GalleryItemData) {
    setSelectedItem(item);
  }

  function handleClose() {
    setSelectedItem(null);
  }

  function handleCloseKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClose();
    }
  }

  return (
    <section
      id="gallery"
      className={`py-20 ${isDark ? 'bg-gray-950' : 'bg-white'}`}
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className={`text-sm font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
            Visual Showcase
          </p>
          <h2
            id="gallery-heading"
            className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Gallery
          </h2>
          <p className={`mt-3 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            UI components, motion design, and branding work — curated highlights from the design system.
          </p>
        </div>

        {/* Masonry grid — CSS columns */}
        <div
          className="columns-2 md:columns-3 gap-4"
          role="list"
          aria-label="Gallery items"
        >
          {GALLERY_ITEMS.map((item) => (
            <div key={item.id} role="listitem">
              <GalleryItem item={item} onSelect={handleSelect} />
            </div>
          ))}
        </div>
      </div>

      {/* Focused / enlarged view overlay */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Centered enlarged item */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
              <motion.div
                key="focused"
                className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl
                  ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-modal="true"
                aria-label={selectedItem.alt}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="w-full h-auto object-cover"
                />
                <div className={`p-4 flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedItem.alt}
                    </p>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                      {selectedItem.isInteractive && ' · Interactive'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    onKeyDown={handleCloseKeyDown}
                    className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                      ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    aria-label="Close focused view"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
