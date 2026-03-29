# Design Document: UX/UI Portfolio SPA

## Overview

A story-driven Single Page Application (SPA) portfolio for a UX/UI Designer & Frontend Developer. The application is built with React + Vite, styled with Tailwind CSS, animated with Framer Motion, and deployed to Vercel or Netlify. It presents a guided narrative experience across distinct sections: Hero, Case Studies, Gallery, Skills, Social/GitHub, and Contact.

The primary goals are:
- Immediate visual impact and clear identity communication
- Fast load times (Lighthouse ≥ 90 on desktop)
- Full accessibility (WCAG 2.1 AA)
- Responsive across all viewport sizes
- Dark/light theme with persistence

### Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form |
| HTTP | Native fetch (GitHub API) |
| Deployment | Vercel / Netlify |
| Testing | Vitest + React Testing Library + fast-check (PBT) |

---

## Architecture

The app is a client-side SPA with no backend. All routing is scroll-based with hash anchors. The contact form submits to a third-party form service (e.g., Formspree or Netlify Forms) to avoid a custom server.

### High-Level Component Tree

```
App
├── ThemeProvider          (context: dark/light, persisted to localStorage)
├── NavBar                 (scroll-spy, smooth scroll)
├── sections/
│   ├── HeroSection
│   │   ├── TypingAnimation
│   │   ├── ParticleBackground (or GradientMesh)
│   │   └── DraggableUIPreview
│   ├── CaseStudiesSection
│   │   ├── CaseStudyCard (×3–6)
│   │   └── CaseStudyModal
│   ├── GallerySection
│   │   ├── MasonryGrid
│   │   ├── GalleryItem (×n)
│   │   └── DesignPlayground
│   ├── SkillsSection
│   │   ├── RadarChart (or ProgressBars)
│   │   ├── ToolCard (×n)
│   │   └── MindsetToggle
│   ├── SocialSection
│   │   ├── GitHubStats
│   │   ├── RepoPreviewCard (×n)
│   │   └── SocialLink (×n)
│   └── ContactSection
│       ├── ContactForm
│       └── SuccessAnimation
└── Footer
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│  Static JSON / content files (case studies, skills) │
│  GitHub REST API v3 (public, unauthenticated)        │
│  Form service API (Formspree / Netlify Forms)        │
└──────────────────────┬──────────────────────────────┘
                       │
              React component tree
                       │
              Framer Motion animations
                       │
              Tailwind CSS styles
```

### Routing Strategy

Scroll-spy navigation using `IntersectionObserver`. Each section has a stable `id` attribute. The NavBar listens to intersection events and highlights the active section. Smooth scrolling is handled via `element.scrollIntoView({ behavior: 'smooth' })`.

URL structure: `/#hero`, `/#work`, `/#gallery`, `/#skills`, `/#social`, `/#contact`

### Code Splitting

Vite's dynamic `import()` is used to lazy-load:
- `CaseStudyModal` (loaded on first open)
- `GallerySection` (loaded when near viewport)
- `DesignPlayground` (loaded on demand)
- Bonus features: `InteractiveCaseStudyMode`, `PerformanceDashboard`

---

## Components and Interfaces

### ThemeProvider

```ts
interface ThemeContextValue {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}
```

Persists to `localStorage` under key `'portfolio-theme'`. Applies `dark` class to `<html>` for Tailwind dark mode.

### NavBar

- Renders `<nav>` with anchor links to each section id
- Uses `IntersectionObserver` to track active section
- Highlights active link with accent color
- Fully keyboard navigable

### HeroSection

```ts
interface HeroContent {
  name: string;
  roleTitle: string;
  tagline: string;
  typingSkills: string[];   // cycled by TypingAnimation
  ctaWork: string;
  ctaContact: string;
}
```

