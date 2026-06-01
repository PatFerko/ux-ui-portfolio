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
  const [lightboxSmall, setLightboxSmall] = useState(false);
  const [activeTab, setActiveTab] = useState<"uxui" | "product">("uxui");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      setActiveTab("uxui");
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
    small?: boolean,
  ) {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxGroup(group ?? []);
    setLightboxIndex(index ?? 0);
    setLightboxSmall(small ?? false);
  }
  function closeLightbox() {
    setLightboxSrc(null);
    setLightboxAlt("");
    setLightboxGroup([]);
    setLightboxIndex(0);
    setLightboxSmall(false);
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

            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:p-8 pointer-events-none">
              <motion.div
                className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-2xl bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto"
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      {study.title}
                    </h2>
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
                {/* Hero section — two column: text left, image right */}
                {study.heroImage ? (
                  <div className="flex flex-col sm:flex-row items-stretch gap-0">
                    {/* Text side */}
                    <div className="flex-1 px-8 sm:px-12 py-6 flex flex-col justify-center">
                      {study.tagline && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-justify">
                          {study.tagline}
                        </p>
                      )}
                    </div>
                    {/* Image side */}
                    <div className="sm:flex-[1.4] overflow-hidden bg-gray-100 dark:bg-gray-800 sm:rounded-none">
                      <img
                        src={study.heroImage}
                        alt={`${study.title} hero`}
                        className="w-full h-56 sm:h-full object-cover object-top"
                      />
                    </div>
                  </div>
                ) : (
                  /* No hero image — just show tags below header */
                  study.tags.length > 0 && (
                    <div className="px-6 sm:px-8 pb-4 flex flex-wrap gap-2">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )
                )}

                {/* Background note */}
                {study.backgroundNote && (
                  <div className="px-6 sm:px-10 py-8 border-b border-gray-100 dark:border-gray-800">
                    <blockquote className="relative text-center max-w-lg mx-auto">
                      <span className="absolute -top-4 -left-2 text-4xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                      <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed px-4">
                        {study.backgroundNote}
                      </p>
                      <span className="absolute -bottom-4 -right-2 text-4xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                    </blockquote>
                  </div>
                )}

                {/* Toggle — below hero, above tab content */}
                <div className="px-6 sm:px-8 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab("uxui")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        activeTab === "uxui"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      aria-pressed={activeTab === "uxui"}
                    >
                      UX/UI
                    </button>
                    <button
                      onClick={() => setActiveTab("product")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        activeTab === "product"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      aria-pressed={activeTab === "product"}
                    >
                      Product Decisions
                    </button>
                  </div>
                </div>

                <div className="px-6 sm:px-8 py-8 space-y-10">

                  {/* UX/UI tab */}
                  {activeTab === "uxui" && (
                    <div className="space-y-6">
                      {/* Tags */}
                      {study.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {study.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {([
                        { key: "context",             label: "Context",                value: study.uxui?.context,             bg: "rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-5 -mx-1" },
                        { key: "userPainPoints",      label: "User Pain Points",       value: study.uxui?.userPainPoints,      bg: "rounded-xl bg-amber-50/40 dark:bg-amber-950/10 p-5 -mx-1" },
                        { key: "uxGoal",              label: "UX Goal",                value: study.uxui?.uxGoal,              bg: "rounded-xl bg-violet-50/50 dark:bg-violet-950/20 p-5 -mx-1" },
                        { key: "uxDecisions",         label: "UX Decisions",           value: study.uxui?.uxDecisions,         bg: "rounded-xl bg-slate-50/60 dark:bg-slate-800/30 p-5 -mx-1" },
                        { key: "designTradeoffs",     label: "Design Tradeoffs",       value: study.uxui?.designTradeoffs,     bg: "rounded-xl bg-orange-50/40 dark:bg-orange-950/10 p-5 -mx-1" },
                        { key: "userFlow",            label: study.id === "health-app" ? "Final Screens" : "User Flow", value: study.uxui?.userFlow, bg: "rounded-xl bg-blue-50/40 dark:bg-blue-950/10 p-5 -mx-1" },
                        { key: "accessibilityClarity",label: "Accessibility & Clarity",value: study.uxui?.accessibilityClarity,bg: "rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 p-5 -mx-1" },
                      ] as { key: string; label: string; value?: string; bg: string }[]).filter(({ value }) => !!value).map(({ key, label, value: rawValue, bg }) => {
                        const value = rawValue!;
                        return (
                        <section key={key} className={bg}>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">
                            {label}
                          </h3>
                          <div className="space-y-3">
                              {value.includes("|") ? (
                                value.split("|").filter(Boolean)[0].startsWith("##") ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                                    {value.split("|").filter(Boolean).map((item, i) => {
                                      const match = item.match(/^##(.+?)##(.+?)(?:##img##(.+)|##imgbelow##(.+)|##imgleft##(.+)|##imgsmall##(.+)|##imgleftsmall##(.+)|##imgleft2##(.+?)|##imgbelow2##(.+?)|##imgbelowfull##(.+?)|##imgcompact##(.+?))?$/s);
                                      if (match) {
                                        const imgRight = match[3];
                                        const imgBelow = match[4];
                                        const imgLeft = match[5];
                                        const imgSmall = match[6];
                                        const imgLeftSmall = match[7];
                                        const imgLeft2 = match[8] ? match[8].split(";").filter(Boolean) : null;
                                        const imgBelow2 = match[9] ? match[9].split(";").filter(Boolean) : null;
                                        const imgBelowFull = match[10];
                                        const imgCompact = match[11];
                                        const hasInline = !!(imgRight || imgLeft || imgSmall || imgLeftSmall || imgLeft2 || imgCompact);
                                        const isFullWidth = hasInline || !!imgBelowFull || (!imgBelow && !imgBelow2);
                                        return (
                                          <div key={i} className={hasInline ? "flex flex-col sm:flex-row gap-6 items-start py-2 sm:col-span-2" : isFullWidth ? "py-1 sm:col-span-2" : "flex flex-col items-center text-center py-3 h-full"}>
                                            {(imgLeft || imgLeftSmall) && (
                                              <div className={`flex-shrink-0 p-1 mt-1 ${imgLeftSmall ? "sm:w-16" : "sm:w-28"}`}>
                                                <img
                                                  src={imgLeft || imgLeftSmall}
                                                  alt={match[1]}
                                                  className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                  onClick={() => openLightbox((imgLeft || imgLeftSmall)!, match[1])}
                                                />
                                              </div>
                                            )}
                                            {imgLeft2 && (
                                              <div className="flex gap-3 flex-shrink-0 mt-1 items-start">
                                                {imgLeft2.map((src, idx) => {
                                                  const group = imgLeft2.map((s, gi) => ({ src: s.trim(), alt: `${match[1]} ${gi + 1}` }));
                                                  return (
                                                    <div key={idx} className="w-16 flex-shrink-0">
                                                      <img
                                                        src={src.trim()}
                                                        alt={`${match[1]} ${idx + 1}`}
                                                        className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                        onClick={() => openLightbox(src.trim(), `${match[1]} ${idx + 1}`, group, idx)}
                                                      />
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                            <div className={hasInline ? "flex-1" : ""}>
                                              <div className={!hasInline && !isFullWidth ? "min-h-28" : ""}>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                  {match[1]}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                                                  {match[2]}
                                                </p>
                                              </div>
                                              {imgBelow && (
                                                <div className="mt-3 w-full flex justify-center">
                                                  <img
                                                    src={imgBelow}
                                                    alt={match[1]}
                                                    className="w-24 rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                    onClick={() => openLightbox(imgBelow, match[1])}
                                                  />
                                                </div>
                                              )}
                                              {imgBelow2 && (
                                                <div className="flex gap-4 mt-4 items-start justify-center">
                                                  {imgBelow2.map((src, idx) => {
                                                    const group = imgBelow2.map((s, gi) => ({ src: s.trim(), alt: `${match[1]} ${gi + 1}` }));
                                                    return (
                                                      <div key={idx} className="w-24 flex-shrink-0">
                                                        <img
                                                          src={src.trim()}
                                                          alt={`${match[1]} ${idx + 1}`}
                                                          className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                          onClick={() => openLightbox(src.trim(), `${match[1]} ${idx + 1}`, group, idx)}
                                                        />
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                              {imgBelowFull && (
                                                <div className="mt-6 w-full">
                                                  <img
                                                    src={imgBelowFull}
                                                    alt={match[1]}
                                                    className="w-full rounded-2xl object-cover shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 hover:shadow-xl transition-all duration-300"
                                                    onClick={() => openLightbox(imgBelowFull, match[1])}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                            {(imgRight || imgSmall || imgCompact) && (
                                              <div className={`flex-shrink-0 p-1 mt-1 ${imgSmall ? "sm:w-16" : "sm:w-28"}`}>
                                                <img
                                                  src={imgRight || imgSmall || imgCompact}
                                                  alt={match[1]}
                                                  className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                                  onClick={() => openLightbox((imgRight || imgSmall || imgCompact)!, match[1], undefined, undefined, !!imgCompact)}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                      return <p key={i} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">{item}</p>;
                                    })}
                                  </div>
                                ) : (
                                  <ul className="space-y-2">
                                    {value.split("|").filter(Boolean).map((item, i) => (
                                      <li key={i} className="flex gap-2.5 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <span className="text-indigo-400 flex-shrink-0 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )
                              ) : value.startsWith("##") ? (
                                (() => {
                                  const m = value.match(/^##(.+?)##(.+?)(?:##img##(.+)|##imgleft##(.+))?$/s);
                                  if (!m) return <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{value}</p>;
                                  const imgRight = m[3]; const imgLeft = m[4];
                                  return (
                                    <div className={(imgRight || imgLeft) ? "flex flex-col sm:flex-row gap-6 items-start py-2" : ""}>
                                      {imgLeft && (
                                        <div className="flex-shrink-0 sm:w-28 p-1 mt-1">
                                          <img src={imgLeft} alt={m[1]} className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200" onClick={() => openLightbox(imgLeft, m[1])} />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{m[2]}</p>
                                      </div>
                                      {imgRight && (
                                        <div className="flex-shrink-0 sm:w-28 p-1 mt-1">
                                          <img src={imgRight} alt={m[1]} className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200" onClick={() => openLightbox(imgRight, m[1])} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                value.split("\n\n").map((para, i) => (
                                  <p key={i} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                                    {para}
                                  </p>
                                ))
                              )}
                            </div>
                        </section>
                      );})}

                      {/* Showcase image */}
                      {study.uxui?.showcaseImage && (
                        <div className="my-8 -mx-1">
                          <img
                            src={study.uxui.showcaseImage}
                            alt={`${study.title} showcase`}
                            className="w-full rounded-2xl object-cover shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 hover:shadow-xl transition-all duration-300"
                            onClick={() => openLightbox(study.uxui!.showcaseImage!, `${study.title} showcase`)}
                          />
                        </div>
                      )}

                      {/* Learnings */}
                      {study.uxui?.learnings && (
                        <section className="rounded-xl bg-rose-50/30 dark:bg-rose-950/10 p-5 -mx-1">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">
                            Learnings
                          </h3>
                          <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <ul className="space-y-2 flex-1">
                              {study.uxui.learnings.split("|").filter(Boolean).map((item, i) => (
                                <li key={i} className="flex gap-2.5 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                  <span className="text-indigo-400 flex-shrink-0 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {study.id === "fintech-dashboard" && (
                              <div className="flex-shrink-0 w-20 sm:w-24">
                                <img
                                  src="/resources/Bft-App/Confirmation.png"
                                  alt="Confirmation screen"
                                  className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                  onClick={() => openLightbox("/resources/Bft-App/Confirmation.png", "Confirmation screen")}
                                />
                              </div>
                            )}
                          </div>
                        </section>
                      )}

                      {/* Expected Impact */}
                      {study.uxui?.finalImpact && (
                        <section className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-5 -mx-1">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">
                            Expected Impact
                          </h3>
                          <div className="space-y-3">
                            {study.uxui.finalImpact.includes("|") ? (
                              <ul className="space-y-2">
                                {study.uxui.finalImpact.split("|").filter(Boolean).map((item, i) => (
                                  <li key={i} className="flex gap-2.5 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                    <span className="text-indigo-400 flex-shrink-0 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                                {study.uxui.finalImpact}
                              </p>
                            )}
                          </div>
                        </section>
                      )}
                    </div>
                  )}

                  {/* Product Thinking tab — existing content */}
                  {activeTab === "product" && (<>
                  {/* Observation from hospitality experience */}
                  {study.observationFromExperience && (
                    <section
                      aria-labelledby="observation-heading"
                      className="rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 p-5 -mx-1"
                    >
                      <h3
                        id="observation-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Observation from Hospitality Experience
                      </h3>

                      <div className="space-y-3">
                        {study.observationFromExperience.split("\n\n").map((para, i) => (
                          <p key={i} className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                            {renderRichText(para)}
                          </p>
                        ))}
                      </div>
                    </section>
                  )}
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

                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug text-justify">
                        {renderRichText(study.overview ?? "")}
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
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-snug whitespace-pre-line text-justify">
                      {study.problemStatement}
                    </p>
                    {study.id === "fintech-dashboard" && (
                      <div className="mt-5 w-full sm:w-3/4 mx-auto">
                        <img
                          src="/resources/Bft-App/MockupHandsOverview.png"
                          alt="App mockup showing breakfast overview"
                          className="w-full rounded-2xl object-cover shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 hover:shadow-xl transition-all duration-300"
                          onClick={() => openLightbox("/resources/Bft-App/MockupHandsOverview.png", "App mockup showing breakfast overview")}
                        />
                      </div>
                    )}
                  </section>

                  {/* Key Insight */}
                  {study.keyInsight && (
                    <section
                      aria-labelledby="key-insight-heading"
                      className="p-5 -mx-1 my-8"
                    >
                      <h3
                        id="key-insight-heading"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3"
                      >
                        Key Insight
                      </h3>

                      <div className="space-y-3">
                        {study.keyInsight.split("\n\n").map((para, i) => (
                          <p key={i} className="text-lg font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                            {renderRichText(para)}
                          </p>
                        ))}
                      </div>
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

                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug  whitespace-pre-line text-justify">
                        {study.designGoal}
                      </p>
                    </section>
                  )}

                  {/* Solution */}
                  {study.hypothesis && (() => {
                    const paras = study.hypothesis.split("\n\n");
                    const textParas = paras.filter(p => !p.match(/^\{\{quote:(.+)\}\}$/s));
                    const quoteParas = paras.filter(p => p.match(/^\{\{quote:(.+)\}\}$/s));
                    return (
                      <>
                        <section
                          aria-labelledby="hypothesis-heading"
                          className="rounded-xl bg-violet-50/50 dark:bg-violet-950/20 p-5 -mx-1"
                        >
                          <h3
                            id="hypothesis-heading"
                            className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                          >
                            Solution
                          </h3>
                          <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="flex-1 space-y-4">
                              {textParas.map((para, i) => (
                                <p key={i} className="text-base text-gray-800 dark:text-gray-200 leading-snug text-justify">
                                  {para}
                                </p>
                              ))}
                            </div>
                            {study.id === "fintech-dashboard" && (
                              <div className="flex-shrink-0 p-1 mt-1 sm:w-28">
                                <img
                                  src="/resources/Bft-App/Booking.png"
                                  alt="Booking screen"
                                  className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                  onClick={() => openLightbox("/resources/Bft-App/Booking.png", "Booking screen")}
                                />
                              </div>
                            )}
                          </div>
                        </section>
                        {quoteParas.map((para, i) => {
                          const quoteMatch = para.match(/^\{\{quote:(.+)\}\}$/s);
                          if (!quoteMatch) return null;
                          const quoteLines = quoteMatch[1].split("\\n");
                          return (
                            <blockquote key={`q${i}`} className="relative text-center my-6 py-5 px-6">
                              <span className="absolute -top-2 left-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                              <div className="space-y-3">
                                {quoteLines.map((line, li) => (
                                  <p key={li} className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                    {line}
                                  </p>
                                ))}
                              </div>
                              <span className="absolute -bottom-2 right-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                            </blockquote>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Process */}
                  <section aria-labelledby="process-heading">
                    <h3
                      id="process-heading"
                      className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-6"
                    >
                      {study.processLabel ?? "Process"}
                    </h3>

                    {study.processIntro && (
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug mb-8 text-justify">
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
                              {step.phase === "flow" && study.id === "health-app" ? "System Workflow" : PHASE_LABELS[step.phase]}
                            </h4>

                            {step.phase === "solution" && step.assets.length > 0 ? (
                              <div className="flex flex-col sm:flex-row gap-5 items-start">
                                <div className="flex-1 space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-snug">
                                  {step.description
                                    .split("\n\n")
                                    .map((para, pi) => {
                                      const quoteMatch = para.match(/^\{\{quote:(.+)\}\}$/s);
                                      if (quoteMatch) {
                                        const quoteLines = quoteMatch[1].split("\\n");
                                        return (
                                          <blockquote key={pi} className="relative text-center my-6 py-4 px-6">
                                            <span className="absolute -top-2 left-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                                            <div className="space-y-3">
                                              {quoteLines.map((line, li) => (
                                                <p key={li} className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                                  {line}
                                                </p>
                                              ))}
                                            </div>
                                            <span className="absolute -bottom-2 right-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                                          </blockquote>
                                        );
                                      }
                                      return <p key={pi} className="text-justify">{renderRichText(para)}</p>;
                                    })}
                                </div>
                                <div className="flex-shrink-0 p-1 mt-1 sm:w-24">
                                  <img
                                    src={step.assets[0]}
                                    alt="Solution preview"
                                    className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                    onClick={() => openLightbox(step.assets[0], "Solution preview")}
                                  />
                                </div>
                              </div>
                            ) : step.phase === "learnings" ? (
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
                              <>
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400 leading-snug">
                                  {step.description
                                    .split("\n\n")
                                    .filter(p => p.trim() && !p.match(/^\{\{quote:(.+)\}\}$/s))
                                    .map((line, li) => (
                                      <p key={li}>{renderRichText(line)}</p>
                                    ))}
                                </div>
                                {/* Flow assets */}
                                {step.assets.length > 0 && (
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    {step.assets.map((asset, i) => {
                                      const group = step.assets.map((a, j) => ({
                                        src: a,
                                        alt: `${step.phase === "flow" && study.id === "health-app" ? "System Workflow" : PHASE_LABELS[step.phase]} asset ${j + 1}`,
                                      }));
                                      return (
                                        <img
                                          key={i}
                                          src={asset}
                                          data-src={asset}
                                          alt={`System Workflow asset ${i + 1}`}
                                          className="h-20 w-32 object-cover rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 hover:border-indigo-400 transition-all"
                                          loading="lazy"
                                          onClick={() => openLightbox(asset, `System Workflow asset ${i + 1}`, group, i)}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                                {/* Quote after assets */}
                                {step.description.split("\n\n").filter(p => p.match(/^\{\{quote:(.+)\}\}$/s)).map((para, qi) => {
                                  const quoteMatch = para.match(/^\{\{quote:(.+)\}\}$/s);
                                  if (!quoteMatch) return null;
                                  return (
                                    <blockquote key={`fq${qi}`} className="relative text-center mt-8 mb-4 py-5 px-6">
                                      <span className="absolute -top-2 left-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                        {quoteMatch[1]}
                                      </p>
                                      <span className="absolute -bottom-2 right-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                                    </blockquote>
                                  );
                                })}
                              </>
                            ) : (
                              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-snug">
                                {step.description
                                  .split("\n\n")
                                  .map((para, pi) => {
                                    const quoteMatch = para.match(/^\{\{quote:(.+)\}\}$/s);
                                    if (quoteMatch) {
                                      const quoteLines = quoteMatch[1].split("\\n");
                                      return (
                                        <blockquote key={pi} className="relative text-center my-6 py-4 px-6">
                                          <span className="absolute -top-2 left-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&ldquo;</span>
                                          <div className="space-y-3">
                                            {quoteLines.map((line, li) => (
                                              <p key={li} className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                                {line}
                                              </p>
                                            ))}
                                          </div>
                                          <span className="absolute -bottom-2 right-2 text-3xl text-indigo-200 dark:text-indigo-800 font-serif leading-none" aria-hidden="true">&rdquo;</span>
                                        </blockquote>
                                      );
                                    }
                                    return <p key={pi} className="text-justify">{renderRichText(para)}</p>;
                                  })}
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
                            {step.phase !== "solution" && step.phase !== "flow" && step.assets.length > 0 && (
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
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug whitespace-pre-line text-justify">
                        {study.tradeoffs}
                      </p>
                      {study.id === "health-app" && (<>
                        <table className="w-full mt-5 text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 pr-4 font-bold text-gray-900 dark:text-white">Option</th>
                              <th className="text-left py-2 pr-4 font-bold text-gray-900 dark:text-white">Benefit</th>
                              <th className="text-left py-2 font-bold text-gray-900 dark:text-white">Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Free shift swaps</td>
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">High flexibility</td>
                              <td className="py-2 text-gray-700 dark:text-gray-300">Understaffing</td>
                            </tr>
                            <tr>
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Manager approval</td>
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">Reliability</td>
                              <td className="py-2 text-gray-700 dark:text-gray-300">Slight friction</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="mt-6 text-base text-gray-700 dark:text-gray-300 leading-snug text-justify">
                          Allowing unrestricted shift swaps would maximise employee flexibility but could result in understaffed shifts and service disruption. I chose a manager-approved workflow with automated validation to balance flexibility with operational reliability.
                        </p>
                      </>)}
                    </section>
                  )}

                  {/* Coverage Check Success + Failure (Shift project only) */}
                  {study.id === "health-app" && (() => {
                    const coverageImages = [
                      { src: "/resources/Shift-App/CoverageCheck-Success.png", alt: "Coverage Check Success" },
                      { src: "/resources/Shift-App/CoveragCheck-Failure.png", alt: "Coverage Check Failure" },
                    ];
                    return (
                      <section className="rounded-xl bg-blue-50/40 dark:bg-blue-950/10 p-5 -mx-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">
                          Coverage Check Success + Failure
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-5 items-center">
                          <div className="flex gap-3 flex-shrink-0">
                            {coverageImages.map((img, idx) => (
                              <div key={idx} className="w-16">
                                <img
                                  src={img.src}
                                  alt={img.alt}
                                  className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                                  onClick={() => openLightbox(img.src, img.alt, coverageImages, idx)}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="flex-1 text-base text-gray-700 dark:text-gray-300 leading-snug text-justify">
                            Shift swaps are automatically evaluated against minimum staffing requirements before approval.
                          </p>
                        </div>
                      </section>
                    );
                  })()}

                  {/* Key Decisions */}
                  {study.metrics.length > 0 && (
                    <section aria-labelledby="metrics-heading">
                      <h3
                        id="metrics-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Key Decisions
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <ul className="space-y-2 flex-1">
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
                        {study.id === "health-app" && (
                          <div className="flex-shrink-0 p-1 sm:w-24 self-center">
                            <img
                              src="/resources/Shift-App/SwapWithCoworker.png"
                              alt="Swap with coworker screen"
                              className="w-full rounded-xl object-cover shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                              onClick={() => openLightbox("/resources/Shift-App/SwapWithCoworker.png", "Swap with coworker screen")}
                            />
                          </div>
                        )}
                      </div>
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

                  {/* Expected Impact (Shift project) */}
                  {study.expectedImpact && (
                    <section className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-5 -mx-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">
                        Expected Impact
                      </h3>
                      <ul className="space-y-2">
                        {study.expectedImpact.split("|").filter(Boolean).map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="text-indigo-400 flex-shrink-0 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Impact */}
                  {study.impact && (
                    <section aria-labelledby="impact-heading">
                      <h3
                        id="impact-heading"
                        className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3"
                      >
                        Impact
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug text-justify">
                        {study.impact}
                      </p>
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
                          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </>)}
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
                className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
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
                  className={`max-w-full rounded-xl object-contain ${lightboxSmall ? "max-h-[40vh]" : "max-h-[85vh]"}`}
                />
                {lightboxGroup.length > 1 && (
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={lightboxPrev}
                      className="w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/30 dark:hover:bg-gray-600/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Previous image"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M11 14L6 9l5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="text-xs text-white/50 tabular-nums">
                      {lightboxIndex + 1} / {lightboxGroup.length}
                    </span>
                    <button
                      onClick={lightboxNext}
                      className="w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/30 dark:hover:bg-gray-600/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Next image"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 4l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
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

