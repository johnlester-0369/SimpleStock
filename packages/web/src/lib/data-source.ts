/**
 * Data Source Configuration
 *
 * Utility for determining which data source to use based on environment.
 * Supports 'api' (backend) and 'local' (localStorage demo mode).
 *
 * @module lib/data-source
 */

/**
 * Data source type
 */
export type DataSource = 'api' | 'local'

/**
 * Gets the current data source from environment variables.
 * Defaults to 'api' if not specified.
 *
 * @returns The data source type ('api' or 'local')
 *
 * @example
 * ```typescript
 * const source = getDataSource()
 * if (source === 'local') {
 *   // Use localStorage
 * } else {
 *   // Use API
 * }
 * ```
 */
export function getDataSource(): DataSource {
  const source = import.meta.env.VITE_DATA_SOURCE
  if (source === 'local') {
    return 'local'
  }
  return 'api'
}

/**
 * Checks if the application is running in demo mode (local storage).
 *
 * @returns True if running in demo/local mode
 */
export function isDemoMode(): boolean {
  return getDataSource() === 'local'
}

/**
 * Checks if the application is running with API backend.
 *
 * @returns True if running with API backend
 */
export function isApiMode(): boolean {
  return getDataSource() === 'api'
}