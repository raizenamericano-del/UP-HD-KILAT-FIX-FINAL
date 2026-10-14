import { motion } from 'framer-motion';

const STEPS = ['Nyiapin engine', 'Nyiapin pipeline', 'Ngecek koneksi'];

/** Splash Kilat Studio — petir nyamber + kilat layar + teks reveal */
export default function Splash() {
  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-[#070512]"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* glow badai */}
      <motion.div
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-purple-600/25 blur-[130px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-blueprint opacity-60" />
      {/* kilat layar */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#ede9fe]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0, 0.35, 0] }}
        transition={{ duration: 0.55, times: [0, 0.25, 0.45, 0.7, 1], delay: 0.45 }}
      />

      <div className="relative flex w-[19rem] flex-col items-center">
        {/* petir */}
        <motion.svg
          viewBox="0 0 64 80"
          className="h-24 w-20"
          style={{ filter: 'drop-shadow(0 0 22px rgba(253,224,71,0.65))' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 14 }}
          aria-hidden
        >
          <defs>
            <linearGradient id="splashbolt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fefce8" />
              <stop offset="0.5" stopColor="#fde047" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <motion.path
            d="M38 2 10 46h14l-4 32 34-50H38l8-26z"
            fill="url(#splashbolt)"
            stroke="#fefce8"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          />
        </motion.svg>

        {/* nama */}
        <div className="mt-3 flex overflow-hidden">
          {'KILAT'.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: 34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.06, type: 'spring', stiffness: 320, damping: 20 }}
              className="font-display text-4xl font-black tracking-[0.12em] text-white headline-glow"
            >
              {ch}
            </motion.span>
          ))}
          <motion.span
            initial={{ y: 34, opacity: 0, rotate: -8 }}
            animate={{ y: 0, opacity: 1, rotate: -3 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 320, damping: 16 }}
            className="ml-2 mt-1 inline-flex h-fit items-center rounded-md bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 px-2 py-0.5 font-display text-lg font-black text-[#180b33]"
          >
            HD
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-purple-200/50"
        >
          studio petir
        </motion.div>

        {/* progress */}
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-500 to-yellow-300"
            initial={{ width: '4%' }}
            animate={{ width: '96%' }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
        </div>

        {/* langkah */}
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.4 }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-purple-100/70"
            >
              {s}
            </motion.span>
          ))}
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-purple-100/30">
          oleh Rifky
        </p>
      </div>
    </motion.div>
  );
}
