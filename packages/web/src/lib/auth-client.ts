/**
 * Authentication Client
 *
 * Exports the appropriate auth client based on environment.
 * - API mode: Uses better-auth client for backend authentication
 * - Demo mode: Uses local storage client for offline demo
 *
 * @module lib/auth-client
 */

import { createAuthClient } from 'better-auth/react'
import { getDataSource } from './data-source'
import { localAuthClient, DEMO_CREDENTIALS } from './local-storage'

/**
 * Better-auth client for API mode
 */
const apiAuthClient = createAuthClient({
  baseURL: window.location.origin + '/api/v1/admin/auth',
  fetchOptions: {
    credentials: 'include',
    onError(context: { error: Error; response?: Response }) {
      console.error('Admin auth request failed:', context.error)
      if (context.response?.status === 401) {
        console.log('Admin unauthorized - session may have expired')
      }
    },
  },
})

/**
 * Auth client - automatically uses correct implementation based on environment.
 *
 * In demo mode (VITE_DATA_SOURCE=local), uses localStorage-based auth.
 * In API mode (VITE_DATA_SOURCE=api), uses better-auth backend.
 */
export const authUserClient = getDataSource() === 'local'
  ? localAuthClient
  : apiAuthClient

/**
 * Re-export demo credentials for login page
 */
export { DEMO_CREDENTIALS }