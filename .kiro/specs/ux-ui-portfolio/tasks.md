# Implementation Plan: UX/UI Portfolio SPA

## Overview

Incremental build of a React + Vite + Tailwind + Framer Motion SPA. Each task produces working, integrated code. Property-based tests (fast-check) and unit tests (Vitest + RTL) are sub-tasks placed close to the code they validate.

## Tasks

- [x] 1. Project scaffolding and global configuration
  - Scaffold Vite + React 18 + TypeScript project
  - Install and configure Tailwind CSS v3 with dark mode class strategy
  - Install Framer Motion, Lucide React, React Hook Form, fast-check, Vitest, React Testing Library
  - Configure `vitest.config.ts` with jsdom environment and `src/test-setup.ts`
  - Create `src/data/` directory with placeholder JSON files: `heroContent.json`, `caseStudies.json`, `skills.json`, `tools.json`, `socialLinks.json`
  - Add SEO meta tags (title, description, Open Graph) to `index.html`
  - _Requirements: 9.3, 11.1, 11.2, 11.3_

  - [x]* 1.1 Write unit tests for meta tags
    - Verify `<title>`, `<meta name="description">`, and `og:*` tags are present in document head
    - _Requirements: 11.1, 11.2_

- [x] 2. ThemeProvider and theme persistence
  - Implement `ThemeContext` with `theme` and `toggleTheme`
  - Persist theme to `localStorage['portfolio-theme']` and restore on mount
  - Apply `dark` class to `<html>` element on theme change
  - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 2.1 Write property test for theme localStorage round-trip
    - **Property 16: Theme preference round-trips through localStorage**
    - **Validates: Requirements 8.3**

  - [ ]* 2.2 Write unit tests for ThemeController
    - Test toggle switches between dark and light
    - Test persisted value is restored on re-mount
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. NavBar with scroll-spy and smooth scroll
  - Render `<nav>` with anchor links for all six section ids (`#hero`, `#work`, `#gallery`, `#skills`, `#social`, `#contact`)
  - Implement `IntersectionObserver` scroll-spy to highlight the active section link
  - Implement smooth scroll via `scrollIntoView({ behavior: 'smooth' })` on link click
  - Include theme toggle button in NavBar
  - Ensure all nav links are keyboard focusable in document order
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.1 Write property test for active nav item
    - **Property 14: Active nav item reflects current viewport section**
    - **Validates: Requirements 7.2**

  - [ ]* 3.2 Write unit tests for NavBar
    - Test active link highlight updates on section change
    - Test smooth scroll is triggered on link click
    - _Requirements: 7.2, 7.3_

- [x] 4. HeroSection
  - Implement `HeroSection` consuming `heroContent.json` (name, roleTitle, tagline, typingSkills, CTA labels)
  - Implement `TypingAnimation` component cycling through `typingSkills` array using Framer Motion
  - Implement `ParticleBackground` (canvas cursor-reactive particles or CSS gradient mesh); disable/reduce when `prefers-reduced-motion` is active
  - Implement `DraggableUIPreview` widget using Framer Motion `drag` prop
  - Wire "View Work" CTA to scroll to `#work`; wire "Contact Me" CTA to scroll to `#contact`
  - Apply single-column responsive layout for mobile viewports
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 10.5_

  - [x]* 4.1 Write property test for typing animation skill cycling
    - **Property 1: Typing animation cycles all skills**
    - **Validates: Requirements 1.2**

  - [x]* 4.2 Write property test for animations respecting reduced-motion
    - **Property 19: Animations respect prefers-reduced-motion**
    - **Validates: Requirements 10.5**

  - [x]* 4.3 Write unit tests for HeroSection
    - Test name, role, tagline render from content data
    - Test "View Work" click calls scrollIntoView on case studies section
    - Test "Contact Me" click calls scrollIntoView on contact section
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. CaseStudiesSection and CaseStudyModal
  - Implement `CaseStudiesSection` rendering 3–6 `CaseStudyCard` components from `caseStudies.json`
  - Implement horizontal scroll container with scroll-snap
  - Implement `CaseStudyCard` with thumbnail (lazy-loaded), title, tags, and Framer Motion `whileHover` peek preview
  - Implement silent looping video thumbnail when `thumbnailIsVideo` is true
  - Implement Design/Code view toggle per card (controlled boolean state)
  - Lazy-load `CaseStudyModal` via dynamic `import()` on first open
  - Implement `CaseStudyModal` as a native `<dialog>` element displaying problem statement, process steps, before/after visuals, and metrics
  - Implement focus trap inside modal; return focus to trigger element on close
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 6.1 Write property test for case studies count bounds
    - **Property 2: Case studies count is within bounds**
    - **Validates: Requirements 2.1**

  - [ ]* 6.2 Write property test for modal required fields
    - **Property 3: Case study modal renders all required fields**
    - **Validates: Requirements 2.4**

  - [ ]* 6.3 Write property test for Design/Code toggle round-trip
    - **Property 4: Design/Code view toggle switches content**
    - **Validates: Requirements 2.7**

  - [ ]* 6.4 Write unit tests for CaseStudiesSection
    - Test modal opens without page reload
    - Test focus returns to trigger element on modal close
    - Test video thumbnail loops silently
    - _Requirements: 2.3, 2.5, 2.9_

