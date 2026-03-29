/**
 * Pre-captured performance metrics for the Performance Dashboard.
 * These are static values since this is a client-side SPA with no backend.
 * Update these after running Lighthouse / Web Vitals audits.
 */

export interface LighthouseScore {
  category: string;
  score: number; // 0–100
}

export interface WebVital {
  name: string;
  abbreviation: string;
  value: number;
  unit: string;
  /** Thresholds: [good, needsImprovement]. Values above needsImprovement are poor. */
  thresholds: [number, number];
}

export const lighthouseScores: LighthouseScore[] = [
  { category: 'Performance', score: 95 },
  { category: 'Accessibility', score: 98 },
  { category: 'Best Practices', score: 100 },
  { category: 'SEO', score: 92 },
];

export const webVitals: WebVital[] = [
  { name: 'Largest Contentful Paint', abbreviation: 'LCP', value: 1.2, unit: 's', thresholds: [2.5, 4.0] },
  { name: 'First Input Delay', abbreviation: 'FID', value: 8, unit: 'ms', thresholds: [100, 300] },
  { name: 'Cumulative Layout Shift', abbreviation: 'CLS', value: 0.02, unit: '', thresholds: [0.1, 0.25] },
];
