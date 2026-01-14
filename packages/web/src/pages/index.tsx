import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PageHead from '@/components/common/PageHead'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import { Mail, Lock, LogIn, Eye, EyeOff, Info } from 'lucide-react'
import { isValidEmail, isEmpty } from '@/validators'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ROUTE_DASHBOARD } from '@/constants/routes.constants'
import { isDemoMode } from '@/lib/data-source'
import { DEMO_CREDENTIALS } from '@/lib/auth-client'

/**
 * Location state interface for redirect handling
 */
interface LocationState {
  from?: {
    pathname: string
  }
}

/**
 * UserLogin Component
 *
 * Handles user authentication with:
 * - Email/password login via better-auth (API mode) or localStorage (demo mode)
 * - Field-level validation
 * - Redirect to original destination after login
 * - Loading states and error handling
 * - Demo mode credential display
 */
const UserLogin: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, login } = useUserAuth()

  // Check if running in demo mode
  const isDemo = isDemoMode()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>('')

  // Field-level errors
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Get the page they were trying to access (defaults to dashboard)
  const state = location.state as LocationState | null
  const from = state?.from?.pathname ?? ROUTE_DASHBOARD

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  /**
   * Validates email field using validators module
   * @param value - Email value to validate
   * @returns True if valid, false otherwise
   */
  const validateEmail = (value: string): boolean => {
    if (isEmpty(value)) {
      setEmailError('Email is required')
      return false
    }
    if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  /**
   * Validates password field using validators module
   * @param value - Password value to validate
   * @returns True if valid, false otherwise
   */
  const validatePasswordField = (value: string): boolean => {
    if (isEmpty(value)) {
      setPasswordError('Password is required')
      return false
    }
    setPasswordError('')
    return true
  }

  /**
   * Handles form submission
   * Validates fields and calls login API
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError('')

    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePasswordField(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setLoading(true)

    try {
      await login(email, password, rememberMe)
      // Navigate to the page they were trying to access or dashboard
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login failed:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Please try again.'
      setLoginError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fill in demo credentials
   */
  const handleUseDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setEmailError('')
    setPasswordError('')
    setLoginError('')
  }

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <>
      <PageHead
        title="Sign In"
        description="Sign in to your SimpleStock account to manage your inventory."
      />
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md shadow-soft">
          <Card.Root>
            {/* Brand Section */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <BrandLogo size="lg" />
              <BrandName />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-headline mb-2">
                Welcome Back
              </h1>
              <p className="text-text">Sign in to your account to continue</p>
            </div>

            {/* Demo Mode Banner */}
            {isDemo && (
              <div className="mb-6 p-4 bg-info/10 border border-info/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-headline mb-2">
                      Demo Mode Active
                    </p>
                    <p className="text-xs text-muted mb-3">
                      This is a demo version using local storage on your browser. No server API
                      required. Use the credentials below to sign in:
                    </p>
                    <div className="bg-surface-2 p-3 rounded-md space-y-1 text-xs font-mono">
                      <p>
                        <span className="text-muted">Email:</span>{' '}
                        <span className="text-headline">
                          {DEMO_CREDENTIALS.email}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted">Password:</span>{' '}
                        <span className="text-headline">
                          {DEMO_CREDENTIALS.password}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUseDemoCredentials}
                      className="mt-3 text-info hover:text-info"
                    >
                      Use Demo Credentials
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">
                {loginError && (
                  <Alert
                    variant="error"
                    title="Login Failed"
                    message={loginError}
                    onClose={() => setLoginError('')}
                  />
                )}

                <div className="grid gap-1">
                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) validateEmail(e.target.value)
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    error={emailError}
                    leftIcon={<Mail className="h-5 w-5" />}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="grid gap-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) validatePasswordField(e.target.value)
                    }}
                    onBlur={(e) => validatePasswordField(e.target.value)}
                    error={passwordError}
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      showPassword ? (
                        <EyeOff
                          className="h-5 w-5 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => !loading && setShowPassword(false)}
                        />
                      ) : (
                        <Eye
                          className="h-5 w-5 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => !loading && setShowPassword(true)}
                        />
                      )
                    }
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors"
                    />
                    <span className="text-text">Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  leftIcon={!loading ? <LogIn className="h-5 w-5" /> : undefined}
                  className="w-full"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </Card.Root>
        </div>
      </div>
    </>
  )
}

export default UserLogin