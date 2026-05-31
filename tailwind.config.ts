import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F9F8FF',
        coral: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Pretendard"',
          '"Noto Sans KR"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
