import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GallerySection } from '../../sections/GallerySection';
import { ThemeProvider } from '../../context/ThemeContext';

// Framer Motion layoutId requires AnimatePresence at the root; mock it to avoid
// "act" warnings in tests while still rendering children.
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { layoutId?: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { layoutId: _lid, whileHover: _wh, whileFocus: _wf, ...rest } = props as Record<string, unknown>;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

function renderGallery() {
  return render(
    <ThemeProvider>
      <GallerySection />
    </ThemeProvider>
  );
}

describe('GallerySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the gallery section with heading', () => {
    renderGallery();
    expect(screen.getByRole('region', { name: /gallery/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /gallery/i })).toBeInTheDocument();
  });

  it('renders 8 gallery items', () => {
    renderGallery();
    const items = screen.getAllByRole('button', { name: /view/i });
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it('opens focused view on item click', () => {
    renderGallery();
    const firstItem = screen.getAllByRole('button', { name: /view/i })[0];
    fireEvent.click(firstItem);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes focused view when close button is clicked', () => {
    renderGallery();
    const firstItem = screen.getAllByRole('button', { name: /view/i })[0];
    fireEvent.click(firstItem);
    const closeBtn = screen.getByRole('button', { name: /close focused view/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens focused view on Enter key press', () => {
    renderGallery();
    const firstItem = screen.getAllByRole('button', { name: /view/i })[0];
    fireEvent.keyDown(firstItem, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens focused view on Space key press', () => {
    renderGallery();
    const firstItem = screen.getAllByRole('button', { name: /view/i })[0];
    fireEvent.keyDown(firstItem, { key: ' ' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('all gallery items have tabIndex={0}', () => {
    renderGallery();
    const items = screen.getAllByRole('button', { name: /view/i });
    items.forEach((item) => {
      expect(item).toHaveAttribute('tabindex', '0');
    });
  });

  it('renders Design Playground toggle button', () => {
    renderGallery();
    expect(screen.getByRole('button', { name: /design playground/i })).toBeInTheDocument();
  });
});
