/// <reference types="vite/client" />

/**
 * Environment variable type declarations for Vite
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
 */
interface ImportMetaEnv {
  /** Data source mode: 'api' for backend, 'local' for localStorage demo */
  readonly VITE_DATA_SOURCE: 'api' | 'local'
  /** Vite's built-in MODE variable */
  readonly MODE: string
  /** Vite's built-in DEV flag */
  readonly DEV: boolean
  /** Vite's built-in PROD flag */
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Type declarations for vite-plugin-svgr
 * Allows importing SVG files as React components using ?react suffix
 *
 * @example
 * import Logo from './logo.svg?react'
 * <Logo className="w-6 h-6" />
 */
declare module '*.svg?react' {
  import type React from 'react'
  const SVGComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default SVGComponent
}

/**
 * Type declaration for regular SVG imports
 */
declare module '*.svg' {
  const content: string
  export default content
}