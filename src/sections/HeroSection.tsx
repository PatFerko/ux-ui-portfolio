import { motion, useReducedMotion } from 'framer-motion';
import heroContent from '../data/heroContent.json';
import { TypingAnimation } from '../components/TypingAnimation';
import { ParticleBackground } from '../components/ParticleBackground';
import { DraggableUIPreview } from '../components/DraggableUIPreview';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' as const },
  }),
};

const fadeUpReduced = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? fadeUpReduced : fadeUp;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-gray-950"
    >
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.p
              className="text-sm font-semibold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase mb-3"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Hello, I'm
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-3"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              {heroContent.name}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-4"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              {heroContent.roleTitle}
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 mb-6"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              {heroContent.tagline}
            </motion.p>

            {/* Typing animation row */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-2 mb-8 text-base sm:text-lg"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              <span className="text-gray-500 dark:text-gray-400">Focused on</span>
              <TypingAnimation skills={heroContent.typingSkills} />
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              variants={variants}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <button
                onClick={() => scrollToSection('work')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {heroContent.ctaWork}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-indigo-500 text-indigo-500 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {heroContent.ctaContact}
              </button>
            </motion.div>
          </div>

          {/* Draggable widget */}
          <motion.div
            className="flex-shrink-0"
            variants={variants}
            initial="hidden"
            animate="visible"
            custom={0.6}
          >
            <DraggableUIPreview />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 dark:text-gray-600"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </section>
  );
}
