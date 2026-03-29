import { useState, useCallback } from 'react';

export interface PrototypeScreen {
  id: string;
  label: string;
  imageUrl: string;
  description?: string;
}

interface InteractiveCaseStudyProps {
  screens: PrototypeScreen[];
}

/**
 * Navigates through prototype screens with wrapping next/previous controls.
 * Next from last screen wraps to first; previous from first wraps to last.
 */
export function InteractiveCaseStudy({ screens }: InteractiveCaseStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % screens.length);
  }, [screens.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + screens.length) % screens.length);
  }, [screens.length]);

  if (screens.length === 0) return null;

  const screen = screens[currentIndex];

  return (
    <div className="space-y-4" data-testid="interactive-case-study">
      {/* Screen display */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
        <img
          src={screen.imageUrl}
          alt={screen.label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23e5e7eb"/%3E%3Ctext x="200" y="118" text-anchor="middle" fill="%239ca3af" font-size="14"%3EPrototype Screen%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Screen info and controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={goPrevious}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Previous screen"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>

        <div className="text-center flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {screen.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {screens.length}
          </p>
          {screen.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {screen.description}
            </p>
          )}
        </div>

        <button
          onClick={goNext}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Next screen"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Screen indicator dots */}
      {screens.length > 1 && (
        <div className="flex justify-center gap-1.5" role="tablist" aria-label="Prototype screens">
          {screens.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-indigo-500'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Go to screen ${i + 1}: ${s.label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Pure navigation logic — used by both the component and property tests.
 * Returns the new index after pressing next or previous.
 */
export function navigatePrototype(
  currentIndex: number,
  direction: 'next' | 'previous',
  totalScreens: number
): number {
  if (totalScreens <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % totalScreens;
  }
  return (currentIndex - 1 + totalScreens) % totalScreens;
}
