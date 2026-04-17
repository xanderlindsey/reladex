import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'green-primary': '#1D9E75',
        'green-dark': '#0F6E56',
        'green-light': '#E1F5EE',
        'overdue': '#D85A30',
        'overdue-bg': '#FAECE7',
        'tier2-text': '#185FA5',
        'tier2-bg': '#E6F1FB',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
