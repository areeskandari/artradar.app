import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        gold: {
          50: '#fdf8ed',
          100: '#f9ecca',
          200: '#f3d78a',
          300: '#edbe4a',
          400: '#e8a821',
          500: '#c8891a',
          600: '#a86d15',
          700: '#865413',
          800: '#6a4212',
          900: '#4d3010',
        },
        ink: {
          50: '#f5f5f4',
          100: '#e8e7e5',
          200: '#d1cfcc',
          300: '#b0ada8',
          400: '#8a8680',
          500: '#6d6963',
          600: '#57534e',
          700: '#3d3a36',
          800: '#2a2825',
          900: '#1a1917',
          950: '#0f0e0d',
        },
        terracotta: {
          50: '#fdf3ee',
          100: '#fbe4d4',
          200: '#f7c6a8',
          300: '#f1a170',
          400: '#e87440',
          500: '#d4592a',
          600: '#b8431e',
          700: '#97341b',
          800: '#7a2c1c',
          900: '#62261a',
        },
        cream: '#faf8f5',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-ubuntu)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-ubuntu)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
