/**
 * Application-wide constants
 *
 * Central source of truth for site metadata and branding.
 * Import from this file to avoid duplication across components.
 *
 * @example
 * import { APP_NAME, APP_DESCRIPTION } from '@/constants/app.constants'
 */

/** Application name - used in branding, page titles, and meta tags */
export const APP_NAME = 'SimpleStock'

/** Application tagline - short branding phrase */
export const APP_TAGLINE = 'Simple Inventory System'

/** Default meta description for SEO */
export const APP_DESCRIPTION =
  'A simple and intuitive inventory management system to track stock, manage products, and streamline your business operations.'

/** Short description for Open Graph and Twitter cards */
export const APP_DESCRIPTION_SHORT =
  'Simple and intuitive inventory management for your business.'

/** Default meta keywords for SEO */
export const APP_KEYWORDS = [
  'inventory management',
  'stock tracking',
  'product management',
  'warehouse management',
  'inventory system',
  'SimpleStock',
]

/** Application metadata object - useful for structured access */
export const APP_METADATA = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  description: APP_DESCRIPTION,
  descriptionShort: APP_DESCRIPTION_SHORT,
  keywords: APP_KEYWORDS,
} as const