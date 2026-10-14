import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, Copy, Info, XCircle } from 'lucide-react';

const STYLE = {
  success: { icon: <CheckCircle2 className="h-5 w-5" />, tag: 'TAKE BAGUS', spine: 'bg-emerald-400', text: 'text-emerald-300', bar: 'bg-emerald-400' },
  error: { icon: <XCircle className="h-5 w-5" />, tag: 'CUT! GAGAL', spine: 'bg-red-400', text: 'text-red-300', bar: 'bg-red-400' },
  warn: { icon: <AlertTriangle className="h-5 w-5" />, tag: 'PERHATIAN', spine: 'bg-amber-400', text: 'text-amber-300', bar: 'bg-amber-400' },
  info: { icon: <Info className="h-5 w-5" />, tag: 'INFO KRU', spine: 'bg-purple-400', text: 'text-purple-200', bar: 'bg-purple-400' },
};

function DetailBox({ text }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) { /* noop */ }
  };
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-300 transition-colors hover:bg-white/[0.08]"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? 'Sembunyikan log' : 'Lihat log teknis'}
      </button>
      {open && (
        <div className="mt-1.5 rounded-lg border border-white/[0.07] bg-black/40 p-2">
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[9.5px] leading-snug text-slate-400">{text}</pre>
          <button
            onClick={copy}
            className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-300 hover:bg-white/[0.06]"
          >
            <Copy className="h-3 w-3" />{copied ? 'Kecopy!' : 'Copy log'}
          </button>
        </div>
      )}
    </div>
  );
}

/** Toast "cue card" sutradara (kanan atas) */
export default function Toasts({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[min(92vw,380px)] flex-col gap-2 sm:right-4 sm:top-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = STYLE[t.type] || STYLE.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 bg-[#0f0b22]/95 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <div className="flex h-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className={`h-full flex-1 ${i % 2 ? 'bg-purple-100/80' : 'bg-[#070512]'}`} />
                ))}
              </div>
              <div className="flex items-start gap-3 p-3.5 pt-3">
                <span className={`mt-0.5 h-10 w-1 shrink-0 rounded-full ${s.spine}`} />
                <div className={`mt-0.5 shrink-0 ${s.text}`}>{s.icon}</div>
                <div className="min-w-0">
                  <div className={`font-mono text-[8.5px] font-black tracking-[0.25em] ${s.text}`}>{s.tag}</div>
                  <div className="mt-0.5 text-xs font-extrabold text-white">{t.title}</div>
                  {t.message && <div className="mt-0.5 text-[11px] leading-relaxed text-slate-300/90">{t.message}</div>}
                  {t.hint && <div className="mt-1 text-[10px] leading-relaxed text-violet-300/90">💡 {t.hint}</div>}
                  {t.detail && <DetailBox text={t.detail} />}
                </div>
              </div>
              <motion.span
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: t.detail ? 20 : 6, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${s.bar}`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
