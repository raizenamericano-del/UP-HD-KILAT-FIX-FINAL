import { motion } from 'framer-motion';

/**
 * Logo Kilat Studio — petir dalam cincin orbit (inline SVG, oleh Rifky).
 * Gaya: badge energi neon, ungu elektrik + fuchsia + inti kuning petir.
 */
export function StudioMark({ size = 46, className = '', animate = true }) {
  const Ring = animate ? motion.g : 'g';
  const ringProps = animate
    ? { animate: { rotate: -360 }, transition: { duration: 18, repeat: Infinity, ease: 'linear' }, style: { originX: '50%', originY: '50%' } }
    : {};
  const Pulse = animate ? motion.path : 'path';
  const pulseProps = animate
    ? { animate: { opacity: [1, 0.55, 1] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }
    : {};
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <linearGradient id="kilatmark" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="kilatcore" x1="20" y1="6" x2="44" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fefce8" />
          <stop offset="0.55" stopColor="#fde047" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#0d0a1c" stroke="#2a1f4d" strokeWidth="2.5" />
      <Ring {...ringProps}>
        <circle cx="32" cy="32" r="24" stroke="url(#kilatmark)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="34 18 8 18" opacity="0.9" />
      </Ring>
      <Pulse d="M38 10 20 36h11l-3 18 20-29H35l3-15z" fill="url(#kilatmark)" {...pulseProps} />
      <path d="M36.5 15 25 35h8l-2 12 14-21h-8.5l3-11z" fill="url(#kilatcore)" />
    </svg>
  );
}

export default function Logo({ size = 46, showText = true, glow = true, subtitle = 'STUDIO PETIR · oleh Rifky', footer = false }) {
  return (
    <div className="flex select-none items-center gap-3">
      <motion.div
        whileHover={{ rotate: -6, scale: 1.07 }}
        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
        className="relative"
        style={{ width: size, height: size, filter: glow ? 'drop-shadow(0 0 14px rgba(168,85,247,0.55))' : 'none' }}
      >
        <StudioMark size={size} />
      </motion.div>

      {showText && (
        <div className="leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-black tracking-tight text-white ${footer ? 'text-[15px]' : 'text-[19px]'}`}>
              KILAT
            </span>
            <span className="inline-flex -rotate-3 items-center rounded-md bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 px-1.5 py-0.5 font-display text-[12px] font-black tracking-tight text-[#180b33] shadow-[0_2px_12px_rgba(168,85,247,0.55)]">
              HD
            </span>
          </div>
          {subtitle && (
            <div className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.3em] text-purple-200/40">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
}

/** Badge kompak nama engine */
export function EngineBadge({ className = '' }) {
  return (
    <span className={`pill border-purple-400/25 bg-purple-500/[0.08] text-purple-200 ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-400" />
      </span>
      Kilat Engine
    </span>
  );
}
