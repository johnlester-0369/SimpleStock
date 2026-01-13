
import { createAuthClient } from 'better-auth/react'
// User client (default)
export const authUserClient = createAuthClient({
  baseURL: window.location.origin + '/api/v1/user/auth',
  fetchOptions: {
    credentials: 'include',
    onError(context: { error: Error; response?: Response }) {
      console.error('User auth request failed:', context.error)
      if (context.response?.status === 401) {
        console.log('User unauthorized - session may have expired')
      }
    },
  },
})
