/**
 * @fileoverview Unit tests for validation utilities
 * @module utils/validation.util.test
 */

import { z, ZodError } from 'zod'
import {
  validateForm,
  formatZodErrors,
  safeParse,
  emailSchema,
  requiredString,
  optionalString,
  positiveNumber,
  nonNegativeInteger,
  positiveInteger,
  loginSchema,
  productSchema,
  createSellProductSchema,
  userProfileSchema,
  passwordChangeSchema,
  supplierSchema,
  type LoginFormData,
  type ProductFormData,
  type PasswordChangeFormData,
  type SupplierFormData,
} from '@/utils/validation.util'

describe('validateForm', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().positive('Age must be positive'),
  })

  it('should return success with data for valid input', () => {
    // Arrange
    const validData = { name: 'John', age: 25 }

    // Act
    const result = validateForm(testSchema, validData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toEqual(validData)
    expect(result.error).toBeUndefined()
    expect(result.errors).toBeUndefined()
  })

  it('should return error with first message for invalid input', () => {
    // Arrange
    const invalidData = { name: '', age: 25 }

    // Act
    const result = validateForm(testSchema, invalidData)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBe('Name is required')
    expect(result.errors).toBeDefined()
  })

  it('should return errors record mapping fields to messages', () => {
    // Arrange
    const invalidData = { name: '', age: -5 }

    // Act
    const result = validateForm(testSchema, invalidData)

    // Assert
    expect(result.success).toBe(false)
    expect(result.errors).toEqual({
      name: 'Name is required',
      age: 'Age must be positive',
    })
  })

  it('should handle non-Zod errors gracefully', () => {
    // Arrange
    const throwingSchema = z.string().transform(() => {
      throw new Error('Non-Zod error')
    })

    // Act
    const result = validateForm(throwingSchema, 'test')

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBe('Validation failed')
  })
})

describe('formatZodErrors', () => {
  it('should format single field error', () => {
    // Arrange
    const schema = z.object({ email: z.string().email() })
    let zodError: ZodError | null = null
    try {
      schema.parse({ email: 'invalid' })
    } catch (e) {
      zodError = e as ZodError
    }

    // Act
    const result = formatZodErrors(zodError!)

    // Assert
    expect(result).toHaveProperty('email')
    expect(typeof result.email).toBe('string')
  })

  it('should format multiple field errors', () => {
    // Arrange
    const schema = z.object({
      email: z.string().email('Invalid email'),
      password: z.string().min(8, 'Password too short'),
    })
    let zodError: ZodError | null = null
    try {
      schema.parse({ email: 'bad', password: '123' })
    } catch (e) {
      zodError = e as ZodError
    }

    // Act
    const result = formatZodErrors(zodError!)

    // Assert
    expect(result).toHaveProperty('email', 'Invalid email')
    expect(result).toHaveProperty('password', 'Password too short')
  })

  it('should format nested paths with dot notation', () => {
    // Arrange
    const schema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string().min(1, 'Name required'),
        }),
      }),
    })
    let zodError: ZodError | null = null
    try {
      schema.parse({ user: { profile: { name: '' } } })
    } catch (e) {
      zodError = e as ZodError
    }
    const result = formatZodErrors(zodError!)

    // Assert
    expect(result).toHaveProperty('user.profile.name', 'Name required')
  })

  it('should use "root" for path-less errors', () => {
    // Arrange
    const schema = z.string().min(1, 'Root error')
    let zodError: ZodError | null = null
    try {
      schema.parse('')
    } catch (e) {
      zodError = e as ZodError
    }

    // Act
    const result = formatZodErrors(zodError!)

    // Assert
    expect(result).toHaveProperty('root', 'Root error')
  })

  it('should keep only first error per field', () => {
    // Arrange
    const schema = z.object({
      password: z.string().min(8, 'Too short').regex(/[A-Z]/, 'Need uppercase'),
    })
    let zodError: ZodError | null = null
    try {
      schema.parse({ password: 'ab' })
    } catch (e) {
      zodError = e as ZodError
    }

    // Act
    const result = formatZodErrors(zodError!)

    // Assert
    expect(result.password).toBe('Too short')
    expect(Object.keys(result).filter((k) => k === 'password')).toHaveLength(1)
  })
})

