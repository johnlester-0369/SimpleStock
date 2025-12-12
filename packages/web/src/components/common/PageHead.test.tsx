import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import PageHead from './PageHead'
import { HelmetProvider } from '@dr.pogodin/react-helmet'

// Mock the constants
vi.mock('@/constants/app.constants', () => ({
  APP_NAME: 'MockSimpleStock',
  APP_DESCRIPTION: 'Mock application description for testing.',
}))

describe('PageHead', () => {
  // Save original document head to restore after each test
  let originalHead: string

  beforeEach(() => {
    originalHead = document.head.innerHTML
  })

  afterEach(() => {
    document.head.innerHTML = originalHead
  })

  const renderPageHead = (props: React.ComponentProps<typeof PageHead>) => {
    return render(
      <HelmetProvider>
        <PageHead {...props} />
      </HelmetProvider>
    )
  }

  it('should render Helmet with correct title when suffix is included', () => {
    renderPageHead({ title: 'Dashboard' })
    // Check the document title
    expect(document.title).toBe('Dashboard | MockSimpleStock')
  })

  it('should use exact title when noSuffix prop is true', () => {
    renderPageHead({ title: 'Dashboard', noSuffix: true })
    expect(document.title).toBe('Dashboard')
  })

  it('should include default description meta tag', () => {
    renderPageHead({ title: 'Test Page' })
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeInTheDocument()
    expect(metaDescription).toHaveAttribute('content', 'Mock application description for testing.')
  })

  it('should use custom description when provided', () => {
    const customDescription = 'Custom page description for testing.'
    renderPageHead({ title: 'Test Page', description: customDescription })
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toHaveAttribute('content', customDescription)
  })

  it('should set Open Graph meta tags when ogImage is provided', () => {
    const testImage = 'https://example.com/image.png'
    renderPageHead({ title: 'OG Page', ogImage: testImage })
    const ogImageMeta = document.querySelector('meta[property="og:image"]')
    expect(ogImageMeta).toBeInTheDocument()
    expect(ogImageMeta).toHaveAttribute('content', testImage)
  })

  it('should set canonical link when canonical URL is provided', () => {
    const testUrl = 'https://example.com/canonical'
    renderPageHead({ title: 'Canonical Page', canonical: testUrl })
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    expect(canonicalLink).toBeInTheDocument()
    expect(canonicalLink).toHaveAttribute('href', testUrl)
  })

  it('should render additional custom meta tags', () => {
    const customMeta = [
      { name: 'keywords', content: 'test,unit,react' },
      { name: 'author', content: 'Test Author' },
    ]
    renderPageHead({ title: 'Meta Page', meta: customMeta })
    customMeta.forEach(tag => {
      const metaTag = document.querySelector(`meta[name="${tag.name}"]`)
      expect(metaTag).toBeInTheDocument()
      expect(metaTag).toHaveAttribute('content', tag.content)
    })
  })

  it('should render without error when given minimal props', () => {
    expect(() => {
      renderPageHead({ title: 'Minimal Page' })
    }).not.toThrow()
  })

  it('should include Twitter card meta tags by default', () => {
    renderPageHead({ title: 'Twitter Test' })
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    expect(twitterCard).toBeInTheDocument()
    expect(twitterCard).toHaveAttribute('content', 'summary_large_image')
  })

  it('should handle empty string for description', () => {
    renderPageHead({ title: 'Empty Description', description: '' })
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeInTheDocument()
    expect(metaDescription).toHaveAttribute('content', '')
  })

  it('should include og:type meta tag', () => {
    renderPageHead({ title: 'Type Test' })
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType).toBeInTheDocument()
    expect(ogType).toHaveAttribute('content', 'website')
  })
})