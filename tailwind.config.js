/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030712',
          900: '#090d16',
          800: '#0d1117',
          700: '#111827',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 20% 25%, rgba(99,102,241,0.08) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(6,182,212,0.06) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(3,7,18,1) 0px, transparent 100%)',
        'cyber-grid': 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '48px 48px',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.08)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.15), 0 0 60px rgba(6,182,212,0.08)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.15)',
        'glow-rose': '0 0 20px rgba(244,63,94,0.15)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 0 80px rgba(99,102,241,0.1)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