describe('safeParse', () => {
  const schema = z.object({ value: z.number() })

  it('should return parsed data on success', () => {
    // Arrange
    const validData = { value: 42 }

    // Act
    const result = safeParse(schema, validData)

    // Assert
    expect(result).toEqual({ value: 42 })
  })

  it('should return undefined on failure', () => {
    // Arrange
    const invalidData = { value: 'not a number' }

    // Act
    const result = safeParse(schema, invalidData)

    // Assert
    expect(result).toBeUndefined()
  })
})

describe('Schema validators', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      // Act & Assert
      expect(() => emailSchema.parse('test@example.com')).not.toThrow()
      expect(() => emailSchema.parse('user.name+tag@domain.co.uk')).not.toThrow()
    })

    it('should reject invalid email format', () => {
      // Act & Assert
      expect(() => emailSchema.parse('invalid')).toThrow()
      expect(() => emailSchema.parse('missing@')).toThrow()
      expect(() => emailSchema.parse('@nodomain.com')).toThrow()
    })

    it('should reject empty string with custom message', () => {
      // Act
      const result = emailSchema.safeParse('')

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required')
      }
    })
  })

  describe('requiredString', () => {
    it('should accept non-empty string', () => {
      // Arrange
      const nameSchema = requiredString('Full name')

      // Act & Assert
      expect(() => nameSchema.parse('John Doe')).not.toThrow()
    })

    it('should reject empty string with field name in message', () => {
      // Arrange
      const nameSchema = requiredString('Full name')

      // Act
      const result = nameSchema.safeParse('')

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Full name is required')
      }
    })
  })

  describe('optionalString', () => {
    it('should accept string value', () => {
      // Act
      const result = optionalString.parse('value')

      // Assert
      expect(result).toBe('value')
    })

    it('should default to empty string for undefined', () => {
      // Act
      const result = optionalString.parse(undefined)

      // Assert
      expect(result).toBe('')
    })
  })

  describe('positiveNumber', () => {
    const priceSchema = positiveNumber('Price')

    it('should accept positive numbers', () => {
      // Act & Assert
      expect(() => priceSchema.parse(10)).not.toThrow()
      expect(() => priceSchema.parse(0.01)).not.toThrow()
      expect(() => priceSchema.parse(999999)).not.toThrow()
    })

    it('should reject zero', () => {
      // Act
      const result = priceSchema.safeParse(0)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject negative numbers', () => {
      // Act
      const result = priceSchema.safeParse(-5)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should coerce string to number', () => {
      // Act
      const result = priceSchema.safeParse('10.5')

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(10.5)
      }
    })

    it('should reject non-numeric string', () => {
      // Act
      const result = priceSchema.safeParse('abc')

      // Assert
      expect(result.success).toBe(false)
    })
  })

  describe('nonNegativeInteger', () => {
    const stockSchema = nonNegativeInteger('Stock')

    it('should accept zero', () => {
      // Act & Assert
      expect(() => stockSchema.parse(0)).not.toThrow()
    })

    it('should accept positive integers', () => {
      // Act & Assert
      expect(() => stockSchema.parse(100)).not.toThrow()
    })

    it('should reject negative numbers', () => {
      // Act
      const result = stockSchema.safeParse(-1)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject non-integers', () => {
      // Act
      const result = stockSchema.safeParse(1.5)

      // Assert
      expect(result.success).toBe(false)
    })
  })

  describe('positiveInteger', () => {
    const quantitySchema = positiveInteger('Quantity')

    it('should accept positive integers', () => {
      // Act & Assert
      expect(() => quantitySchema.parse(1)).not.toThrow()
      expect(() => quantitySchema.parse(100)).not.toThrow()
    })

    it('should reject zero', () => {
      // Act
      const result = quantitySchema.safeParse(0)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject decimals', () => {
      // Act
      const result = quantitySchema.safeParse(1.5)

      // Assert
      expect(result.success).toBe(false)
    })
  })
})