- [x] 7. useLazyLoad hook and image/video lazy loading
  - Implement `useLazyLoad(ref)` custom hook using `IntersectionObserver` to swap `data-src` → `src`
  - Disconnect observer in `useEffect` cleanup to prevent memory leaks
  - Apply `useLazyLoad` to all `<img>` and `<video>` elements in `CaseStudiesSection` and `GallerySection`
  - Add `onError` handler to `<img>` elements to swap in a placeholder on load failure
  - _Requirements: 2.8, 3.8, 9.2_

  - [ ]* 7.1 Write property test for lazy loading deferred src
    - **Property 5: Lazy loading defers off-screen media**
    - **Validates: Requirements 2.8, 3.8, 9.2**

- [x] 8. GallerySection
  - Implement `GallerySection` with masonry grid layout (CSS columns or `react-masonry-css`)
  - Implement `GalleryItem` with Framer Motion `whileHover` animation targeting 60fps
  - Implement focused/enlarged view on click using Framer Motion `layoutId` shared layout animation
  - Implement `DesignPlayground` mode with interactive manipulable UI components; lazy-load via dynamic `import()`
  - Add `tabIndex`, `onKeyDown` (Enter/Space) handlers to all gallery items for keyboard navigation
  - Update gallery previews when `theme` context changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 8.1 Write property test for gallery keyboard navigation
    - **Property 7: Gallery items are keyboard navigable**
    - **Validates: Requirements 3.7, 10.3**

  - [ ]* 8.2 Write property test for theme propagation
    - **Property 6: Theme propagates to all theme-aware components**
    - **Validates: Requirements 3.5, 3.6, 8.2**

  - [ ]* 8.3 Write unit tests for GallerySection
    - Test focused view opens on click
    - Test keyboard Enter/Space triggers same action as click
    - _Requirements: 3.3, 3.7_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. SkillsSection
  - Implement `SkillsSection` consuming `skills.json` and `tools.json`
  - Implement radar chart via lightweight SVG or `recharts` with animated progress bars as fallback
  - Implement `MindsetToggle` switching between Designer and Developer views (controlled state)
  - Implement `ToolCard` with hover-reveal description via Framer Motion
  - Cap rendered skills at 12 per category regardless of source data length
  - Apply responsive single-column layout for mobile viewports
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 10.1 Write property test for skills per category cap
    - **Property 9: Skills per category never exceeds 12**
    - **Validates: Requirements 4.6**

  - [ ]* 10.2 Write property test for mindset toggle round-trip
    - **Property 8: Mindset toggle switches displayed content**
    - **Validates: Requirements 4.4**

  - [ ]* 10.3 Write unit tests for SkillsSection
    - Test three skill categories render
    - Test ToolCard hover reveals description
    - _Requirements: 4.1, 4.3_

