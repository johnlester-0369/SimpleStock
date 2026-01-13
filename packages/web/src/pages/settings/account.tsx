import React, { useState, useEffect } from 'react'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { authUserClient } from '@/lib/auth-client'
import PageHead from '@/components/common/PageHead'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Pencil, User, Mail, Lock, Eye, EyeOff, Save } from 'lucide-react'
import {
  validateForm,
  passwordChangeSchema,
  isEmpty,
  type PasswordChangeFormData as ZodPasswordChangeFormData,
} from '@/utils/validation.util'

/**
 * Password form state interface
 */
interface PasswordFormState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** Initial empty password form */
const EMPTY_PASSWORD_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

/**
 * AccountPage Component
 *
 * A dedicated page for managing user account featuring:
 * - User Profile section with editable name field
 * - Change Password functionality via better-auth API
 * - Real-time validation for all operations
 * - Integration with UserAuthContext for user data
 */
const AccountPage: React.FC = () => {
  // Get user data and refresh function from auth context
  const { user, isLoading: authLoading, refreshSession } = useUserAuth()

  // Profile editing states
  const [isProfileEditing, setIsProfileEditing] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileNameError, setProfileNameError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(EMPTY_PASSWORD_FORM)
  const [passwordFormError, setPasswordFormError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sync profile name with user data when user changes or editing starts
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name)
    }
  }, [user?.name])

  /**
   * Validates the profile name field
   * @param value - Name value to validate
   * @returns True if valid, false otherwise
   */
  const validateProfileName = (value: string): boolean => {
    if (isEmpty(value)) {
      setProfileNameError('Full name is required')
      return false
    }
    if (value.trim().length < 2) {
      setProfileNameError('Name must be at least 2 characters')
      return false
    }
    setProfileNameError('')
    return true
  }

  /**
   * Start editing profile - reset to current user name
   */
  const handleStartEditing = () => {
    setProfileName(user?.name || '')
    setProfileNameError('')
    setProfileError('')
    setIsProfileEditing(true)
  }

  /**
   * Cancel profile editing - reset form
   */
  const handleCancelProfileEdit = () => {
    setProfileName(user?.name || '')
    setIsProfileEditing(false)
    setProfileNameError('')
    setProfileError('')
  }

  /**
   * Save profile changes via better-auth API
   */
  const handleSaveProfile = async () => {
    // Validate name
    if (!validateProfileName(profileName)) {
      return
    }

    // Check if name actually changed
    if (profileName.trim() === user?.name) {
      setIsProfileEditing(false)
      return
    }

    setProfileLoading(true)
    setProfileError('')

    try {
      const result = await authUserClient.updateUser({
        name: profileName.trim(),
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile')
      }

      // Refresh session to get updated user data
      refreshSession()

      setIsProfileEditing(false)
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.error('Profile update failed:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile'
      setProfileError(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }

  /**
   * Reset password form to initial state
   */
  const resetPasswordForm = () => {
    setPasswordForm(EMPTY_PASSWORD_FORM)
    setPasswordFormError('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  /**
   * Handle password change with Zod validation and API call
   */
  const handleChangePassword = async () => {
    // Validate using Zod schema
    const validation = validateForm(passwordChangeSchema, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })

    if (!validation.success) {
      setPasswordFormError(validation.error || 'Validation failed')
      return
    }

    const validatedData = validation.data as ZodPasswordChangeFormData

    setPasswordLoading(true)
    setPasswordFormError('')

    try {
      const result = await authUserClient.changePassword({
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
        revokeOtherSessions: true, // Security: revoke other sessions on password change
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to change password')
      }

      setIsChangePasswordOpen(false)
      resetPasswordForm()
      setPasswordSuccess('Password changed successfully!')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      console.error('Password change failed:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to change password'
      setPasswordFormError(errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  /**
   * Handle password form field changes
   */
  const handlePasswordFormChange =
    (field: keyof PasswordFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (passwordFormError) setPasswordFormError('')
    }

  /**
   * Close password dialog and reset form
   */
  const handleClosePasswordDialog = (open: boolean) => {
    setIsChangePasswordOpen(open)
    if (!open) resetPasswordForm()
  }

  // Show loading state while checking auth
  if (authLoading) {
    return <LoadingSpinner />
  }

  // Handle case where user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert
          variant="error"
          title="Unable to load account"
          message="Please try refreshing the page or logging in again."
        />
      </div>
    )
  }

  return (
    <>
      <PageHead
        title="Account Settings"
        description="Manage your personal information and account security."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
            Account Settings
          </h1>
          <p className="mt-1 text-muted">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Success Messages */}
        {profileSuccess && (
          <Alert
            variant="success"
            title={profileSuccess}
            onClose={() => setProfileSuccess('')}
          />
        )}
        {passwordSuccess && (
          <Alert
            variant="success"
            title={passwordSuccess}
            onClose={() => setPasswordSuccess('')}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information Card */}
          <Card.Root padding="md">
            <Card.Header>
              <Card.Title as="h3">Profile Information</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {profileError && (
                  <Alert
                    variant="error"
                    title={profileError}
                    onClose={() => setProfileError('')}
                  />
                )}

                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={isProfileEditing ? profileName : user.name}
                  onChange={(e) => {
                    setProfileName(e.target.value)
                    if (profileNameError) validateProfileName(e.target.value)
                  }}
                  onBlur={(e) => {
                    if (isProfileEditing) validateProfileName(e.target.value)
                  }}
                  error={profileNameError}
                  leftIcon={<User className="h-5 w-5" />}
                  disabled={!isProfileEditing || profileLoading}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Your email address"
                  value={user.email}
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={true}
                  helperText="Email cannot be changed"
                />
              </div>
            </Card.Body>
            <Card.Footer>
              {isProfileEditing ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleCancelProfileEdit}
                    disabled={profileLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Save className="h-4 w-4" />}
                    onClick={handleSaveProfile}
                    isLoading={profileLoading}
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={handleStartEditing}
                >
                  Edit Profile
                </Button>
              )}
            </Card.Footer>
          </Card.Root>

          {/* Security Card */}
          <Card.Root padding="md">
            <Card.Header>
              <Card.Title as="h3">Security</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="p-4 bg-surface-1 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-headline">Password</p>
                      <p className="text-sm text-muted">
                        Last updated:{' '}
                        {user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted">
                  We recommend changing your password regularly to keep your
                  account secure. Use a strong password with a mix of letters,
                  numbers, and symbols.
                </p>
              </div>
            </Card.Body>
            <Card.Footer>
              <Dialog.Root
                open={isChangePasswordOpen}
                onOpenChange={handleClosePasswordDialog}
              >
                <Dialog.Trigger asChild>
                  <Button
                    variant="secondary"
                    leftIcon={<Lock className="h-4 w-4" />}
                  >
                    Change Password
                  </Button>
                </Dialog.Trigger>

                <Dialog.Positioner>
                  <Dialog.Backdrop />
                  <Dialog.Content size="sm">
                    <Dialog.Header>
                      <Dialog.Title>Change Password</Dialog.Title>
                      <Dialog.CloseTrigger />
                    </Dialog.Header>

                    <Dialog.Body>
                      <div className="space-y-4">
                        {passwordFormError && (
                          <Alert
                            variant="error"
                            title={passwordFormError}
                            onClose={() => setPasswordFormError('')}
                          />
                        )}

                        <Input
                          label="Current Password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange('currentPassword')}
                          leftIcon={<Lock className="h-5 w-5" />}
                          rightIcon={
                            showCurrentPassword ? (
                              <EyeOff
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowCurrentPassword(false)}
                              />
                            ) : (
                              <Eye
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowCurrentPassword(true)}
                              />
                            )
                          }
                          disabled={passwordLoading}
                        />

                        <Input
                          label="New Password"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange('newPassword')}
                          leftIcon={<Lock className="h-5 w-5" />}
                          rightIcon={
                            showNewPassword ? (
                              <EyeOff
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowNewPassword(false)}
                              />
                            ) : (
                              <Eye
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowNewPassword(true)}
                              />
                            )
                          }
                          helperText="Must be at least 8 characters"
                          disabled={passwordLoading}
                        />

                        <Input
                          label="Confirm New Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange('confirmPassword')}
                          leftIcon={<Lock className="h-5 w-5" />}
                          rightIcon={
                            showConfirmPassword ? (
                              <EyeOff
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowConfirmPassword(false)}
                              />
                            ) : (
                              <Eye
                                className="h-5 w-5 cursor-pointer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowConfirmPassword(true)}
                              />
                            )
                          }
                          disabled={passwordLoading}
                        />
                      </div>
                    </Dialog.Body>

                    <Dialog.Footer>
                      <Button
                        variant="ghost"
                        onClick={() => setIsChangePasswordOpen(false)}
                        disabled={passwordLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleChangePassword}
                        isLoading={passwordLoading}
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Dialog.Root>
            </Card.Footer>
          </Card.Root>
        </div>
      </div>
    </>
  )
}

export default AccountPage