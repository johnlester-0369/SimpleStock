/**
 * @fileoverview Unit tests for cn (className) utility function
 * @module utils/cn.util.test
 */

import { cn } from '@/utils/cn.util'

describe('cn utility', () => {
  describe('basic functionality', () => {
    it('should return single string class unchanged', () => {
      // Arrange
      const input = 'single-class'

      // Act
      const result = cn(input)

      // Assert
      expect(result).toBe('single-class')
    })

    it('should join multiple string classes with space', () => {
      // Arrange & Act
      const result = cn('class-a', 'class-b', 'class-c')

      // Assert
      expect(result).toBe('class-a class-b class-c')
    })

    it('should return empty string when called with no arguments', () => {
      // Act
      const result = cn()

      // Assert
      expect(result).toBe('')
    })
  })

  describe('falsy value filtering', () => {
    it('should filter out false values', () => {
      // Act
      const result = cn('keep', false, 'also-keep')

      // Assert
      expect(result).toBe('keep also-keep')
    })

    it('should filter out null values', () => {
      // Act
      const result = cn('keep', null, 'also-keep')

      // Assert
      expect(result).toBe('keep also-keep')
    })

    it('should filter out undefined values', () => {
      // Act
      const result = cn('keep', undefined, 'also-keep')

      // Assert
      expect(result).toBe('keep also-keep')
    })

    it('should filter out all falsy value types together', () => {
      // Act
      const result = cn('start', false, null, 'middle', undefined, 'end')

      // Assert
      expect(result).toBe('start middle end')
    })

    it('should return empty string when all values are falsy', () => {
      // Act
      const result = cn(false, null, undefined)

      // Assert
      expect(result).toBe('')
    })
  })

  describe('conditional expressions', () => {
    it('should include class when condition is true', () => {
      // Arrange
      const isActive = true

      // Act
      const result = cn('base', isActive && 'active')

      // Assert
      expect(result).toBe('base active')
    })

    it('should exclude class when condition is false', () => {
      // Arrange
      const isActive = false

      // Act
      const result = cn('base', isActive && 'active')

      // Assert
      expect(result).toBe('base')
    })

    it('should handle multiple conditional expressions', () => {
      // Arrange
      const isActive = true
      const isDisabled = false
      const hasError = true

      // Act
      const result = cn(
        'btn',
        isActive && 'btn-active',
        isDisabled && 'btn-disabled',
        hasError && 'btn-error'
      )

      // Assert
      expect(result).toBe('btn btn-active btn-error')
    })

    it('should handle ternary expressions', () => {
      // Arrange
      const variant = 'primary'

      // Act
      const result = cn(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-secondary'
      )

      // Assert
      expect(result).toBe('btn btn-primary')
    })
  })

  describe('real-world usage patterns', () => {
    it('should work with typical component class patterns', () => {
      // Arrange
      const isLoading = true
      const customClass = 'my-custom-class'

      // Act - Use a helper function to get size classes to avoid TS narrowing
      const getSizeClass = (size: 'sm' | 'md' | 'lg') => {
        const sizeMap = {
          sm: 'text-sm px-2',
          md: 'text-base px-4',
          lg: 'text-lg px-6',
        }
        return sizeMap[size]
      }

      const result = cn(
        'button',
        'inline-flex',
        getSizeClass('lg'),
        isLoading && 'opacity-50 cursor-wait',
        customClass
      )

      // Assert
      expect(result).toBe(
        'button inline-flex text-lg px-6 opacity-50 cursor-wait my-custom-class'
      )
    })
  })
})