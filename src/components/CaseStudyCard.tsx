import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LazyImage } from "./LazyImage";
import { LazyVideo } from "./LazyVideo";

export interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  tags: string[];
  thumbnail: string;
  thumbnailIsVideo: boolean;
  heroImage?: string;
  tagline?: string;
  backgroundNote?: string;
  overview?: string;
  observationFromExperience?: string;
  introduction?: string;
  problemStatement: string;
  keyInsight: string;
  designGoal?: string;
  hypothesis?: string;
  tradeoffs?: string;
  processIntro?: string;
  processLabel?: string;
  learnings?: string;
  expectedImpact?: string;
  impact?: string;
  uxui?: {
    context?: string;
    userPainPoints?: string;
    uxGoal?: string;
    uxDecisions?: string;
    designTradeoffs?: string;
    userFlow?: string;
    accessibilityClarity?: string;
    showcaseImage?: string;
    learnings?: string;
    finalImpact?: string;
  };
  processNarrative: ProcessStep[];
  beforeAfterVisuals: { before: string; after: string }[];
  metrics: string[];
  codeView?: CodeViewContent;
}

export interface ProcessStep {
  phase:
    | "goals"
    | "solution"
    | "flow"
    | "wireframes_final"
    | "wireframes"
    | "system"
    | "learnings";
  description: string;
  assets: string[];
  keyDecisions?: string[];
}

export interface CodeViewContent {
  repoUrl: string;
  techStack: string[];
  highlights: string[];
}

interface CaseStudyCardProps {
  study: CaseStudy;
  onOpen: (study: CaseStudy, triggerEl: HTMLElement) => void;
}

export function CaseStudyCard({ study, onOpen }: CaseStudyCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const hoverVariants = prefersReducedMotion
    ? {}
    : {
        whileHover: { scale: 1.02 },
        transition: { duration: 0.2 },
      };

  const overlayVariants = {
    rest: { opacity: 0 },
    hover: { opacity: 1 },
  };

  function handleOpen() {
    if (cardRef.current) {
      onOpen(study, cardRef.current);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative flex-shrink-0 w-full sm:w-72 md:w-80 min-h-[30rem] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 flex flex-col"
      initial="rest"
      whileHover={prefersReducedMotion ? undefined : "hover"}
      animate="rest"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${study.title} case study`}
      {...(prefersReducedMotion ? {} : hoverVariants)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {study.thumbnailIsVideo ? (
          <LazyVideo
            src={study.thumbnail}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            aria-label={`${study.title} preview video`}
          />
        ) : (
          <LazyImage
            src={study.thumbnail}
            alt={`${study.title} thumbnail`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Hover peek overlay */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-semibold text-sm tracking-wide">
              View Case Study →
            </span>
          </motion.div>
        )}
      </div>

      {/* Card body */}
      <div className="px-5 pt-5 pb-10 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 leading-snug">
          {study.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
          {study.shortDescription}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {study.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Open modal button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleOpen(); }}
          onKeyDown={(e) => { e.stopPropagation(); handleKeyDown(e); }}
          className="mt-auto w-full py-3 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center"
          aria-label={`Open ${study.title} case study`}
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
