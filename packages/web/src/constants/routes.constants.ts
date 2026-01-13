/**
 * Application Route Constants
 *
 * Central source of truth for all route paths used throughout the application.
 * Import from this file to maintain consistency and enable easy refactoring.
 *
 * @example
 * import { ROUTES } from '@/constants/routes.constants'
 * navigate(ROUTES.DASHBOARD)
 *
 * @example
 * import { ROUTE_DASHBOARD, ROUTE_PRODUCTS } from '@/constants/routes.constants'
 * <NavLink to={ROUTE_DASHBOARD}>Dashboard</NavLink>
 */

// =============================================================================
// BASE ROUTES
// =============================================================================

/** Root/Login route */
export const ROUTE_ROOT = '/' as const

/** Dashboard route */
export const ROUTE_DASHBOARD = '/dashboard' as const

/** Products route */
export const ROUTE_PRODUCTS = '/products' as const

/** Transaction route */
export const ROUTE_TRANSACTION = '/transaction' as const

/** Report route */
export const ROUTE_REPORT = '/report' as const

// =============================================================================
// SETTINGS ROUTES
// =============================================================================

/** Settings parent route */
export const ROUTE_SETTINGS = '/settings' as const

/** Account settings route */
export const ROUTE_SETTINGS_ACCOUNT = '/settings/account' as const

/** Supplier management route */
export const ROUTE_SETTINGS_SUPPLIER = '/settings/supplier' as const

// =============================================================================
// ROUTE WITH QUERY PARAMS
// =============================================================================

/** Products page with low-stock filter */
export const ROUTE_PRODUCTS_LOW_STOCK = '/products?filter=low-stock' as const

// =============================================================================
// GROUPED EXPORTS
// =============================================================================

/**
 * All application routes as a structured object
 * Useful for iteration and structured access
 */
export const ROUTES = {
  ROOT: ROUTE_ROOT,
  DASHBOARD: ROUTE_DASHBOARD,
  PRODUCTS: ROUTE_PRODUCTS,
  TRANSACTION: ROUTE_TRANSACTION,
  REPORT: ROUTE_REPORT,
  SETTINGS: {
    ROOT: ROUTE_SETTINGS,
    ACCOUNT: ROUTE_SETTINGS_ACCOUNT,
    SUPPLIER: ROUTE_SETTINGS_SUPPLIER,
  },
  /** Routes with query parameters */
  WITH_PARAMS: {
    PRODUCTS_LOW_STOCK: ROUTE_PRODUCTS_LOW_STOCK,
  },
} as const

/**
 * Type representing all valid route paths
 */
export type AppRoute =
  | typeof ROUTE_ROOT
  | typeof ROUTE_DASHBOARD
  | typeof ROUTE_PRODUCTS
  | typeof ROUTE_TRANSACTION
  | typeof ROUTE_REPORT
  | typeof ROUTE_SETTINGS
  | typeof ROUTE_SETTINGS_ACCOUNT
  | typeof ROUTE_SETTINGS_SUPPLIER

/**
 * Type representing routes with query parameters
 */
export type AppRouteWithParams = typeof ROUTE_PRODUCTS_LOW_STOCK