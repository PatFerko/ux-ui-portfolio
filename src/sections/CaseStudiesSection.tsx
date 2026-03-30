import { lazy, Suspense, useRef, useState } from 'react';
import { CaseStudyCard } from '../components/CaseStudyCard';
import type { CaseStudy } from '../components/CaseStudyCard';
import rawStudies from '../data/caseStudies.json';

const CaseStudyModal = lazy(() =>
  import('../components/CaseStudyModal').then((m) => ({ default: m.CaseStudyModal }))
);

// Clamp to 3–6 entries per spec requirement 2.1
const caseStudies: CaseStudy[] = (rawStudies as CaseStudy[]).slice(0, 6);

export function CaseStudiesSection() {
  const [activeStudy, setActiveStudy] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoaded, setModalLoaded] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  function handleOpen(study: CaseStudy, triggerEl: HTMLElement) {
    triggerRef.current = triggerEl;
    setActiveStudy(study);
    setModalLoaded(true);
    setIsModalOpen(true);
  }

  function handleClose() {
    setIsModalOpen(false);
    // Return focus to the trigger element
    if (triggerRef.current) {
      const btn = triggerRef.current.querySelector<HTMLElement>('button[aria-label^="Open"]');
      (btn ?? triggerRef.current).focus();
    }
  }

  return (
    <section
      id="work"
      className="py-20 bg-gray-50 dark:bg-gray-900"
      aria-labelledby="work-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2
            id="work-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
          >
            Selected Work
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Personal projects inspired by real-world experience...
          </p>
        </div>

        {/* Horizontal scroll container with scroll-snap */}
        <div
          className="flex gap-6 overflow-x-auto p-2 -m-2 pb-6 snap-x snap-mandatory scroll-smooth justify-center"
          style={{ scrollbarWidth: 'thin' }}
          role="list"
          aria-label="Case studies"
        >
          {caseStudies.map((study) => (
            <div key={study.id} role="listitem" className="snap-start">
              <CaseStudyCard study={study} onOpen={handleOpen} />
            </div>
          ))}
        </div>
      </div>

      {/* Lazy-loaded modal — only mounted after first open */}
      {modalLoaded && (
        <Suspense fallback={null}>
          <CaseStudyModal
            study={activeStudy}
            isOpen={isModalOpen}
            onClose={handleClose}
          />
        </Suspense>
      )}
    </section>
  );
}
