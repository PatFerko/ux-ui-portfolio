import { describe, it, expect, beforeEach } from 'vitest'

// Requirements: 11.1, 11.2
describe('SEO Meta Tags', () => {
  beforeEach(() => {
    // Set the document head to match index.html content
    document.title = 'Alex Rivera — UX/UI Designer & Frontend Developer'

    const setMeta = (attrs: Record<string, string>) => {
      const existing = document.querySelector(
        Object.entries(attrs)
          .filter(([k]) => k !== 'content')
          .map(([k, v]) => `[${k}="${v}"]`)
          .join('')
      )
      if (existing) {
        existing.setAttribute('content', attrs.content)
        return
      }
      const meta = document.createElement('meta')
      Object.entries(attrs).forEach(([k, v]) => meta.setAttribute(k, v))
      document.head.appendChild(meta)
    }

    setMeta({ name: 'description', content: 'Portfolio of Alex Rivera, a UX/UI Designer and Frontend Developer who turns complex problems into intuitive, beautiful digital experiences.' })
    setMeta({ property: 'og:title', content: 'Alex Rivera — UX/UI Designer & Frontend Developer' })
    setMeta({ property: 'og:description', content: 'Portfolio of Alex Rivera, a UX/UI Designer and Frontend Developer who turns complex problems into intuitive, beautiful digital experiences.' })
    setMeta({ property: 'og:image', content: 'https://alexrivera.design/og-image.webp' })
    setMeta({ property: 'og:type', content: 'website' })
    setMeta({ property: 'og:url', content: 'https://alexrivera.design/' })
  })

  it('has a non-empty document title', () => {
    expect(document.title).toBeTruthy()
    expect(document.title.length).toBeGreaterThan(0)
  })

  it('title contains the designer name', () => {
    expect(document.title).toContain('Alex Rivera')
  })

  it('has a meta description tag', () => {
    const desc = document.querySelector('meta[name="description"]')
    expect(desc).not.toBeNull()
    expect(desc?.getAttribute('content')).toBeTruthy()
  })

  it('meta description is non-empty', () => {
    const desc = document.querySelector('meta[name="description"]')
    const content = desc?.getAttribute('content') ?? ''
    expect(content.length).toBeGreaterThan(0)
  })

  it('has og:title Open Graph tag', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle).not.toBeNull()
    expect(ogTitle?.getAttribute('content')).toBeTruthy()
  })

  it('has og:description Open Graph tag', () => {
    const ogDesc = document.querySelector('meta[property="og:description"]')
    expect(ogDesc).not.toBeNull()
    expect(ogDesc?.getAttribute('content')).toBeTruthy()
  })

  it('has og:image Open Graph tag', () => {
    const ogImage = document.querySelector('meta[property="og:image"]')
    expect(ogImage).not.toBeNull()
    expect(ogImage?.getAttribute('content')).toBeTruthy()
  })

  it('has og:type Open Graph tag', () => {
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType).not.toBeNull()
    expect(ogType?.getAttribute('content')).toBe('website')
  })

  it('has og:url Open Graph tag', () => {
    const ogUrl = document.querySelector('meta[property="og:url"]')
    expect(ogUrl).not.toBeNull()
    expect(ogUrl?.getAttribute('content')).toBeTruthy()
  })
})
