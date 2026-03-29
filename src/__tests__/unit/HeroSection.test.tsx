import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../../sections/HeroSection';
import heroContent from '../../data/heroContent.json';

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get(target, prop) {
        const el = (target as Record<string, unknown>)[prop as string];
        if (typeof el === 'object' && el !== null) return el;
        return el;
      },
    }),
    useReducedMotion: () => false,
  };
});

describe('HeroSection', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders the designer name from heroContent', () => {
    render(<HeroSection />);
    expect(screen.getByText(heroContent.name)).toBeInTheDocument();
  });

  it('renders the role title from heroContent', () => {
    render(<HeroSection />);
    expect(screen.getByText(heroContent.roleTitle)).toBeInTheDocument();
  });

  it('renders the tagline from heroContent', () => {
    render(<HeroSection />);
    expect(screen.getByText(heroContent.tagline)).toBeInTheDocument();
  });

  it('renders "View Work" CTA button', () => {
    render(<HeroSection />);
    expect(screen.getByRole('button', { name: heroContent.ctaWork })).toBeInTheDocument();
  });

  it('renders "Contact Me" CTA button', () => {
    render(<HeroSection />);
    expect(screen.getByRole('button', { name: heroContent.ctaContact })).toBeInTheDocument();
  });

  it('clicking "View Work" scrolls to #work section', () => {
    const workSection = document.createElement('section');
    workSection.id = 'work';
    document.body.appendChild(workSection);

    render(<HeroSection />);
    const btn = screen.getByRole('button', { name: heroContent.ctaWork });
    fireEvent.click(btn);

    expect(workSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    document.body.removeChild(workSection);
  });

  it('clicking "Contact Me" scrolls to #contact section', () => {
    const contactSection = document.createElement('section');
    contactSection.id = 'contact';
    document.body.appendChild(contactSection);

    render(<HeroSection />);
    const btn = screen.getByRole('button', { name: heroContent.ctaContact });
    fireEvent.click(btn);

    expect(contactSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    document.body.removeChild(contactSection);
  });

  it('has section id="hero"', () => {
    render(<HeroSection />);
    expect(document.getElementById('hero')).toBeInTheDocument();
  });
});