describe('Form schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      // Arrange
      const validData: LoginFormData = {
        email: 'user@example.com',
        password: 'password123',
      }

      // Act & Assert
      expect(() => loginSchema.parse(validData)).not.toThrow()
    })

    it('should reject missing email', () => {
      // Act
      const result = loginSchema.safeParse({ password: 'password123' })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      // Act
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      // Act
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })
  })

  describe('productSchema', () => {
    it('should accept valid product data', () => {
      // Arrange
      const validData: ProductFormData = {
        name: 'Test Product',
        price: 29.99,
        stockQuantity: 100,
        supplier: 'Test Supplier',
      }

      // Act & Assert
      expect(() => productSchema.parse(validData)).not.toThrow()
    })

    it('should reject empty product name', () => {
      // Act
      const result = productSchema.safeParse({
        name: '',
        price: 10,
        stockQuantity: 5,
        supplier: 'Supplier',
      })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject zero price', () => {
      // Act
      const result = productSchema.safeParse({
        name: 'Product',
        price: 0,
        stockQuantity: 5,
        supplier: 'Supplier',
      })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject negative stock quantity', () => {
      // Act
      const result = productSchema.safeParse({
        name: 'Product',
        price: 10,
        stockQuantity: -1,
        supplier: 'Supplier',
      })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject whitespace-only supplier', () => {
      // Act
      const result = productSchema.safeParse({
        name: 'Product',
        price: 10,
        stockQuantity: 5,
        supplier: '   ',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please select a supplier')
      }
    })
  })

  describe('createSellProductSchema', () => {
    it('should accept quantity within available stock', () => {
      // Arrange
      const sellSchema = createSellProductSchema(10)

      // Act & Assert
      expect(() => sellSchema.parse({ quantity: 5 })).not.toThrow()
      expect(() => sellSchema.parse({ quantity: 10 })).not.toThrow()
    })

    it('should reject quantity exceeding stock', () => {
      // Arrange
      const sellSchema = createSellProductSchema(10)

      // Act
      const result = sellSchema.safeParse({ quantity: 15 })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Insufficient stock. Only 10 available.'
        )
      }
    })

    it('should reject zero quantity', () => {
      // Arrange
      const sellSchema = createSellProductSchema(10)

      // Act
      const result = sellSchema.safeParse({ quantity: 0 })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject non-integer quantity', () => {
      // Arrange
      const sellSchema = createSellProductSchema(10)

      // Act
      const result = sellSchema.safeParse({ quantity: 2.5 })

      // Assert
      expect(result.success).toBe(false)
    })
  })

  describe('userProfileSchema', () => {
    it('should accept valid profile data', () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      // Act & Assert
      expect(() => userProfileSchema.parse(validData)).not.toThrow()
    })

    it('should reject empty name', () => {
      // Act
      const result = userProfileSchema.safeParse({
        name: '',
        email: 'john@example.com',
      })

      // Assert
      expect(result.success).toBe(false)
    })
  })

  describe('passwordChangeSchema', () => {
    it('should accept valid password change data', () => {
      // Arrange
      const validData: PasswordChangeFormData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      }

      // Act & Assert
      expect(() => passwordChangeSchema.parse(validData)).not.toThrow()
    })

    it('should reject when passwords do not match', () => {
      // Act
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmError = result.error.issues.find((i) =>
          i.path.includes('confirmPassword')
        )
        expect(confirmError?.message).toBe('New passwords do not match')
      }
    })

    it('should reject when new password equals current password', () => {
      // Act
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'samepassword',
        newPassword: 'samepassword',
        confirmPassword: 'samepassword',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        const newPassError = result.error.issues.find((i) =>
          i.path.includes('newPassword')
        )
        expect(newPassError?.message).toBe(
          'New password must be different from current password'
        )
      }
    })

    it('should reject new password shorter than 8 characters', () => {
      // Act
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'short',
        confirmPassword: 'short',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'New password must be at least 8 characters'
        )
      }
    })
  })

  describe('supplierSchema', () => {
    it('should accept valid supplier data', () => {
      // Arrange
      const validData: SupplierFormData = {
        name: 'Acme Corp',
        contactPerson: 'John Smith',
        email: 'john@acme.com',
        phone: '555-1234',
        address: '123 Main St',
      }

      // Act & Assert
      expect(() => supplierSchema.parse(validData)).not.toThrow()
    })

    it('should accept supplier without address', () => {
      // Arrange
      const validData = {
        name: 'Acme Corp',
        contactPerson: 'John Smith',
        email: 'john@acme.com',
        phone: '555-1234',
      }

      // Act
      const result = supplierSchema.parse(validData)

      // Assert
      expect(result.address).toBe('')
    })

    it('should reject missing required fields', () => {
      // Act
      const result = supplierSchema.safeParse({
        name: 'Acme Corp',
        // missing contactPerson, email, phone
      })

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      // Act
      const result = supplierSchema.safeParse({
        name: 'Acme Corp',
        contactPerson: 'John Smith',
        email: 'invalid-email',
        phone: '555-1234',
      })

      // Assert
      expect(result.success).toBe(false)
    })
  })
})