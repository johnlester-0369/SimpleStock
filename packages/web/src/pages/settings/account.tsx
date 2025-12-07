import React, { useState } from 'react'
import PageHead from '@/components/common/PageHead'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import {
  Pencil,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  UserCircle,
} from 'lucide-react'

/**
 * User profile interface
 */
interface UserProfile {
  name: string
  email: string
}

/**
 * Password form data interface
 */
interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Initial mock user profile data
 */
const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Admin User',
  email: 'admin@simplestock.com'
}

/** Initial empty password form */
const EMPTY_PASSWORD_FORM: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

/**
 * AccountPage Component
 *
 * A dedicated page for managing user account featuring:
 * - User Profile section with editable fields
 * - Change Password functionality
 * - Form validation for all operations
 */
const AccountPage: React.FC = () => {
  // User profile states
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE)
  const [profileForm, setProfileForm] = useState<UserProfile>(INITIAL_USER_PROFILE)
  const [isProfileEditing, setIsProfileEditing] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>(EMPTY_PASSWORD_FORM)
  const [passwordFormError, setPasswordFormError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /**
   * Handle profile form field changes
   */
  const handleProfileFormChange =
    (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (profileError) setProfileError('')
    }

  /**
   * Validate profile form
   */
  const validateProfileForm = (): boolean => {
    if (!profileForm.name.trim()) {
      setProfileError('Full name is required')
      return false
    }
    if (!profileForm.email.trim()) {
      setProfileError('Email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileForm.email)) {
      setProfileError('Please enter a valid email address')
      return false
    }
    setProfileError('')
    return true
  }

  /**
   * Save profile changes
   */
  const handleSaveProfile = () => {
    if (!validateProfileForm()) return

    setUserProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim()
    })
    setIsProfileEditing(false)
    setProfileSuccess('Profile updated successfully!')
    setTimeout(() => setProfileSuccess(''), 3000)
  }

  /**
   * Cancel profile editing
   */
  const handleCancelProfileEdit = () => {
    setProfileForm(userProfile)
    setIsProfileEditing(false)
    setProfileError('')
  }

  /**
   * Reset password form
   */
  const resetPasswordForm = () => {
    setPasswordForm(EMPTY_PASSWORD_FORM)
    setPasswordFormError('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  /**
   * Validate password form
   */
  const validatePasswordForm = (): boolean => {
    if (!passwordForm.currentPassword) {
      setPasswordFormError('Current password is required')
      return false
    }
    if (!passwordForm.newPassword) {
      setPasswordFormError('New password is required')
      return false
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFormError('New password must be at least 8 characters')
      return false
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFormError('New passwords do not match')
      return false
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordFormError('New password must be different from current password')
      return false
    }
    setPasswordFormError('')
    return true
  }

  /**
   * Handle password change
   */
  const handleChangePassword = () => {
    if (!validatePasswordForm()) return

    // Static: In real app, this would call an API
    console.log('Password change requested')
    setIsChangePasswordOpen(false)
    resetPasswordForm()
    setPasswordSuccess('Password changed successfully!')
    setTimeout(() => setPasswordSuccess(''), 3000)
  }

  /**
   * Handle password form field changes
   */
  const handlePasswordFormChange =
    (field: keyof PasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (passwordFormError) setPasswordFormError('')
    }

  /**
   * Close password dialog
   */
  const handleClosePasswordDialog = (open: boolean) => {
    setIsChangePasswordOpen(open)
    if (!open) resetPasswordForm()
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
            <UserCircle className="h-6 w-6" />
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
                  value={isProfileEditing ? profileForm.name : userProfile.name}
                  onChange={handleProfileFormChange('name')}
                  leftIcon={<User className="h-5 w-5" />}
                  disabled={!isProfileEditing}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={isProfileEditing ? profileForm.email : userProfile.email}
                  onChange={handleProfileFormChange('email')}
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={!isProfileEditing}
                />
              </div>
            </Card.Body>
            <Card.Footer>
              {isProfileEditing ? (
                <>
                  <Button variant="ghost" onClick={handleCancelProfileEdit}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Save className="h-4 w-4" />}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => setIsProfileEditing(true)}
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
                        Last changed: Never
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
                        />
                      </div>
                    </Dialog.Body>

                    <Dialog.Footer>
                      <Button
                        variant="ghost"
                        onClick={() => setIsChangePasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleChangePassword}>
                        Update Password
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