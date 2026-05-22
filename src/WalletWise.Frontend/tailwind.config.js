/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RGB channel vars — supports opacity modifiers like bg-primary/10
        'background':                'rgb(var(--color-bg) / <alpha-value>)',
        'surface':                   'rgb(var(--color-surface) / <alpha-value>)',
        'surface-container-lowest':  'rgb(var(--color-sc-lowest) / <alpha-value>)',
        'surface-container-low':     'rgb(var(--color-sc-low) / <alpha-value>)',
        'surface-container':         'rgb(var(--color-sc) / <alpha-value>)',
        'surface-container-high':    'rgb(var(--color-sc-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--color-sc-highest) / <alpha-value>)',
        'on-surface':                'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant':        'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'outline':                   'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant':           'rgb(var(--color-outline-variant) / <alpha-value>)',
        'primary':                   'rgb(var(--color-primary) / <alpha-value>)',
        'on-primary':                'rgb(var(--color-on-primary) / <alpha-value>)',
        'secondary':                 'rgb(var(--color-secondary) / <alpha-value>)',
        'on-secondary':              'rgb(var(--color-on-secondary) / <alpha-value>)',
        'error':                     'rgb(var(--color-error) / <alpha-value>)',
        'on-error':                  'rgb(var(--color-on-error) / <alpha-value>)',
        'accent':                    'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