- [x] 11. SocialSection with GitHub API integration
  - Implement `SocialSection` consuming `socialLinks.json`
  - Fetch GitHub stats via `https://api.github.com/users/{username}` and `/repos?sort=stars&per_page=6`
  - Render `GitHubStats` (repo count, contribution activity) and `RepoPreviewCard` (name, description with null fallback)
  - Render `SocialLink` components with `target="_blank" rel="noopener noreferrer"` and non-empty `aria-label`
  - Render animated icons with Framer Motion hover feedback
  - On fetch failure: set stats to `null` and render static fallback (profile link only)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 11.1 Write property test for social links new tab and aria-label
    - **Property 10: Social links open in new tab with accessible labels**
    - **Validates: Requirements 5.2, 5.6**

  - [ ]* 11.2 Write property test for repo cards name and description
    - **Property 11: Featured repo cards contain name and description**
    - **Validates: Requirements 5.4**

  - [ ]* 11.3 Write unit tests for SocialSection
    - Test GitHub fetch failure renders static fallback link
    - Test all social links open in new tab
    - _Requirements: 5.2, 5.7_

- [x] 12. ContactSection with form validation and spam protection
  - Implement `ContactSection` with conversational microcopy
  - Implement `ContactForm` using React Hook Form with fields: name, email, message
  - Add honeypot hidden `<input>` (`tabIndex={-1}`, `aria-hidden="true"`); reject submission if populated
  - Implement validation: name non-empty, email matches RFC 5322 pattern, message non-empty
  - Display inline errors adjacent to invalid fields without clearing other field values
  - Submit to Formspree/Netlify Forms; on success render Framer Motion success animation
  - On submission error set `status: 'error'` and display error message below submit button
  - Ensure all inputs have associated `<label>` or `aria-label`
  - Display direct email link as alternative contact method
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 10.4_

  - [ ]* 12.1 Write property test for form validation rejecting invalid inputs
    - **Property 12: Contact form validation rejects invalid inputs**
    - **Validates: Requirements 6.3**

  - [ ]* 12.2 Write property test for validation preserving other field values
    - **Property 13: Validation errors preserve other field values**
    - **Validates: Requirements 6.4**

  - [ ]* 12.3 Write property test for form inputs having labels
    - **Property 18: Form inputs have associated labels**
    - **Validates: Requirements 10.4**

  - [ ]* 12.4 Write unit tests for ContactSection
    - Test honeypot-populated submission does not call form service
    - Test success animation renders after valid submission
    - Test inline errors appear without clearing other fields
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Accessibility pass
  - Audit all sections for semantic HTML (`header`, `main`, `section`, `nav`, `footer`, `article`)
  - Add descriptive `alt` text to all informational `<img>` elements
  - Verify tab order follows document source order across all sections
  - Verify all interactive elements are keyboard operable
  - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 14.1 Write property test for informational images having alt text
    - **Property 17: All informational images have non-empty alt text**
    - **Validates: Requirements 10.2**

  - [ ]* 14.2 Write property test for tab order following document order
    - **Property 15: Interactive elements are in logical tab order**
    - **Validates: Requirements 7.4, 10.3**

- [x] 15. Performance optimizations
  - Configure Vite dynamic `import()` code splitting for `CaseStudyModal`, `GallerySection`, `DesignPlayground`, and bonus features
  - Configure Vite `build.assetsInlineLimit` and image plugin to output WebP/AVIF assets
  - Verify `useLazyLoad` is applied to all below-fold images and videos
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 16. Bonus — Interactive Case Study Mode
  - Add `interactiveCaseStudy` feature flag to `CaseStudyModal`
  - Render clickable prototype screens with next/previous controls when flag is enabled
  - Lazy-load this feature via dynamic `import()`
  - _Requirements: 12.1, 12.2_

  - [x]* 16.1 Write property test for prototype navigation covering all screens
    - **Property 20: Prototype navigation covers all screens**
    - **Validates: Requirements 12.2**

- [x] 17. Bonus — Performance Dashboard
  - Add `performanceDashboard` feature flag
  - Render pre-captured Lighthouse score panel and Web Vitals (LCP, FID, CLS) when flag is enabled
  - Lazy-load this feature via dynamic `import()`
  - _Requirements: 13.1, 13.2_

- [x] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fc.assert` with `numRuns: 100` minimum and the tag `// Feature: ux-ui-portfolio, Property N: <text>`
- Unit tests and property tests are complementary — both are expected for full coverage
- Bonus tasks (16, 17) are gated behind feature flags and can be deferred
