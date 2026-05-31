import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GalleryItem, type GalleryItemData } from '../components/GalleryItem';
import { useTheme } from '../context/ThemeContext';

// Placeholder gallery items (6–8 items as per spec)
const GALLERY_ITEMS: GalleryItemData[] = [
  {
    id: 'g1',
    type: '',
    src: '/resources/Bft-App/Overview-iPhoneMockup.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g10',
    type: '',
    src: '/resources/Bft-App/Overview Desktop.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g2',
    type: '',
    src: '/resources/Bft-App/Confirmation-iPh15ProMockup.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g11',
    type: '',
    src: '/resources/FromGithub/artGalleryHomepage.png',
    alt: '',
    isInteractive: false,
  },
 
  {
    id: 'g4',
    type: '',
    src: '/resources/Bft-App/ConfirmationiPh17.png',
    alt: '',
    isInteractive: false,
  },
   {
    id: 'g3',
    type: '',
    src: '/resources/FromGithub/productsPage.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g5',
    type: '',
    src: '/resources/Bft-App/iPhone 15 Pro.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g6',
    type: '',
    src: '/resources/Bft-App/Desktop-Overview3.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g7',
    type: '',
    src: '/resources/Bft-App/Overview-M2.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g8',
    type: '',
    src: '/resources/Bft-App/MockupHandsOverview.png',
    alt: '',
    isInteractive: false,
  },
  {
    id: 'g9',
    type: '',
    src: '/resources/Bft-App/BookingSlots-iPh1ProMockup.png',
    alt: '',
    isInteractive: false,
  },

];

export function GallerySection() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [selectedItem, setSelectedItem] = useState<GalleryItemData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isDark = theme === 'dark';

  function handleSelect(item: GalleryItemData) {
    const idx = GALLERY_ITEMS.findIndex(g => g.id === item.id);
    setSelectedItem(item);
    setSelectedIndex(idx);
  }

  function handlePrev() {
    const newIndex = (selectedIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
    setSelectedIndex(newIndex);
    setSelectedItem(GALLERY_ITEMS[newIndex]);
  }

  function handleNext() {
    const newIndex = (selectedIndex + 1) % GALLERY_ITEMS.length;
    setSelectedIndex(newIndex);
    setSelectedItem(GALLERY_ITEMS[newIndex]);
  }

  function handleClose() {
    setSelectedItem(null);
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
            UI bits, motion experiments, and visual explorations.
          </p>
        </div>

        {/* Masonry grid — CSS columns */}
        <div
          className="columns-1 sm:columns-2 md:columns-3 gap-4"
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
                className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative bg-transparent`}
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
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                {/* Navigation arrows */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 dark:bg-gray-700/30 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/30 dark:hover:bg-gray-600/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Previous image"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 dark:bg-gray-700/30 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/30 dark:hover:bg-gray-600/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Next image"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
