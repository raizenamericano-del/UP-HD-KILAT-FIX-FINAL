/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palet brand KilatHD "Kilat" — amber → orange → rose di atas
        // charcoal hangat. Identitas baru, beda total dari Glacier (emerald/
        // cyan/blue) maupun Molten/violet sebelumnya.
        brand: {
          DEFAULT: '#a855f7',
          300: '#c4b5fd',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
          700: '#6b21a8',
          dark: '#581c87',
        },
        // titik tengah gradien (rose) — key `iris` dipertahankan supaya
        // komponen lama tetap jalan tanpa diubah satu per satu.
        iris: { DEFAULT: '#e879f9', 400: '#e879f9', 500: '#d946ef', 600: '#a21caf' },
        // aksen amber (sukses / highlight / QR)
        accent: { DEFAULT: '#a78bfa', 300: '#fde047', 400: '#a78bfa', 500: '#eab308', 600: '#ca8a04' },
        inks: {
          950: '#070512',
          900: '#0d0a1c',
          850: '#120d26',
          800: '#191238',
          700: '#211a45',
          600: '#2b2358',
        },
        // alias (kompat komponen)
        ink: {
          950: '#070512',
          900: '#0d0a1c',
          850: '#120d26',
          800: '#191238',
          700: '#211a45',
        },
        line: 'rgba(150,120,255,0.10)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 18px 50px -18px rgba(0,0,0,0.75)',
        glow: '0 0 50px -12px rgba(168,85,247,0.55)',
        'glow-iris': '0 0 50px -12px rgba(217,70,239,0.5)',
        'glow-accent': '0 0 50px -12px rgba(250,204,21,0.45)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        glass: '0 8px 32px 0 rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(100deg, #a78bfa 0%, #a855f7 48%, #d946ef 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.55' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        gradientX: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        scan: { '0%': { transform: 'translateY(-120%)' }, '100%': { transform: 'translateY(320%)' } },
        aurora: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate3d(4%, -3%, 0) scale(1.15)', opacity: '0.85' },
        },
        morphpop: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        // Kilat: ripple api + sheen kaca
        ripple: {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(240%) skewX(-18deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        floaty: 'floaty 5.5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
        gradientX: 'gradientX 9s ease infinite',
        scan: 'scan 2.6s ease-in-out infinite',
        aurora: 'aurora 16s ease-in-out infinite',
        ripple: 'ripple 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite',
        sheen: 'sheen 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
