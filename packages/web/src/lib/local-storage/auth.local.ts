/**
 * Local Authentication Client
 *
 * Mimics the better-auth client interface for demo mode.
 * Uses localStorage to persist session and user data.
 *
 * @module lib/local-storage/auth.local
 */

import { useState, useEffect, useCallback } from 'react'
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  generateId,
  getCurrentTimestamp,
} from './storage.util'

// ============================================================================
// DEMO CREDENTIALS
// ============================================================================

/** Demo user credentials */
export const DEMO_CREDENTIALS = {
  email: 'demo@simplestock.com',
  password: 'demo123456',
} as const

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User interface for local auth
 */
interface LocalUser {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: string
  updatedAt: string
}

/**
 * Session interface for local auth
 */
interface LocalSession {
  session: {
    userId: string
    expiresAt: string
    token: string
  }
  user: LocalUser
}

/**
 * Session hook return type
 */
interface UseSessionReturn {
  data: LocalSession | null
  isPending: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Sign in options
 */
interface SignInOptions {
  onSuccess?: () => void
  onError?: (ctx: { error: Error }) => void
}

/**
 * Sign in result
 */
interface SignInResult {
  error?: { message: string }
}

/**
 * Sign out options
 */
interface SignOutOptions {
  fetchOptions?: {
    onSuccess?: () => void
    onError?: (ctx: { error: Error }) => void
  }
}

/**
 * Sign out result
 */
interface SignOutResult {
  error?: { message: string }
}

/**
 * Change password params
 */
interface ChangePasswordParams {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

/**
 * Update user params
 */
interface UpdateUserParams {
  name?: string
  image?: string
}

// ============================================================================
// DEFAULT DEMO USER
// ============================================================================

/**
 * Creates the default demo user
 */
function createDemoUser(): LocalUser {
  const now = getCurrentTimestamp()
  return {
    id: 'demo-user-001',
    name: 'Demo User',
    email: DEMO_CREDENTIALS.email,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Creates a session for a user
 */
function createSession(user: LocalUser): LocalSession {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  return {
    session: {
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
      token: generateId(),
    },
    user,
  }
}

// ============================================================================
// LOCAL AUTH CLIENT
// ============================================================================

/**
 * Local authentication client that mimics better-auth client interface.
 * Uses localStorage for persistence in demo mode.
 */
class LocalAuthClient {
  /**
   * React hook for getting current session.
   * Reads from localStorage and manages state.
   */
  useSession(): UseSessionReturn {
    const [data, setData] = useState<LocalSession | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const loadSession = useCallback(() => {
      try {
        const session = getStorageItem<LocalSession | null>(
          STORAGE_KEYS.AUTH_SESSION,
          null,
        )

        if (session) {
          // Check if session is expired
          const expiresAt = new Date(session.session.expiresAt)
          if (expiresAt > new Date()) {
            setData(session)
          } else {
            // Session expired, clean up
            removeStorageItem(STORAGE_KEYS.AUTH_SESSION)
            setData(null)
          }
        } else {
          setData(null)
        }
        setError(null)
      } catch (err) {
        console.error('Failed to load session:', err)
        setError(err instanceof Error ? err : new Error('Failed to load session'))
        setData(null)
      } finally {
        setIsPending(false)
      }
    }, [])

    useEffect(() => {
      // Small delay to simulate async check
      const timer = setTimeout(loadSession, 100)
      return () => clearTimeout(timer)
    }, [loadSession])

    const refetch = useCallback(() => {
      setIsPending(true)
      loadSession()
    }, [loadSession])

    return { data, isPending, error, refetch }
  }

  /**
   * Sign in with email/password
   */
  signIn = {
    email: async (
      credentials: { email: string; password: string; rememberMe?: boolean },
      options?: SignInOptions,
    ): Promise<SignInResult> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { email, password } = credentials

      // Validate credentials
      if (
        email.toLowerCase() !== DEMO_CREDENTIALS.email.toLowerCase() ||
        password !== DEMO_CREDENTIALS.password
      ) {
        const error = new Error('Invalid email or password')
        options?.onError?.({ error })
        return { error: { message: error.message } }
      }

      try {
        // Get or create user
        let user = getStorageItem<LocalUser | null>(STORAGE_KEYS.AUTH_USER, null)
        if (!user) {
          user = createDemoUser()
          setStorageItem(STORAGE_KEYS.AUTH_USER, user)
        }

        // Create session
        const session = createSession(user)
        setStorageItem(STORAGE_KEYS.AUTH_SESSION, session)

        options?.onSuccess?.()
        return {}
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign in failed')
        options?.onError?.({ error })
        return { error: { message: error.message } }
      }
    },
  }

  /**
   * Sign out current user
   */
  async signOut(options?: SignOutOptions): Promise<SignOutResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      removeStorageItem(STORAGE_KEYS.AUTH_SESSION)
      options?.fetchOptions?.onSuccess?.()
      return {}
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed')
      options?.fetchOptions?.onError?.({ error })
      return { error: { message: error.message } }
    }
  }

  /**
   * Change password (demo mode just validates current password)
   */
  async changePassword(
    params: ChangePasswordParams,
  ): Promise<{ error?: { message: string } }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { currentPassword, newPassword } = params

    // Validate current password
    if (currentPassword !== DEMO_CREDENTIALS.password) {
      return { error: { message: 'Current password is incorrect' } }
    }

    // Validate new password
    if (newPassword.length < 8) {
      return { error: { message: 'New password must be at least 8 characters' } }
    }

    // In demo mode, we don't actually change the password
    // Just return success
    console.log('Demo mode: Password change simulated (not persisted)')
    return {}
  }

  /**
   * Update user profile
   */
  async updateUser(
    params: UpdateUserParams,
  ): Promise<{ error?: { message: string } }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const session = getStorageItem<LocalSession | null>(
        STORAGE_KEYS.AUTH_SESSION,
        null,
      )

      if (!session) {
        return { error: { message: 'Not authenticated' } }
      }

      // Update user
      const updatedUser: LocalUser = {
        ...session.user,
        ...params,
        updatedAt: getCurrentTimestamp(),
      }

      // Update session with new user data
      const updatedSession: LocalSession = {
        ...session,
        user: updatedUser,
      }

      setStorageItem(STORAGE_KEYS.AUTH_SESSION, updatedSession)
      setStorageItem(STORAGE_KEYS.AUTH_USER, updatedUser)

      return {}
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Update failed')
      return { error: { message: error.message } }
    }
  }
}

/** Singleton instance of local auth client */
export const localAuthClient = new LocalAuthClient()