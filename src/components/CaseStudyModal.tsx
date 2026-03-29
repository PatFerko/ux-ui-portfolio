import { useEffect, useRef, lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { CaseStudy } from './CaseStudyCard';
import type { PrototypeScreen } from './InteractiveCaseStudy';

const LazyInteractiveCaseStudy = lazy(() =>
  import('./InteractiveCaseStudy').then((m) => ({ default: m.InteractiveCaseStudy }))
);

interface CaseStudyModalProps {
  study: CaseStudy | null;
  isOpen: boolean;
  onClose: () => void;
  interactiveCaseStudy?: boolean;
  prototypeScreens?: PrototypeScreen[];
}

const PHASE_LABELS: Record<string, string> = {
  research: 'Research',
  wireframes: 'Wireframes',
  ui: 'UI Design',
  implementation: 'Implementation',
};

const PHASE_ICONS: Record<string, string> = {
  research: '🔍',
  wireframes: '✏️',
  ui: '🎨',
  implementation: '⚙️',
};

export function CaseStudyModal({ study, isOpen, onClose, interactiveCaseStudy = false, prototypeScreens = [] }: CaseStudyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [interactiveLoaded, setInteractiveLoaded] = useState(false);

  // Open/close native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      // Focus close button on open
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  // Close on native dialog cancel (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const backdropVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } };

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
      };

  return (
    <dialog
      ref={dialogRef}
      className="p-0 m-0 max-w-none max-h-none w-full h-full bg-transparent backdrop:bg-transparent fixed inset-0 overflow-hidden"
      aria-modal="true"
      aria-label={study ? `${study.title} case study` : 'Case study'}
    >
      <AnimatePresence>
        {isOpen && study && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
            >
              <motion.div
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                role="document"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{study.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Close case study"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                  {/* Problem Statement */}
                  <section aria-labelledby="problem-heading">
                    <h3 id="problem-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
                      Problem Statement
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{study.problemStatement}</p>
                  </section>

                  {/* Process Narrative */}
                  <section aria-labelledby="process-heading">
                    <h3 id="process-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4">
                      Process
                    </h3>
                    <div className="space-y-5">
                      {study.processNarrative.map((step) => (
                        <div key={step.phase} className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg" aria-hidden="true">
                            {PHASE_ICONS[step.phase]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                              {PHASE_LABELS[step.phase]}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                            {step.assets.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.assets.map((asset, i) => (
                                  <img
                                    key={i}
                                    src={asset}
                                    data-src={asset}
                                    alt={`${PHASE_LABELS[step.phase]} asset ${i + 1}`}
                                    className="h-16 w-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64"%3E%3Crect width="96" height="64" fill="%23e5e7eb"/%3E%3Ctext x="48" y="36" text-anchor="middle" fill="%239ca3af" font-size="10"%3ENo image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Before / After Visuals */}
                  {study.beforeAfterVisuals.length > 0 && (
                    <section aria-labelledby="before-after-heading">
                      <h3 id="before-after-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4">
                        Before &amp; After
                      </h3>
                      <div className="space-y-4">
                        {study.beforeAfterVisuals.map((pair, i) => (
                          <div key={i} className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Before</p>
                              <img
                                src={pair.before}
                                data-src={pair.before}
                                alt={`Before redesign — ${study.title}`}
                                className="w-full rounded-xl object-cover bg-gray-100 dark:bg-gray-800 aspect-video"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23e5e7eb"/%3E%3Ctext x="200" y="118" text-anchor="middle" fill="%239ca3af" font-size="14"%3EBefore%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">After</p>
                              <img
                                src={pair.after}
                                data-src={pair.after}
                                alt={`After redesign — ${study.title}`}
                                className="w-full rounded-xl object-cover bg-gray-100 dark:bg-gray-800 aspect-video"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23d1fae5"/%3E%3Ctext x="200" y="118" text-anchor="middle" fill="%2310b981" font-size="14"%3EAfter%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Metrics */}
                  {study.metrics.length > 0 && (
                    <section aria-labelledby="metrics-heading">
                      <h3 id="metrics-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
                        Key Outcomes
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {study.metrics.map((metric, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-indigo-500 mt-0.5 flex-shrink-0">✓</span>
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Code View */}
                  {study.codeView && (
                    <section aria-labelledby="code-heading">
                      <h3 id="code-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
                        Technical Implementation
                      </h3>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {study.codeView.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-600"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <ul className="space-y-1.5">
                          {study.codeView.highlights.map((h, i) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                              <span className="text-indigo-400 flex-shrink-0">▸</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={study.codeView.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                        >
                          View Repository →
                        </a>
                      </div>
                    </section>
                  )}

                  {/* Interactive Case Study Prototype — lazy-loaded when feature flag is enabled */}
                  {interactiveCaseStudy && prototypeScreens.length > 0 && (
                    <section aria-labelledby="prototype-heading">
                      <h3 id="prototype-heading" className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
                        Interactive Prototype
                      </h3>
                      {!interactiveLoaded && (
                        <button
                          onClick={() => setInteractiveLoaded(true)}
                          className="w-full py-3 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          Launch Interactive Prototype
                        </button>
                      )}
                      {interactiveLoaded && (
                        <Suspense
                          fallback={
                            <div className="py-8 flex items-center justify-center text-gray-400 dark:text-gray-600">
                              <span className="animate-pulse">Loading prototype…</span>
                            </div>
                          }
                        >
                          <LazyInteractiveCaseStudy screens={prototypeScreens} />
                        </Suspense>
                      )}
                    </section>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </dialog>
  );
}
