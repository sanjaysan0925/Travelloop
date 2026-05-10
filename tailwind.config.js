/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base:     'var(--bg-base)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        sig:      'var(--sig)',
        'sig-dim': 'var(--sig-dim)',
        border:   'var(--border)',
        primary:  'var(--text-primary)',
        secondary:'var(--text-secondary)',
        muted:    'var(--text-muted)',
        success:  'var(--success)',
        danger:   'var(--danger)',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sig-glow': '0 0 24px var(--sig-glow)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
