/**
 * Local Storage Utility
 *
 * Type-safe wrapper around localStorage with JSON serialization.
 * Handles errors gracefully and provides default values.
 *
 * @module lib/local-storage/storage.util
 */

/** Prefix for all demo storage keys to avoid conflicts */
const STORAGE_PREFIX = 'simplestock_demo_'

/**
 * Storage keys used by the demo mode
 */
export const STORAGE_KEYS = {
  AUTH_SESSION: `${STORAGE_PREFIX}auth_session`,
  AUTH_USER: `${STORAGE_PREFIX}auth_user`,
  PRODUCTS: `${STORAGE_PREFIX}products`,
  SUPPLIERS: `${STORAGE_PREFIX}suppliers`,
  TRANSACTIONS: `${STORAGE_PREFIX}transactions`,
} as const

/**
 * Gets an item from localStorage with JSON parsing.
 *
 * @typeParam T - Expected type of stored data
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or on error
 * @returns Parsed value or default
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Failed to get storage item "${key}":`, error)
    return defaultValue
  }
}

/**
 * Sets an item in localStorage with JSON serialization.
 *
 * @typeParam T - Type of data to store
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful, false on error
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error)
    return false
  }
}

/**
 * Removes an item from localStorage.
 *
 * @param key - Storage key to remove
 * @returns True if successful, false on error
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Failed to remove storage item "${key}":`, error)
    return false
  }
}

/**
 * Clears all demo storage items.
 *
 * @returns True if successful, false on error
 */
export function clearDemoStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Failed to clear demo storage:', error)
    return false
  }
}

/**
 * Generates a unique ID using crypto.randomUUID().
 *
 * @returns A UUID string
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Gets current ISO timestamp.
 *
 * @returns ISO date string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}