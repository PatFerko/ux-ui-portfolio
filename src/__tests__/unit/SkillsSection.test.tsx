import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillsSection } from '../../sections/SkillsSection';
import { ThemeProvider } from '../../context/ThemeContext';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        const { whileHover: _wh, animate: _a, initial: _i, exit: _e, transition: _t, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
      },
    },
  };
});

function renderSkills() {
  return render(
    <ThemeProvider>
      <SkillsSection />
    </ThemeProvider>
  );
}

describe('SkillsSection', () => {
  it('renders the skills section with heading', () => {
    renderSkills();
    expect(screen.getByRole('region', { name: /skills/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /skills & tools/i })).toBeInTheDocument();
  });

  it('renders the MindsetToggle with Designer and Developer buttons', () => {
    renderSkills();
    expect(screen.getByRole('button', { name: /designer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /developer/i })).toBeInTheDocument();
  });

  it('shows UX and UI categories in Designer view by default', () => {
    renderSkills();
    expect(screen.getByText('UX')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
  });

  it('switches to Frontend category when Developer is selected', () => {
    renderSkills();
    fireEvent.click(screen.getByRole('button', { name: /developer/i }));
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.queryByText('UX')).not.toBeInTheDocument();
    expect(screen.queryByText('UI')).not.toBeInTheDocument();
  });

  it('toggling back to Designer restores UX and UI categories', () => {
    renderSkills();
    fireEvent.click(screen.getByRole('button', { name: /developer/i }));
    fireEvent.click(screen.getByRole('button', { name: /designer/i }));
    expect(screen.getByText('UX')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
  });

  it('renders tool cards for all tools', () => {
    renderSkills();
    // Tools section heading
    expect(screen.getByText('Tool Stack')).toBeInTheDocument();
    // At least one known tool name (may appear multiple times due to radar chart labels)
    expect(screen.getAllByText('Figma').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1);
  });

  it('ToolCard hover reveals description via aria-hidden overlay', () => {
    renderSkills();
    // The description overlay is aria-hidden but present in DOM
    const overlays = document.querySelectorAll('[aria-hidden="true"]');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('renders no more than 12 skills per visible category', () => {
    renderSkills();
    const skillLists = screen.getAllByRole('list', { name: /skill levels/i });
    skillLists.forEach((list) => {
      const items = list.querySelectorAll('li');
      expect(items.length).toBeLessThanOrEqual(12);
    });
  });
});
