import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'skills', label: 'Skills' },
  { id: 'social', label: 'Social' },
  { id: 'contact', label: 'Contact' },
] as const;

type SectionId = (typeof NAV_LINKS)[number]['id'];

export function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionEls = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];

    if (sectionEls.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio that is intersecting
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;

        const topmost = intersecting.reduce((best, entry) =>
          entry.boundingClientRect.top < best.boundingClientRect.top ? entry : best
        );

        setActiveSection(topmost.target.id as SectionId);
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionEls.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, 'hero')}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            Portfolio
          </a>

          {/* Nav links */}
          <ul className="hidden sm:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => handleLinkClick(e, id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      isActive
                        ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile nav links */}
        <div className="sm:hidden pb-3">
          <ul className="flex flex-wrap gap-1" role="list">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => handleLinkClick(e, id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      isActive
                        ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
