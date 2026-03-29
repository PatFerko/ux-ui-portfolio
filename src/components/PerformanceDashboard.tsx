import { motion, useReducedMotion } from 'framer-motion';
import type { LighthouseScore, WebVital } from '../data/performanceData';
import {
  lighthouseScores as defaultLighthouseScores,
  webVitals as defaultWebVitals,
} from '../data/performanceData';

interface PerformanceDashboardProps {
  lighthouseScores?: LighthouseScore[];
  webVitals?: WebVital[];
}

/** Map a 0–100 score to a Tailwind-friendly color token. */
function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-500';
}

function scoreTrackColor(score: number): string {
  if (score >= 90) return 'stroke-green-500';
  if (score >= 50) return 'stroke-orange-400';
  return 'stroke-red-500';
}

/** Determine Web Vital status from value and thresholds. */
function vitalStatus(value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  good: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Good' },
  'needs-improvement': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Needs Improvement' },
  poor: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Poor' },
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularGauge({ score, label, reducedMotion }: { score: number; label: string; reducedMotion: boolean }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-700" />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={scoreTrackColor(score)}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: reducedMotion ? offset : CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor(score)}`} aria-label={`${label}: ${score} out of 100`}>
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{label}</span>
    </div>
  );
}

function WebVitalCard({ vital, reducedMotion }: { vital: WebVital; reducedMotion: boolean }) {
  const status = vitalStatus(vital.value, vital.thresholds);
  const style = STATUS_STYLES[status];
  const displayValue = vital.unit ? `${vital.value}${vital.unit}` : vital.value.toString();

  return (
    <motion.div
      className={`rounded-xl p-4 ${style.bg} flex flex-col gap-1`}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{vital.abbreviation}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>
      <span className={`text-2xl font-bold ${style.text}`}>{displayValue}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{vital.name}</span>
    </motion.div>
  );
}

export function PerformanceDashboard({
  lighthouseScores = defaultLighthouseScores,
  webVitals = defaultWebVitals,
}: PerformanceDashboardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      aria-labelledby="perf-dashboard-heading"
      data-testid="performance-dashboard"
    >
      <motion.h2
        id="perf-dashboard-heading"
        className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
      >
        Performance Dashboard
      </motion.h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10">
        Pre-captured Lighthouse scores and Core Web Vitals
      </p>

      {/* Lighthouse Scores */}
      <div className="mb-12">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-6 text-center">
          Lighthouse Scores
        </h3>
        <div className="flex flex-wrap justify-center gap-8" data-testid="lighthouse-scores">
          {lighthouseScores.map((item) => (
            <CircularGauge
              key={item.category}
              score={item.score}
              label={item.category}
              reducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Web Vitals */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-6 text-center">
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="web-vitals">
          {webVitals.map((vital) => (
            <WebVitalCard key={vital.abbreviation} vital={vital} reducedMotion={prefersReducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
