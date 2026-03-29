import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import socialLinksData from '../data/socialLinks.json';
import { useTheme } from '../context/ThemeContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GitHubStats {
  repoCount: number;
  featuredRepos: FeaturedRepo[];
}

interface FeaturedRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

interface SocialLink {
  platform: 'GitHub' | 'LinkedIn' | 'Dribbble' | 'Behance';
  url: string;
  ariaLabel: string;
}

// ── GitHub API shapes ─────────────────────────────────────────────────────────

interface GitHubUser {
  public_repos: number;
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

// ── Icons (inline SVG since lucide-react doesn't include brand icons) ─────────

function GitHubIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function DribbbleIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.017-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.073c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.477 0-.945.04-1.4.112zm13.44 9.483c-.453-.962-1.08-1.83-1.85-2.56-.18.24-1.91 2.4-5.7 3.97.24.49.47.99.68 1.49.08.19.16.38.23.57 3.38-.43 6.72.26 7.64.53z" />
    </svg>
  );
}

function getPlatformIcon(platform: SocialLink['platform']) {
  switch (platform) {
    case 'GitHub':
      return <GitHubIcon size={24} />;
    case 'LinkedIn':
      return <LinkedInIcon size={24} />;
    case 'Dribbble':
      return <DribbbleIcon size={24} />;
    default:
      return <GitHubIcon size={24} />;
  }
}

// ── SocialLink component ──────────────────────────────────────────────────────

interface SocialLinkProps {
  link: SocialLink;
  isDark: boolean;
  animate: boolean;
}

function SocialLinkItem({ link, isDark, animate }: SocialLinkProps) {
  return (
    <motion.div
      whileHover={animate ? { scale: 1.15, y: -3 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.ariaLabel}
        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${isDark
            ? 'bg-gray-800 text-gray-300 hover:text-indigo-400 hover:bg-gray-700'
            : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
          } shadow-sm`}
      >
        {getPlatformIcon(link.platform)}
        <span className="text-xs font-medium">{link.platform}</span>
      </a>
    </motion.div>
  );
}

// ── GitHubStats component ─────────────────────────────────────────────────────

interface GitHubStatsProps {
  stats: GitHubStats;
  isDark: boolean;
}

function GitHubStatsDisplay({ stats, isDark }: GitHubStatsProps) {
  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        <GitHubIcon size={20} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          GitHub Activity
        </h3>
      </div>
      <div className="mb-4">
        <span className={`text-4xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
          {stats.repoCount}
        </span>
        <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          public repositories
        </span>
      </div>
    </div>
  );
}

// ── RepoPreviewCard component ─────────────────────────────────────────────────

interface RepoPreviewCardProps {
  repo: FeaturedRepo;
  isDark: boolean;
  animate: boolean;
}

function RepoPreviewCard({ repo, isDark, animate }: RepoPreviewCardProps) {
  return (
    <motion.div
      whileHover={animate ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${repo.name} repository on GitHub`}
        className={`block rounded-xl p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${isDark
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-white hover:bg-indigo-50'
          } shadow-sm`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`font-semibold text-sm truncate ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {repo.name}
          </span>
          {repo.stars > 0 && (
            <span className={`flex items-center gap-1 text-xs shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              ★ {repo.stars}
            </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {repo.description ?? 'No description available'}
        </p>
        {repo.language && (
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {repo.language}
          </span>
        )}
      </a>
    </motion.div>
  );
}

// ── Static fallback ───────────────────────────────────────────────────────────

interface StaticFallbackProps {
  githubLink: SocialLink | undefined;
  isDark: boolean;
}

function StaticFallback({ githubLink, isDark }: StaticFallbackProps) {
  if (!githubLink) return null;
  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm text-center`}>
      <GitHubIcon size={32} className={`mx-auto mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        GitHub stats unavailable right now.
      </p>
      <a
        href={githubLink.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={githubLink.ariaLabel}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
          ${isDark
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
      >
        <GitHubIcon size={16} />
        View GitHub Profile
      </a>
    </div>
  );
}

// ── SocialSection ─────────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'alexrivera';

export function SocialSection() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';
  const animate = !prefersReducedMotion;

  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  const socialLinks = socialLinksData as SocialLink[];
  const githubLink = socialLinks.find((l) => l.platform === 'GitHub');

  useEffect(() => {
    let cancelled = false;

    async function fetchGitHub() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=6`),
        ]);

        if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');

        const user: GitHubUser = await userRes.json();
        const repos: GitHubRepo[] = await reposRes.json();

        if (cancelled) return;

        setStats({
          repoCount: user.public_repos,
          featuredRepos: repos.map((r) => ({
            name: r.name,
            description: r.description,
            url: r.html_url,
            stars: r.stargazers_count,
            language: r.language,
          })),
        });
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGitHub();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      id="social"
      className={`py-20 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}
      aria-labelledby="social-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className={`text-sm font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
            Connect
          </p>
          <h2
            id="social-heading"
            className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Find Me Online
          </h2>
          <p className={`mt-3 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Open to new opportunities, collaborations, and conversations.
          </p>
        </div>

        {/* Social links row */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {socialLinks.map((link) => (
            <SocialLinkItem key={link.platform} link={link} isDark={isDark} animate={animate} />
          ))}
        </div>

        {/* GitHub stats + repos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-indigo-400' : 'border-indigo-600'}`} aria-label="Loading GitHub stats" />
          </div>
        ) : stats ? (
          <div className="space-y-8">
            <GitHubStatsDisplay stats={stats} isDark={isDark} />
            {stats.featuredRepos.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Featured Repositories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.featuredRepos.map((repo) => (
                    <RepoPreviewCard key={repo.name} repo={repo} isDark={isDark} animate={animate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <StaticFallback githubLink={githubLink} isDark={isDark} />
        )}
      </div>
    </section>
  );
}
