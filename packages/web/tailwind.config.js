export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* core semantic colors (use <alpha-value> for Tailwind opacity support) */
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        /* backgrounds - now properly hierarchical */
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'surface-1': 'rgb(var(--color-surface-1) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        'surface-hover-1': 'rgb(var(--color-surface-hover-1) / <alpha-value>)',
        'surface-hover-2': 'rgb(var(--color-surface-hover-2) / <alpha-value>)',
        /* text / headings */
        text: 'rgb(var(--color-text) / <alpha-value>)',
        headline: 'rgb(var(--color-headline) / <alpha-value>)',
        /* UI elements */
        border: 'rgb(var(--color-border) / <alpha-value>)',
        divider: 'rgb(var(--color-divider) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        /* feedback */
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'soft-md':
          '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg':
          '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'soft-xl':
          '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
      },
    },
  },
}
