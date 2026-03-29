import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SocialSection } from '../../sections/SocialSection';
import { ThemeProvider } from '../../context/ThemeContext';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { whileHover: _wh, whileTap: _wt, transition: _t, initial: _i, animate: _a, exit: _e, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

const mockUser = { public_repos: 42, html_url: 'https://github.com/PatFerko' };
const mockRepos = [
  { name: 'portfolio', description: 'My portfolio site', html_url: 'https://github.com/PatFerko/portfolio', stargazers_count: 10, language: 'TypeScript' },
  { name: 'design-system', description: null, html_url: 'https://github.com/PatFerko/design-system', stargazers_count: 5, language: 'CSS' },
];

function renderSocial() {
  return render(
    <ThemeProvider>
      <SocialSection />
    </ThemeProvider>
  );
}

describe('SocialSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the section heading', () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    renderSocial();
    expect(screen.getByRole('region', { name: /find me online/i })).toBeInTheDocument();
  });

  it('renders all social links from socialLinks.json', () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    renderSocial();
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dribbble/i })).toBeInTheDocument();
  });

  it('all social links have target="_blank" and rel="noopener noreferrer"', () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    renderSocial();
    const socialLinks = [
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s GitHub profile/i }),
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s LinkedIn profile/i }),
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s Dribbble portfolio/i }),
    ];
    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('all social links have non-empty aria-label', () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    renderSocial();
    const socialLinks = [
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s GitHub profile/i }),
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s LinkedIn profile/i }),
      screen.getByRole('link', { name: /Visit Patr.*cia Ferkov.*s Dribbble portfolio/i }),
    ];
    socialLinks.forEach((link) => {
      const label = link.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label!.trim().length).toBeGreaterThan(0);
    });
  });

  it('renders GitHub stats and repos on successful fetch', async () => {
    let callCount = 0;
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? mockUser : mockRepos;
      return Promise.resolve({ ok: true, json: async () => data });
    });

    renderSocial();

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
    expect(screen.getByText('public repositories')).toBeInTheDocument();
    expect(screen.getByText('portfolio')).toBeInTheDocument();
    expect(screen.getByText('design-system')).toBeInTheDocument();
  });

  it('shows "No description available" for repos with null description', async () => {
    let callCount = 0;
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? mockUser : mockRepos;
      return Promise.resolve({ ok: true, json: async () => data });
    });

    renderSocial();

    await waitFor(() => {
      expect(screen.getByText('No description available')).toBeInTheDocument();
    });
  });

  it('renders static fallback when GitHub fetch fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderSocial();

    await waitFor(() => {
      expect(screen.getByText(/GitHub stats unavailable/i)).toBeInTheDocument();
    });
    // Both the social link row and the fallback button have the same aria-label
    const githubLinks = screen.getAllByRole('link', { name: /Visit Patr.*cia Ferkov.*s GitHub profile/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    // The fallback link (the button-style one) should point to the GitHub profile
    const fallbackLink = githubLinks.find((l) => l.textContent?.includes('View GitHub Profile'));
    expect(fallbackLink).toBeDefined();
    expect(fallbackLink).toHaveAttribute('href', 'https://github.com/PatFerko');
  });

  it('renders static fallback when GitHub API returns non-2xx', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 403 });

    renderSocial();

    await waitFor(() => {
      expect(screen.getByText(/GitHub stats unavailable/i)).toBeInTheDocument();
    });
  });

  it('repo links open in new tab with noopener noreferrer', async () => {
    let callCount = 0;
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? mockUser : mockRepos;
      return Promise.resolve({ ok: true, json: async () => data });
    });

    renderSocial();

    await waitFor(() => {
      expect(screen.getByText('portfolio')).toBeInTheDocument();
    });

    const repoLink = screen.getByRole('link', { name: /View portfolio repository/i });
    expect(repoLink).toHaveAttribute('target', '_blank');
    expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
