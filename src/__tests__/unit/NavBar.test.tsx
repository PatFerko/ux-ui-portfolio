import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavBar } from '../../components/NavBar';
import { ThemeProvider } from '../../context/ThemeContext';

function renderNavBar() {
  return render(
    <ThemeProvider>
      <NavBar />
    </ThemeProvider>
  );
}

describe('NavBar', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    // Create section elements so scroll-spy observer has targets
    const ids = ['hero', 'work', 'gallery', 'skills', 'social', 'contact'];
    ids.forEach((id) => {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    });
    // Mock IntersectionObserver (not available in jsdom)
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
    // Clean up section elements
    const ids = ['hero', 'work', 'gallery', 'skills', 'social', 'contact'];
    ids.forEach((id) => {
      document.getElementById(id)?.remove();
    });
  });

  it('renders a <nav> element', () => {
    renderNavBar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders anchor links for all six section ids', () => {
    renderNavBar();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('#hero');
    expect(hrefs).toContain('#work');
    expect(hrefs).toContain('#gallery');
    expect(hrefs).toContain('#skills');
    expect(hrefs).toContain('#social');
    expect(hrefs).toContain('#contact');
  });

  it('all nav links are keyboard focusable (no tabIndex < 0)', () => {
    renderNavBar();
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const tabIndex = link.getAttribute('tabindex');
      // tabIndex should be null (default 0) or >= 0
      expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
    });
  });

  it('calls scrollIntoView with smooth behavior on link click', () => {
    renderNavBar();
    const scrollIntoViewMock = vi.fn();
    const workSection = document.getElementById('work')!;
    workSection.scrollIntoView = scrollIntoViewMock;

    // Find the "Work" link (desktop nav)
    const workLinks = screen.getAllByRole('link', { name: 'Work' });
    fireEvent.click(workLinks[0]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('renders a theme toggle button', () => {
    renderNavBar();
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('theme toggle button switches aria-label after click', () => {
    renderNavBar();
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('nav is fixed/sticky at the top (has fixed class)', () => {
    renderNavBar();
    const nav = screen.getByRole('navigation');
    expect(nav.className).toMatch(/fixed/);
  });
});
