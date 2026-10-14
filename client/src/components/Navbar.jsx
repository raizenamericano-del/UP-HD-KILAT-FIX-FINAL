import { motion } from 'framer-motion';
import { Clapperboard, Link2, Settings as SettingsIcon, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../App.jsx';
import Logo from './Logo.jsx';

const PILL = {
  connected: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', text: 'Terhubung', live: true },
  reconnecting: { cls: 'border-violet-400/30 bg-violet-400/10 text-violet-300', text: 'Menghubungkan ulang…' },
  logged_out: { cls: 'border-red-400/30 bg-red-400/10 text-red-300', text: 'Keluar' },
  qr: { cls: 'border-purple-400/30 bg-purple-400/10 text-purple-200', text: 'Scan QR' },
  pairing: { cls: 'border-purple-400/30 bg-purple-400/10 text-purple-200', text: 'Kode Pairing' },
  starting: { cls: 'border-white/10 bg-white/5 text-slate-400', text: 'Memulai…' },
  connecting: { cls: 'border-white/10 bg-white/5 text-slate-300', text: 'Menghubungkan…' },
  disconnected: { cls: 'border-violet-400/30 bg-violet-400/10 text-violet-300', text: 'Terputus' },
  idle: { cls: 'border-white/10 bg-white/5 text-slate-400', text: 'Belum Terhubung' },
};

export default function Navbar() {
  const { conn, page, setPage, setSettingsOpen, cfg, socketReady } = useApp();
  const state = conn?.state || 'idle';
  const pill = PILL[state] || PILL.idle;
  const connected = state === 'connected';

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.header
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0a1c]/80 shadow-[0_12px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <button onClick={() => setPage(connected ? 'send' : 'connect')} className="transition-opacity hover:opacity-85">
            <Logo size={38} subtitle={null} />
          </button>

          <div className="flex items-center gap-2">
            {/* Tab studio */}
            <nav className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-black/40 p-1">
              <TabBtn active={page === 'connect'} onClick={() => setPage('connect')} icon={<Link2 className="h-4 w-4" />} label="Studio" alert={!connected} />
              <TabBtn active={page === 'send'} onClick={() => setPage('send')} icon={<Clapperboard className="h-4 w-4" />} label="Produksi" />
            </nav>

            {/* Status koneksi */}
            <motion.span
              layout
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold md:inline-flex ${pill.cls}`}
              title={`Status WhatsApp: ${state}`}
            >
              <span className="relative flex h-2 w-2">
                {pill.live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    connected
                      ? 'bg-emerald-400'
                      : ['reconnecting', 'connecting', 'starting'].includes(state)
                      ? 'animate-pulse bg-violet-400'
                      : 'bg-slate-500'
                  }`}
                />
              </span>
              {pill.text}
              {cfg?.mockSend && (
                <span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] font-black text-amber-300">UJI</span>
              )}
            </motion.span>

            <button
              onClick={() => setSettingsOpen(true)}
              className="btn-icon"
              title="Pengaturan"
              aria-label="Pengaturan"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* baris status tipis: socket + engine + tagline */}
        <div className="flex items-center gap-3 border-t border-white/[0.06] bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 sm:px-4">
          <span className={`inline-flex items-center gap-1 ${socketReady ? 'text-emerald-400/80' : 'text-violet-400/80'}`}>
            {socketReady ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {socketReady ? 'Server nyambung' : 'Nyambungin ke server…'}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <ShieldCheck className="h-3 w-3" /> {cfg?.engine?.name || 'Kilat Engine'}
          </span>
          <span className="ml-auto hidden sm:inline-flex">{cfg?.tagline || 'HD Sekejap Kilat'}</span>
        </div>

        {!socketReady && (
          <div className="h-0.5 w-full overflow-hidden">
            <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-purple-500 to-transparent bg-[length:200%_100%]" />
          </div>
        )}
      </motion.header>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, alert }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors sm:px-4 ${
        active ? 'text-[#180b33]' : 'text-slate-400 hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 shadow-[0_2px_16px_rgba(168,85,247,0.5)]"
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        <span className="hidden sm:inline">{label}</span>
        {alert && !active && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
      </span>
    </button>
  );
}
