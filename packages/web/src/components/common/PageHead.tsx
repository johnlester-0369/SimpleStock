import React from 'react'
import { Helmet } from '@dr.pogodin/react-helmet'
import { APP_NAME, APP_DESCRIPTION } from '@/constants/app.constants'

/**
 * PageHead Component
 *
 * Reusable component for managing document head elements.
 * Uses @dr.pogodin/react-helmet for thread-safe head management.
 *
 * @example
 * <PageHead
 *   title="Dashboard"
 *   description="View your inventory overview"
 * />
 */

interface PageHeadProps {
  /** Page title - will be appended with site name */
  title: string
  /** Meta description for SEO */
  description?: string
  /** Open Graph image URL */
  ogImage?: string
  /** Canonical URL */
  canonical?: string
  /** Additional meta tags */
  meta?: Array<{ name: string; content: string }>
  /** Disable title suffix (site name) */
  noSuffix?: boolean
}

const PageHead: React.FC<PageHeadProps> = ({
  title,
  description = APP_DESCRIPTION,
  ogImage,
  canonical,
  meta = [],
  noSuffix = false,
}) => {
  const fullTitle = noSuffix ? title : `${title} | ${APP_NAME}`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Additional custom meta tags */}
      {meta.map((tag, index) => (
        <meta key={`${tag.name}-${index}`} name={tag.name} content={tag.content} />
      ))}
    </Helmet>
  )
}

export default PageHead