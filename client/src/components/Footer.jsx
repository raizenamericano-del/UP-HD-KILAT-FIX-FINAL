import { Heart } from 'lucide-react';
import { useApp } from '../App.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  const { cfg } = useApp();
  const developer = cfg?.developer?.name || 'Rifky';
  const engine = cfg?.engine?.name || 'Kilat Engine';
  return (
    <footer className="relative z-10 mt-4 border-t border-white/[0.06] bg-black/30 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <div className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-purple-200/40">
          ★&nbsp;&nbsp;end credits&nbsp;&nbsp;★
        </div>
        <Logo size={32} footer />
        <div className="mt-3 grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-1.5 text-[11px]">
          <span className="text-right font-mono font-bold uppercase tracking-widest text-slate-600">disutradarai</span>
          <span className="h-1 w-1 rounded-full bg-purple-400/60" />
          <span className="text-left font-bold text-slate-200">{developer}</span>
          <span className="text-right font-mono font-bold uppercase tracking-widest text-slate-600">mesin</span>
          <span className="h-1 w-1 rounded-full bg-purple-400/60" />
          <span className="text-left font-bold text-slate-200">{engine}</span>
          <span className="text-right font-mono font-bold uppercase tracking-widest text-slate-600">produser</span>
          <span className="h-1 w-1 rounded-full bg-purple-400/60" />
          <span className="text-left font-bold text-slate-200">kamu 🎬</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-purple-400/25 bg-purple-500/[0.07] px-3 py-1 text-[10px] font-semibold text-slate-400">
          <Heart className="h-3 w-3 text-fuchsia-400" />
          Donasi seikhlasnya via QRIS biar servernya tetep hidup
        </div>
        <div className="mt-2 max-w-xl text-[10px] leading-relaxed text-slate-600">
          Saran: pakai nomor cadangan aja, jangan nomor utama — library yang dipakai (Baileys)
          bukan resmi, jadi nomor bisa kena limit sewaktu-waktu. Dipakainya yang wajar ya.
          Semua video di sini milik masing-masing yang upload, dan cuma bisa dibuka dari
          perangkatnya sendiri.
        </div>
      </div>
    </footer>
  );
}
