/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Unbounded', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        // These reference CSS custom properties from tokens.css
        accent: 'var(--color-accent)',
        'accent-dim': 'var(--color-accent-dim)',
        corroborated: 'var(--color-corroborated)',
        challenged: 'var(--color-challenged)',
        'polkadot-pink': 'var(--color-polkadot-pink)',
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
        elevated: 'var(--color-bg-elevated)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
      },
      borderColor: {
        default: 'var(--color-border-default)',
        subtle: 'var(--color-border-subtle)',
        emphasis: 'var(--color-border-emphasis)',
      },
    },
  },
  plugins: [],
};
