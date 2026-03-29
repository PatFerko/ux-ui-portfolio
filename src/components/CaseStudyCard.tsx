import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LazyImage } from './LazyImage';
import { LazyVideo } from './LazyVideo';

export interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  tags: string[];
  thumbnail: string;
  thumbnailIsVideo: boolean;
  problemStatement: string;
  processNarrative: ProcessStep[];
  beforeAfterVisuals: { before: string; after: string }[];
  metrics: string[];
  codeView?: CodeViewContent;
}

export interface ProcessStep {
  phase: 'goals' | 'solution' | 'flow' | 'wireframes_final' | 'wireframes' | 'system' | 'learnings';
  description: string;
  assets: string[];
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
  const [isCodeView, setIsCodeView] = useState(false);
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
      initial="rest"
      whileHover={prefersReducedMotion ? undefined : 'hover'}
      animate="rest"
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
            <span className="text-white font-semibold text-sm tracking-wide">View Case Study →</span>
          </motion.div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Design / Code toggle */}
        {study.codeView && (
          <div className="flex items-center gap-1 mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
            <button
              onClick={(e) => { e.stopPropagation(); setIsCodeView(false); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                !isCodeView
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-pressed={!isCodeView}
            >
              Design
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsCodeView(true); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isCodeView
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-pressed={isCodeView}
            >
              Code
            </button>
          </div>
        )}

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">
          {study.title}
        </h3>

        {isCodeView && study.codeView ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {study.codeView.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
            <ul className="space-y-1">
              {study.codeView.highlights.map((h, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5">
                  <span className="text-indigo-400 mt-0.5">▸</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {study.shortDescription}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Open modal button */}
        <button
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="mt-4 w-full py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={`Open ${study.title} case study`}
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
