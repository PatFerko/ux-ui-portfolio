import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavBar } from './components/NavBar';
import { HeroSection } from './sections/HeroSection';
import { CaseStudiesSection } from './sections/CaseStudiesSection';
import { ContactSection } from './sections/ContactSection';

// Below-fold sections — lazy-loaded for code splitting (Requirement 9.3)
const GallerySection = lazy(() =>
  import('./sections/GallerySection').then((m) => ({ default: m.GallerySection }))
);
const SkillsSection = lazy(() =>
  import('./sections/SkillsSection').then((m) => ({ default: m.SkillsSection }))
);
const SocialSection = lazy(() =>
  import('./sections/SocialSection').then((m) => ({ default: m.SocialSection }))
);

// Bonus: Performance Dashboard — lazy-loaded via dynamic import (Requirements 13.1, 13.2)
const PerformanceDashboard = lazy(() =>
  import('./components/PerformanceDashboard').then((m) => ({ default: m.PerformanceDashboard }))
);

/** Feature flag — set to true to display the Performance Dashboard */
const performanceDashboard = true;

function SectionFallback() {
  return (
    <div className="py-20 flex items-center justify-center text-gray-400 dark:text-gray-600">
      <span className="animate-pulse">Loading…</span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <header>
        <NavBar />
      </header>
      <main>
        <HeroSection />
        <CaseStudiesSection />
        <Suspense fallback={<SectionFallback />}>
          <GallerySection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SkillsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SocialSection />
        </Suspense>
        <ContactSection />
        {/* {performanceDashboard && (
          <Suspense fallback={<SectionFallback />}>
            <PerformanceDashboard />
          </Suspense>
        )} */}
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        © {new Date().getFullYear()} Alex Rivera. All rights reserved.
      </footer>
    </ThemeProvider>
  );
}

export default App;
