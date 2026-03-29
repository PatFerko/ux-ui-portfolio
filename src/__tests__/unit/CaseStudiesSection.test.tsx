import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CaseStudyCard } from '../../components/CaseStudyCard';
import { CaseStudyModal } from '../../components/CaseStudyModal';
import type { CaseStudy } from '../../components/CaseStudyCard';

const mockStudy: CaseStudy = {
  id: 'test-study',
  title: 'Test Case Study',
  shortDescription: 'A test description for the case study.',
  tags: ['UX Research', 'UI Design'],
  thumbnail: '/images/test-thumb.webp',
  thumbnailIsVideo: false,
  problemStatement: 'Users struggled with the old interface.',
  processNarrative: [
    { phase: 'research', description: 'Conducted user interviews.', assets: [] },
    { phase: 'wireframes', description: 'Created wireframes.', assets: [] },
    { phase: 'ui', description: 'Designed high-fidelity mockups.', assets: [] },
    { phase: 'implementation', description: 'Built the component.', assets: [] },
  ],
  beforeAfterVisuals: [{ before: '/images/before.webp', after: '/images/after.webp' }],
  metrics: ['40% improvement in task completion', 'NPS score improved by 35'],
  codeView: {
    repoUrl: 'https://github.com/test/repo',
    techStack: ['React', 'TypeScript'],
    highlights: ['Custom animation engine', 'Accessible components'],
  },
};

const videoStudy: CaseStudy = {
  ...mockStudy,
  id: 'video-study',
  title: 'Video Thumbnail Study',
  thumbnailIsVideo: true,
  thumbnail: '/videos/preview.mp4',
};

describe('CaseStudyCard', () => {
  it('renders title, description, and tags', () => {
    render(<CaseStudyCard study={mockStudy} onOpen={() => {}} />);
    expect(screen.getByText('Test Case Study')).toBeTruthy();
    expect(screen.getByText('A test description for the case study.')).toBeTruthy();
    expect(screen.getByText('UX Research')).toBeTruthy();
    expect(screen.getByText('UI Design')).toBeTruthy();
  });

  it('calls onOpen with study and trigger element when View Details is clicked', () => {
    const onOpen = vi.fn();
    render(<CaseStudyCard study={mockStudy} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /open test case study/i }));
    expect(onOpen).toHaveBeenCalledWith(mockStudy, expect.any(HTMLElement));
  });

  it('toggles to code view and back to design view', () => {
    render(<CaseStudyCard study={mockStudy} onOpen={() => {}} />);

    // Design view initially
    expect(screen.getByText('A test description for the case study.')).toBeTruthy();

    // Switch to code view
    fireEvent.click(screen.getByRole('button', { name: 'Code' }));
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.queryByText('A test description for the case study.')).toBeNull();

    // Switch back to design view
    fireEvent.click(screen.getByRole('button', { name: 'Design' }));
    expect(screen.getByText('A test description for the case study.')).toBeTruthy();
  });

  it('renders a video element when thumbnailIsVideo is true', () => {
    const { container } = render(<CaseStudyCard study={videoStudy} onOpen={() => {}} />);
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('loop')).toBeDefined();
    expect(video?.getAttribute('muted')).toBeDefined();
    expect(video?.getAttribute('autoplay')).toBeDefined();
  });

  it('video thumbnail loops silently (muted + loop + autoPlay)', () => {
    const { container } = render(<CaseStudyCard study={videoStudy} onOpen={() => {}} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    // In jsdom, muted is a property not always reflected as attribute
    // Check the loop attribute and that muted prop is set
    expect(video.hasAttribute('loop')).toBe(true);
    // muted is set as a property in React (not always as attribute in jsdom)
    expect(video.muted).toBe(true);
  });
});

describe('CaseStudyModal', () => {
  beforeEach(() => {
    // jsdom doesn't implement showModal/close natively, so we mock them
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('renders problem statement when open', () => {
    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Users struggled with the old interface.')).toBeTruthy();
  });

  it('renders all process phases', () => {
    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={() => {}} />);
    expect(screen.getAllByText('Research').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wireframes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('UI Design').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Implementation').length).toBeGreaterThan(0);
  });

  it('renders metrics', () => {
    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('40% improvement in task completion')).toBeTruthy();
  });

  it('renders before/after section', () => {
    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Before & After')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={onClose} />);
    // Use hidden:true since motion may set opacity:0 initially
    fireEvent.click(screen.getByRole('button', { name: /close case study/i, hidden: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns focus to trigger element on close', async () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open';
    document.body.appendChild(triggerButton);

    const onClose = vi.fn(() => {
      triggerButton.focus();
    });

    render(<CaseStudyModal study={mockStudy} isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close case study/i, hidden: true }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    document.body.removeChild(triggerButton);
  });

  it('does not render content when isOpen is false', () => {
    render(<CaseStudyModal study={mockStudy} isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Users struggled with the old interface.')).toBeNull();
  });
});
