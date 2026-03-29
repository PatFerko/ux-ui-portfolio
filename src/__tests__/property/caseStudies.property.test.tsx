import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseStudiesSection } from '../../sections/CaseStudiesSection';
import { CaseStudyCard } from '../../components/CaseStudyCard';
import { CaseStudyModal } from '../../components/CaseStudyModal';
import type { CaseStudy, ProcessStep, CodeViewContent } from '../../components/CaseStudyCard';

// Mock dialog methods not implemented in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

// Arbitraries — use printable non-whitespace strings to avoid RTL text matching issues
const nonEmptyStr = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

const processStepArb = fc.record<ProcessStep>({
  phase: fc.constantFrom('research', 'wireframes', 'ui', 'implementation') as fc.Arbitrary<ProcessStep['phase']>,
  description: nonEmptyStr,
  assets: fc.array(fc.webUrl()),
});

const codeViewArb = fc.record<CodeViewContent>({
  repoUrl: fc.webUrl(),
  techStack: fc.array(nonEmptyStr, { minLength: 1 }),
  highlights: fc.array(nonEmptyStr, { minLength: 1 }),
});

const caseStudyArb = fc.record<CaseStudy>({
  id: fc.uuid(),
  title: nonEmptyStr,
  shortDescription: nonEmptyStr,
  tags: fc.array(nonEmptyStr, { minLength: 1 }),
  thumbnail: fc.webUrl(),
  thumbnailIsVideo: fc.boolean(),
  problemStatement: nonEmptyStr,
  processNarrative: fc.array(processStepArb, { minLength: 1 }),
  beforeAfterVisuals: fc.array(
    fc.record({ before: fc.webUrl(), after: fc.webUrl() }),
    { minLength: 1 }
  ),
  metrics: fc.array(nonEmptyStr, { minLength: 1 }),
  codeView: fc.option(codeViewArb, { nil: undefined }),
});

describe('Property 2: Case studies count is within bounds', () => {
  // Feature: ux-ui-portfolio, Property 2: Case studies count is within bounds
  // Validates: Requirements 2.1
  it('renders exactly as many cards as there are studies (3–6)', () => {
    fc.assert(
      fc.property(
        fc.array(caseStudyArb, { minLength: 3, maxLength: 6 }),
        (studies) => {
          // CaseStudiesSection reads from the JSON file, so we test CaseStudyCard rendering directly
          const { container, unmount } = render(
            <div>
              {studies.map((s) => (
                <CaseStudyCard key={s.id} study={s} onOpen={() => {}} />
              ))}
            </div>
          );
          const cards = container.querySelectorAll('button[aria-label^="Open"]');
          expect(cards.length).toBe(studies.length);
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 3: Case study modal renders all required fields', () => {
  // Feature: ux-ui-portfolio, Property 3: Case study modal renders all required fields
  // Validates: Requirements 2.4
  it('modal displays problem statement, process steps, before/after visuals, and metrics', () => {
    fc.assert(
      fc.property(caseStudyArb, (study) => {
        const { container, unmount } = render(
          <CaseStudyModal study={study} isOpen={true} onClose={() => {}} />
        );

        const text = container.textContent ?? '';

        // Problem statement text appears somewhere in the modal
        expect(text).toContain(study.problemStatement.trim());

        // At least one process step description
        expect(text).toContain(study.processNarrative[0].description.trim());

        // At least one metric
        expect(text).toContain(study.metrics[0].trim());

        // Before/after section heading
        expect(text).toMatch(/before.*after/i);

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property 4: Design/Code view toggle switches content', () => {
  // Feature: ux-ui-portfolio, Property 4: Design/Code view toggle switches content
  // Validates: Requirements 2.7
  it('toggling from design to code and back restores design content', () => {
    fc.assert(
      fc.property(
        caseStudyArb.filter((s) => s.codeView !== undefined),
        (study) => {
          const { getByRole, container, unmount } = render(
            <CaseStudyCard study={study} onOpen={() => {}} />
          );

          // Initially in design view — shortDescription visible
          expect(container.textContent).toContain(study.shortDescription.trim());

          // Switch to code view
          fireEvent.click(getByRole('button', { name: 'Code' }));
          // Code view shows tech stack
          expect(container.textContent).toContain(study.codeView!.techStack[0].trim());

          // Switch back to design view
          fireEvent.click(getByRole('button', { name: 'Design' }));
          // Design view restored
          expect(container.textContent).toContain(study.shortDescription.trim());

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
