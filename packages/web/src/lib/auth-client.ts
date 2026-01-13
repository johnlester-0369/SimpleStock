import { createAuthClient } from 'better-auth/react'

// Admin client (default)
export const authUserClient = createAuthClient({
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