- `TypingAnimation`: uses Framer Motion or a lightweight typewriter hook to cycle `typingSkills`
- `ParticleBackground`: canvas-based cursor-reactive particles or CSS gradient mesh; respects `prefers-reduced-motion`
- `DraggableUIPreview`: a small draggable card/widget using Framer Motion `drag` prop

### CaseStudiesSection

```ts
interface CaseStudy {
  id: string;
  title: string;
  shortDescription: string;
  tags: string[];
  thumbnail: string;        // URL (WebP/AVIF)
  thumbnailIsVideo: boolean;
  problemStatement: string;
  processNarrative: ProcessStep[];
  beforeAfterVisuals: { before: string; after: string }[];
  metrics: string[];
  codeView?: CodeViewContent;
}

interface ProcessStep {
  phase: 'research' | 'wireframes' | 'ui' | 'implementation';
  description: string;
  assets: string[];
}

interface CodeViewContent {
  repoUrl: string;
  techStack: string[];
  highlights: string[];
}
```

- Horizontal scroll container with `overflow-x: auto` and scroll-snap
- `CaseStudyCard` shows thumbnail, title, tags; hover triggers peek preview via Framer Motion `whileHover`
- `CaseStudyModal` is a `<dialog>` element (native accessibility); lazy-loaded; returns focus to trigger on close
- Design/Code toggle is a controlled boolean state per card

### GallerySection

```ts
interface GalleryItem {
  id: string;
  type: 'component' | 'motion' | 'branding';
  src: string;
  alt: string;
  isInteractive: boolean;   // for Design Playground items
}
```

- CSS columns or `react-masonry-css` for masonry layout
- `GalleryItem` uses Framer Motion `whileHover` for 60fps hover animation
- Focused view on click: Framer Motion `layoutId` shared layout animation
- Keyboard navigation: `tabIndex`, `onKeyDown` Enter/Space handlers
- Theme-aware: gallery previews re-render when `theme` context changes

### SkillsSection

```ts
interface SkillCategory {
  name: 'UX' | 'UI' | 'Frontend';
  skills: Skill[];          // max 12 per category
}

interface Skill {
  name: string;
  level: number;            // 0–100
}

interface Tool {
  name: string;
  icon: string;
  description: string;
}
```

- Radar chart via a lightweight SVG implementation or `recharts`
- `MindsetToggle`: switches between Designer and Developer views (controlled state)
- `ToolCard`: shows icon + name; hover reveals description via Framer Motion

### SocialSection

```ts
interface GitHubStats {
  repoCount: number;
  contributionActivity: ContributionWeek[];
  featuredRepos: FeaturedRepo[];
}

interface FeaturedRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

interface SocialLink {
  platform: 'GitHub' | 'LinkedIn' | 'Dribbble' | 'Behance';
  url: string;
  ariaLabel: string;
}
```

- GitHub data fetched via `https://api.github.com/users/{username}` and `/repos`
- On fetch failure: renders static fallback (profile link only, no live stats)
- All social links open in `target="_blank" rel="noopener noreferrer"`
- Icon-only links have `aria-label` attributes

### ContactSection / ContactForm

```ts
interface ContactFormData {
  name: string;
  email: string;
  message: string;
  honeypot?: string;        // hidden field for spam protection
}

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  errors: Partial<Record<keyof ContactFormData, string>>;
}
```

- React Hook Form handles registration, validation, and submission
- Validation rules: name non-empty, email matches RFC 5322 pattern, message non-empty
- Honeypot: hidden `<input>` with `tabIndex={-1}` and `aria-hidden`; submission rejected if populated
- On success: Framer Motion success animation + confirmation message
- Inline errors rendered adjacent to each field; other field values preserved

---

## Data Models

### Content Data (Static JSON)

All portfolio content (case studies, skills, tools, social links) is stored as static JSON files in `src/data/`. This avoids a CMS dependency and keeps the build fully static.

```
src/data/
├── caseStudies.json
├── skills.json
├── tools.json
├── socialLinks.json
└── heroContent.json
```

