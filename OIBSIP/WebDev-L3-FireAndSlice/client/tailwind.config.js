/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
        fire:    { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
        // Stitch cinematic palette
        'ember-glow': '#FF6B35',
        'primary-container': '#f46230',
        'primary-fixed': '#ffdbd0',
        'primary-fixed-dim': '#ffb59e',
        'on-primary': '#5e1700',
        'on-primary-fixed': '#3a0b00',
        'surface': '#161310',
        'surface-dim': '#161310',
        'surface-charcoal': '#12100E',
        'surface-elevated': '#1C1713',
        'surface-container': '#231f1c',
        'surface-container-low': '#1f1b18',
        'surface-container-lowest': '#110e0b',
        'surface-container-high': '#2d2926',
        'surface-border': '#2E2620',
        'surface-variant': '#383431',
        'on-surface': '#eae1dc',
        'on-surface-variant': '#e1bfb5',
        'crust-cream': '#FAF7F2',
        'ash-muted': '#8A8178',
        'outline': '#a98a81',
        'tertiary-fixed': '#eae2d0',
        'secondary-container': '#8d1d20',
      },
      fontFamily: {
        sans: ['Space Grotesk','system-ui','sans-serif'],
        display: ['EB Garamond','serif'],
        mono: ['Space Mono','monospace'],
      },
    },
  },
  plugins: [],
}