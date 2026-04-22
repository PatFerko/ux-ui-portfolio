import { useEffect, useRef, lazy, Suspense, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { CaseStudy } from "./CaseStudyCard";
import type { PrototypeScreen } from "./InteractiveCaseStudy";

const LazyInteractiveCaseStudy = lazy(() =>
  import("./InteractiveCaseStudy").then((m) => ({
    default: m.InteractiveCaseStudy,
  })),
);

interface CaseStudyModalProps {
  study: CaseStudy | null;
  isOpen: boolean;
  onClose: () => void;
  interactiveCaseStudy?: boolean;
  prototypeScreens?: PrototypeScreen[];
}

const PHASE_LABELS: Record<string, string> = {
  goals: "Goals",
  solution: "Solution",
  flow: "User Flow",
  wireframes_final: "Wireframes & Final Screens",
  wireframes: "Wireframes",
  system: "System Logic",
  learnings: "Learnings",
};

const PHASE_ICONS: Record<string, string> = {
  goals: "\u{1F3AF}",
  solution: "\u{1F4A1}",
  flow: "\u{1F504}",
  wireframes_final: "\u{270F}\u{FE0F}",
  wireframes: "\u{270F}\u{FE0F}",
  system: "\u{2699}\u{FE0F}",
  learnings: "\u{1F4DD}",
};

const PHASE_ICON_BG: Record<string, string> = {
  goals: "bg-green-50 dark:bg-green-900/20",
  solution: "bg-amber-50 dark:bg-amber-900/20",
  flow: "bg-blue-50 dark:bg-blue-900/20",
  wireframes_final: "bg-violet-50 dark:bg-violet-900/20",
  wireframes: "bg-violet-50 dark:bg-violet-900/20",
  system: "bg-slate-100 dark:bg-slate-800/40",
  learnings: "bg-rose-50 dark:bg-rose-900/20",
};

export function CaseStudyModal({
  study,
  isOpen,
  onClose,
  interactiveCaseStudy = false,
  prototypeScreens = [],
}: CaseStudyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [interactiveLoaded, setInteractiveLoaded] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [lightboxGroup, setLightboxGroup] = useState<
    { src: string; alt: string }[]
  >([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
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
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const backdropVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
      };

  function openLightbox(
    src: string,
    alt: string,
    group?: { src: string; alt: string }[],
    index?: number,
  ) {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxGroup(group ?? []);
    setLightboxIndex(index ?? 0);
  }
  function closeLightbox() {
    setLightboxSrc(null);
    setLightboxAlt("");
    setLightboxGroup([]);
    setLightboxIndex(0);
  }
  function lightboxPrev() {
    if (lightboxGroup.length <= 1) return;
    const i = (lightboxIndex - 1 + lightboxGroup.length) % lightboxGroup.length;
    setLightboxIndex(i);
    setLightboxSrc(lightboxGroup[i].src);
    setLightboxAlt(lightboxGroup[i].alt);
  }
  function lightboxNext() {
    if (lightboxGroup.length <= 1) return;
    const i = (lightboxIndex + 1) % lightboxGroup.length;
    setLightboxIndex(i);
    setLightboxSrc(lightboxGroup[i].src);
    setLightboxAlt(lightboxGroup[i].alt);
  }

  /** Parse **bold** and {{color:text}} markers */
  function renderRichText(text: string) {
    return text.split(/(\*\*[^*]+\*\*|\{\{[^}]+\}\})/).map((part, i) => {
      const bold = part.match(/^\*\*(.+)\*\*$/);
      if (bold)
        return (
          <strong
            key={i}
            className="font-semibold text-gray-900 dark:text-white"
          >
            {bold[1]}
          </strong>
        );
      const color = part.match(/^\{\{(green|orange|red):(.+)\}\}$/);
      if (color) {
        const cls =
          color[1] === "green"
            ? "text-green-600 dark:text-green-400"
            : color[1] === "orange"
              ? "text-orange-500 dark:text-orange-400"
              : "text-red-500 dark:text-red-400";
        return (
          <strong key={i} className={`font-semibold ${cls}`}>
            {color[2]}
          </strong>
        );
      }
      return part;
    });
  }

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" as const },
        },
      };

  return (
    <dialog
      ref={dialogRef}
      className="p-0 m-0 max-w-none max-h-none w-full h-full bg-transparent backdrop:bg-transparent fixed inset-0 overflow-hidden"
      aria-modal="true"
      aria-label={study ? `${study.title} case study` : "Case study"}
    >
      <AnimatePresence>
        {isOpen && study && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                role="document"
              >
                {/* Accent gradient bar */}
                <div
                  className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-t-2xl"
                  aria-hidden="true"
                />

                {/* Header — sticky with scroll shadow */}
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 sm:px-8 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold text-violet-900 dark:text-violet-300 leading-tight">
                      {study.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Larger close button for better touch target */}
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Close case study"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 sm:px-8 py-8 space-y-10">
                  {/* Context */}
                  {(study.overview || study.introduction) && (
                    <section
                      aria-labelledby="overview-heading"
                      className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-5 -mx-1"
                    >
                      <h3
                        id="overview-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Context
                      </h3>

                      <p className="text-base text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-line">
                        {study.overview}
                      </p>
                    </section>
                  )}
                  {/* Problem */}
                  <section
                    aria-labelledby="problem-heading"
                    className="rounded-xl bg-amber-50/40 dark:bg-amber-950/10 p-5 -mx-1"
                  >
                    <h3
                      id="problem-heading"
                      className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                    >
                      Problem
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-line">
                      {study.problemStatement}
                    </p>
                  </section>

                  {/* Key Insight */}
                  {study.keyInsight && (
                    <section
                      aria-labelledby="key-insight-heading"
                      className="p-5 -mx-1"
                    >
                      <h3
                        id="key-insight-heading"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3"
                      >
                        Key Insight
                      </h3>

                      <p className="text-base text-gray-700 dark:text-gray-300 leading-7">
                        {study.keyInsight}
                      </p>
                    </section>
                  )}

                  {/* Decision */}
                  {study.designGoal && (
                    <section
                      aria-labelledby="design-goal-heading"
                      className="p-5 -mx-1"
                    >
                      <h3
                        id="design-goal-heading"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3"
                      >
                        Decision
                      </h3>

                      <p className="text-base text-gray-700 dark:text-gray-300 leading-7  whitespace-pre-line">
                        {study.designGoal}
                      </p>
                    </section>
                  )}

                  {/* Solution */}
                  {study.hypothesis && (
                    <section
                      aria-labelledby="hypothesis-heading"
                      className="p-5 -mx-1"
                    >
                      <h3
                        id="hypothesis-heading"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3"
                      >
                        Solution
                      </h3>

                      <div className="space-y-3">
                        {study.hypothesis.split("\n\n").map((para, i) => (
                          <p key={i} className="text-base font-medium text-gray-800 dark:text-gray-200 leading-7">
                            {para}
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Trade-offs */}
                  {study.tradeoffs && (
                    <section
                      aria-labelledby="tradeoffs-heading"
                      className="p-5 -mx-1"
                    >
                      <h3
                        id="tradeoffs-heading"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3"
                      >
                        Trade-offs
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-line">
                        {study.tradeoffs}
                      </p>
                    </section>
                  )}

                  {/* Process */}
                  <section aria-labelledby="process-heading">
                    <h3
                      id="process-heading"
                      className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-6"
                    >
                      Process
                    </h3>
                    {study.processIntro && (
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-7 mb-8">
                        {study.processIntro}
                      </p>
                    )}
                    <div className="space-y-8">
                      {study.processNarrative.map((step) => (
                        <div key={step.phase} className="flex gap-4">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-xl ${PHASE_ICON_BG[step.phase] || "bg-indigo-50 dark:bg-indigo-900/30"} flex items-center justify-center text-lg`}
                            aria-hidden="true"
                          >
                            {PHASE_ICONS[step.phase]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                              {PHASE_LABELS[step.phase]}
                            </h4>

                            {step.phase === "learnings" ? (
                              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {step.description
                                  .split("|")
                                  .filter(Boolean)
                                  .map((s, si) => (
                                    <li key={si} className="flex gap-2.5">
                                      <span className="text-indigo-400 flex-shrink-0 mt-0.5">
                                        &bull;
                                      </span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                              </ul>
                            ) : step.phase === "flow" ? (
                              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 leading-7">
                                {step.description
                                  .split("\n\n\n\n")
                                  .map((para, pi) => (
                                    <div key={pi} className="flex-1">
                                      {para.split("\n\n").map((line, li) => (
                                        <p key={li}>{renderRichText(line)}</p>
                                      ))}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-7">
                                {step.description
                                  .split("\n\n")
                                  .map((para, pi) => (
                                    <p key={pi}>{renderRichText(para)}</p>
                                  ))}
                              </div>
                            )}

                            {/* Key Decisions sub-list */}
                            {step.keyDecisions &&
                              step.keyDecisions.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
                                    Key Design Decisions
                                  </h5>
                                  <ul className="space-y-1.5">
                                    {step.keyDecisions.map((d, j) => (
                                      <li
                                        key={j}
                                        className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                                      >
                                        <span className="text-indigo-400 flex-shrink-0 mt-0.5">
                                          &bull;
                                        </span>
                                        {d}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Asset thumbnails — larger for usability */}
                            {step.assets.length > 0 && (
                              <div className="flex flex-wrap gap-3 mt-4">
                                {step.assets.map((asset, i) => {
                                  const group = step.assets.map((a, j) => ({
                                    src: a,
                                    alt: `${PHASE_LABELS[step.phase]} asset ${j + 1}`,
                                  }));
                                  return (
                                    <img
                                      key={i}
                                      src={asset}
                                      data-src={asset}
                                      alt={`${PHASE_LABELS[step.phase]} asset ${i + 1}`}
                                      className="h-20 w-32 object-cover rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 hover:border-indigo-400 transition-all"
                                      loading="lazy"
                                      onClick={() =>
                                        openLightbox(
                                          asset,
                                          `${PHASE_LABELS[step.phase]} asset ${i + 1}`,
                                          group,
                                          i,
                                        )
                                      }
                                      onError={(e) => {
                                        (
                                          e.currentTarget as HTMLImageElement
                                        ).src =
                                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="80" viewBox="0 0 128 80"%3E%3Crect width="128" height="80" fill="%23e5e7eb"/%3E%3Ctext x="64" y="44" text-anchor="middle" fill="%239ca3af" font-size="11"%3ENo image%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Key Decisions */}
                  {study.metrics.length > 0 && (
                    <section aria-labelledby="metrics-heading">
                      <h3
                        id="metrics-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Key Decisions
                      </h3>
                      <ul className="space-y-2">
                        {study.metrics.map((metric, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-indigo-500 mt-0.5 flex-shrink-0">
                              {"\u2713"}
                            </span>
                            <span>
                              {metric.split(/\*\*/).map((part, pi) =>
                                pi % 2 === 1 ? (
                                  <strong
                                    key={pi}
                                    className="font-semibold text-gray-900 dark:text-white"
                                  >
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                ),
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Learnings */}
                  {study.learnings && (
                    <section aria-labelledby="learnings-heading">
                      <h3
                        id="learnings-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Learnings
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {study.learnings.split("|").filter(Boolean).map((s, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="text-indigo-400 flex-shrink-0 mt-0.5">&bull;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Before / After */}
                  {study.beforeAfterVisuals.length > 0 && (
                    <section aria-labelledby="before-after-heading">
                      <h3
                        id="before-after-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-4"
                      >
                        Before &amp; After
                      </h3>
                      <div className="space-y-4">
                        {study.beforeAfterVisuals.map((pair, i) => (
                          <div key={i} className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Before
                              </p>
                              <img
                                src={pair.before}
                                data-src={pair.before}
                                alt={`Before redesign — ${study.title}`}
                                className="w-full rounded-xl object-cover object-top bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-video cursor-pointer hover:opacity-80 transition-opacity"
                                loading="lazy"
                                onClick={() =>
                                  openLightbox(
                                    pair.before,
                                    `Before redesign — ${study.title}`,
                                  )
                                }
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23e5e7eb"/%3E%3Ctext x="200" y="118" text-anchor="middle" fill="%239ca3af" font-size="14"%3EBefore%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                After
                              </p>
                              <img
                                src={pair.after}
                                data-src={pair.after}
                                alt={`After redesign — ${study.title}`}
                                className="w-full rounded-xl object-cover object-top bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-video cursor-pointer hover:opacity-80 transition-opacity"
                                loading="lazy"
                                onClick={() =>
                                  openLightbox(
                                    pair.after,
                                    `After redesign — ${study.title}`,
                                  )
                                }
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23d1fae5"/%3E%3Ctext x="200" y="118" text-anchor="middle" fill="%2310b981" font-size="14"%3EAfter%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tools */}
                  {study.codeView && (
                    <section aria-labelledby="tools-heading">
                      <h3
                        id="tools-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Tools
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {study.codeView.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Interactive Prototype */}
                  {interactiveCaseStudy && prototypeScreens.length > 0 && (
                    <section aria-labelledby="prototype-heading">
                      <h3
                        id="prototype-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
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
                              <span className="animate-pulse">
                                Loading prototype…
                              </span>
                            </div>
                          }
                        >
                          <LazyInteractiveCaseStudy
                            screens={prototypeScreens}
                          />
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

      {/* Image lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              onClick={closeLightbox}
            />
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <motion.div
                className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center"
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }
                }
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightboxSrc}
                  alt={lightboxAlt}
                  className="max-w-full max-h-[85vh] rounded-xl object-contain"
                />
                {lightboxGroup.length > 1 && (
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={lightboxPrev}
                      className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Previous image"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M11 14L6 9l5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-white/80 tabular-nums">
                      {lightboxIndex + 1} / {lightboxGroup.length}
                    </span>
                    <button
                      onClick={lightboxNext}
                      className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Next image"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 4l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <button
                  onClick={closeLightbox}
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Close enlarged image"
                >
                  &times;
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </dialog>
  );
}