### Theme State

```ts
type Theme = 'dark' | 'light';
// Stored in localStorage['portfolio-theme']
// Applied as class on <html> element
```

### GitHub API Response Shape (subset used)

```ts
// GET /users/{username}
interface GitHubUser {
  public_repos: number;
  html_url: string;
  avatar_url: string;
  bio: string;
}

// GET /users/{username}/repos?sort=stars&per_page=6
interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}
```

### Form Submission Payload

```ts
interface FormSubmissionPayload {
  name: string;
  email: string;
  message: string;
  // honeypot field omitted from payload if empty (as expected)
}
```

### Lazy Loading

`IntersectionObserver` is used directly (no library) to swap `data-src` → `src` on `<img>` and `<video>` elements as they enter the viewport. A React custom hook `useLazyLoad(ref)` encapsulates this logic.

### Animation Configuration

```ts
interface MotionConfig {
  reducedMotion: boolean;   // from window.matchMedia('(prefers-reduced-motion: reduce)')
}
// All Framer Motion variants check reducedMotion and use instant transitions when true
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Typing animation cycles all skills

*For any* non-empty array of skill strings passed to `TypingAnimation`, every skill in the array must appear as the displayed text at some point during the animation cycle.

**Validates: Requirements 1.2**

---

### Property 2: Case studies count is within bounds

*For any* case studies data array with between 3 and 6 entries, the `CaseStudiesSection` must render exactly that many case study cards — no more, no fewer.

**Validates: Requirements 2.1**

---

### Property 3: Case study modal renders all required fields

*For any* valid `CaseStudy` object, when the `CaseStudyModal` is opened with that object, the rendered output must contain the problem statement, at least one process step for each phase, before/after visuals, and at least one metric.

**Validates: Requirements 2.4**

---

### Property 4: Design/Code view toggle switches content

*For any* case study with both a design view and a code view, toggling the view state from design to code and back to design must restore the original design view content — a round-trip invariant.

**Validates: Requirements 2.7**

---

### Property 5: Lazy loading defers off-screen media

*For any* `<img>` or `<video>` element that is below the initial viewport at render time, the `src` attribute must not be set to the real asset URL until the element enters the viewport via `IntersectionObserver`.

**Validates: Requirements 2.8, 3.8, 9.2**

---

### Property 6: Theme propagates to all theme-aware components

*For any* theme value (`'dark'` or `'light'`), after `ThemeController` applies the theme, every theme-aware component (gallery previews, section backgrounds, text colors) must reflect the current theme value without a page reload.

**Validates: Requirements 3.5, 3.6, 8.2**

---

### Property 7: Gallery items are keyboard navigable

*For any* set of gallery items rendered by `GallerySection`, every item must have a non-negative `tabIndex` and must respond to Enter and Space key events by triggering the same action as a pointer click.

**Validates: Requirements 3.7, 10.3**

---

### Property 8: Mindset toggle switches displayed content

*For any* skills data, toggling `MindsetToggle` from "Designer" to "Developer" must change the displayed content, and toggling back must restore the original content — a round-trip invariant.

**Validates: Requirements 4.4**

---

### Property 9: Skills per category never exceeds 12

*For any* `SkillCategory` object, the number of skill items rendered in the `SkillsSection` for that category must be at most 12, regardless of how many skills are present in the source data.

**Validates: Requirements 4.6**

---

### Property 10: Social links open in new tab with accessible labels

*For any* social link rendered by `SocialSection`, the anchor element must have `target="_blank"` and a non-empty `aria-label` attribute that describes the link destination.

**Validates: Requirements 5.2, 5.6**

---

### Property 11: Featured repo cards contain name and description

*For any* array of `FeaturedRepo` objects returned by the GitHub API (or mock), each rendered repo card must display the repository name and description (or a fallback string if description is null).

**Validates: Requirements 5.4**

---

### Property 12: Contact form validation rejects invalid inputs

*For any* combination of form inputs where at least one of the following is true — name is empty/whitespace-only, email does not match a valid email pattern, message is empty/whitespace-only — the `Form_Validator` must prevent submission and the form state must remain unchanged.

**Validates: Requirements 6.3**

---

### Property 13: Validation errors preserve other field values

*For any* invalid form submission, the inline error messages must appear adjacent to the invalid fields, and the values of all other (valid) fields must be preserved in the form state.

**Validates: Requirements 6.4**

---

### Property 14: Active nav item reflects current viewport section

*For any* section that is intersecting the viewport (as reported by `IntersectionObserver`), the corresponding `NavBar` link must have the active highlight applied, and no other nav link must be highlighted simultaneously.

**Validates: Requirements 7.2**

---

### Property 15: Interactive elements are in logical tab order

*For any* rendered page state, the sequence of focusable elements reached by pressing Tab must follow document source order, with no focusable elements skipped or unreachable.

**Validates: Requirements 7.4, 10.3**

---

### Property 16: Theme preference round-trips through localStorage

*For any* theme value set by the user via `ThemeController`, the value stored in `localStorage['portfolio-theme']` must equal the active theme, and re-initializing the app must restore that theme.

**Validates: Requirements 8.3**

---

### Property 17: All informational images have non-empty alt text

*For any* `<img>` element rendered in the portfolio that conveys information (not purely decorative), the `alt` attribute must be a non-empty string.

**Validates: Requirements 10.2**

---

### Property 18: Form inputs have associated labels

*For any* `<input>` or `<textarea>` element in `ContactForm`, the element must have either an associated `<label>` (via `for`/`id`) or a non-empty `aria-label` attribute.

**Validates: Requirements 10.4**

---

### Property 19: Animations respect prefers-reduced-motion

*For any* Framer Motion animated component, when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, the component must use instant transitions (duration 0 or no animation) rather than the default motion variants.

**Validates: Requirements 10.5**

---

### Property 20: Prototype navigation covers all screens

*For any* interactive case study prototype with N screens (N ≥ 2), repeatedly pressing "next" from the first screen must visit all N screens exactly once before wrapping, and "previous" must navigate in reverse order.

**Validates: Requirements 12.2**

---

## Error Handling

### GitHub API Failure

- `SocialSection` wraps the fetch in a try/catch
- On any network error or non-2xx response, `gitHubStats` state is set to `null`
- When `null`, the component renders the static fallback: a plain link to the GitHub profile
- No error is thrown to the React error boundary; the section degrades gracefully

### Contact Form Submission Failure

- If the form service returns a non-2xx response, `FormState.status` is set to `'error'`
- An error message is displayed below the submit button
- The form fields retain their values so the user can retry

### Image Load Failure

- `<img>` elements use an `onError` handler to swap in a placeholder image
- This prevents broken image icons from appearing in the gallery or case studies

### Lazy Load Observer Cleanup

- `useLazyLoad` hook disconnects the `IntersectionObserver` in the cleanup function of `useEffect` to prevent memory leaks

### Reduced Motion Detection

- `useReducedMotion` hook (Framer Motion built-in) is used globally
- All animation variants are defined as objects with a `reduced` variant that uses `duration: 0`
- The `AnimatePresence` wrapper respects this at the top level

### Modal Focus Trap

- `CaseStudyModal` uses a focus trap (via `inert` attribute on background or a custom hook) to prevent Tab from leaving the modal while it is open
- On close, focus is explicitly returned to the element that triggered the modal open

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- Unit tests catch concrete bugs with specific examples and edge cases
- Property tests verify universal correctness across all valid inputs

### Unit Tests (Vitest + React Testing Library)

Focus areas:
- Rendering: verify specific content is present (CTA buttons, form fields, social links, meta tags)
- Interactions: click handlers, modal open/close, form submission, theme toggle
- Edge cases: GitHub API failure fallback, honeypot rejection, null repo descriptions
- Integration: NavBar scroll-spy, focus management after modal close

Examples of unit test scenarios:
- Hero renders name, role, tagline from content data
- Clicking "View Work" calls scrollIntoView on the case studies section
- Submitting form with honeypot populated does not call the form service
- GitHub fetch failure renders static fallback link
- Success animation renders after valid form submission

### Property-Based Tests (Vitest + fast-check)

Each property from the Correctness Properties section is implemented as a single property-based test using `fast-check`. Minimum 100 iterations per test.

Tag format for each test:
```
// Feature: ux-ui-portfolio, Property {N}: {property_text}
```

| Property | Generator Strategy |
|---|---|
| P1: Typing animation cycles all skills | `fc.array(fc.string(), { minLength: 1 })` |
| P2: Case studies count within bounds | `fc.array(caseStudyArb, { minLength: 3, maxLength: 6 })` |
| P3: Modal renders all required fields | `fc.record(...)` matching `CaseStudy` shape |
| P4: Design/Code toggle round-trip | `fc.boolean()` for initial toggle state |
| P5: Lazy loading defers off-screen media | `fc.array(fc.string())` for image URLs |
| P6: Theme propagates to all components | `fc.constantFrom('dark', 'light')` |
| P7: Gallery keyboard navigable | `fc.array(galleryItemArb, { minLength: 1 })` |
| P8: Mindset toggle round-trip | `fc.boolean()` for initial mindset |
| P9: Skills per category ≤ 12 | `fc.array(skillArb, { minLength: 0, maxLength: 50 })` |
| P10: Social links new tab + aria-label | `fc.array(socialLinkArb, { minLength: 1 })` |
| P11: Repo cards contain name + description | `fc.array(repoArb, { minLength: 1 })` |
| P12: Form validation rejects invalid inputs | `fc.record({ name: fc.string(), email: fc.string(), message: fc.string() })` |
| P13: Validation preserves other field values | Same as P12 with at least one invalid field |
| P14: Active nav reflects viewport section | `fc.constantFrom('hero', 'work', 'gallery', 'skills', 'social', 'contact')` |
| P15: Tab order follows document order | Rendered component tree inspection |
| P16: Theme localStorage round-trip | `fc.constantFrom('dark', 'light')` |
| P17: Images have non-empty alt text | `fc.array(imageArb, { minLength: 1 })` |
| P18: Form inputs have labels | Rendered ContactForm inspection |
| P19: Animations respect reduced-motion | `fc.boolean()` for reducedMotion flag |
| P20: Prototype navigation covers all screens | `fc.array(screenArb, { minLength: 2 })` |

### Test File Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── HeroSection.test.tsx
│   │   ├── CaseStudiesSection.test.tsx
│   │   ├── GallerySection.test.tsx
│   │   ├── SkillsSection.test.tsx
│   │   ├── SocialSection.test.tsx
│   │   ├── ContactSection.test.tsx
│   │   ├── NavBar.test.tsx
│   │   ├── ThemeController.test.tsx
│   │   └── MetaTags.test.tsx
│   └── property/
│       ├── typingAnimation.property.test.ts
│       ├── caseStudies.property.test.ts
│       ├── gallery.property.test.ts
│       ├── skills.property.test.ts
│       ├── social.property.test.ts
│       ├── contactForm.property.test.ts
│       ├── navigation.property.test.ts
│       ├── theme.property.test.ts
│       ├── accessibility.property.test.ts
│       └── interactiveCaseStudy.property.test.ts
```

### Property Test Configuration

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});

// Each property test uses fc.assert with numRuns: 100 minimum
fc.assert(
  fc.property(generator, (input) => {
    // Feature: ux-ui-portfolio, Property N: <property text>
    // ... test body
  }),
  { numRuns: 100 }
);
```
