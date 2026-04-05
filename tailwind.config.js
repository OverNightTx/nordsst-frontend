/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'nord-slate':   '#2D4857',
        'slate-light':  '#3A5E73',
        'slate-dark':   '#1E3040',
        'teal':         '#2EB9B6',
        'teal-light':   '#45D4D1',
        'teal-dark':    '#1A8A88',
        'bg-base':      '#0B1820',
        'bg-section':   '#0F1E28',
        'bg-card':      '#152535',
        'surface':      '#1A2E3D',
        'text-primary': '#E4EDF2',
        'text-muted':   '#7A9BB0',
        'text-dim':     '#3D5F72',
        'ns-success':   '#2EB97A',
        'ns-warning':   '#F0A732',
        'ns-error':     '#E05252',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,.30)',
        md: '0 4px 12px rgba(0,0,0,.40)',
        lg: '0 8px 24px rgba(0,0,0,.50)',
        xl: '0 16px 48px rgba(0,0,0,.60)',
      },
    },
  },
  plugins: [],
}
