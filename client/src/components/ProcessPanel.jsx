import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Cpu, Film, Loader2, Send, Sparkles, UploadCloud, X } from 'lucide-react';

const STAGES = [
  { id: 'upload', label: 'Upload', icon: <UploadCloud className="h-4 w-4" /> },
  { id: 'compress', label: 'Encode HD', icon: <Cpu className="h-4 w-4" /> },
  { id: 'send', label: 'Kirim', icon: <Send className="h-4 w-4" /> },
  { id: 'done', label: 'Beres', icon: <Check className="h-4 w-4" /> },
];

const MSGS = [
  'Nyiapin file & metadata…',
  'Scaling LANCZOS biar tetep tajem…',
  'Normalisasi warna (BT.709)…',
  'Nyetel bitrate & GOP…',
  'Anti-banding buat scene gelap…',
  'Beresin audio (EBU R128)…',
  'Lagi diproses ke HD…',
  'Dikit lagi…',
];

const TITLES = ['Nyiapin proses…', 'Lagi encode HD', 'Lagi ngirim ke WhatsApp', 'Beres!'];

/** Panel proses Kilat Studio: monitor + visualizer + timeline + terminal log */
export default function ProcessPanel({ stage = 0, progress = {}, plan, targets = 1, logs = [], onCancel }) {
  const twoPass = !!plan?.twoPass;
  const [msgIdx, setMsgIdx] = useState(0);
  const percent = Math.round(progress.percent || 0);
  const indeterminate = percent <= 0 || stage === 2;
  const encoding = stage === 1;

  useEffect(() => {
    if (stage !== 1) return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MSGS.length), 2400);
    return () => clearInterval(t);
  }, [stage]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="g-frame">
      <div className="g-frame-inner p-6 sm:p-8">
        {/* header monitor */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-md bg-fuchsia-500/15 px-2 py-1 font-mono text-[10px] font-black tracking-widest text-fuchsia-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-500" /> REC
            </span>
            <h3 className="font-display text-base font-extrabold text-white sm:text-lg">
              {TITLES[Math.min(stage, 3)]}
            </h3>
          </div>
          {plan && <span className="chip shrink-0 border-purple-400/25 bg-purple-500/10 text-purple-200">{plan.profileLabel}</span>}
        </div>

        {/* angka gede + bar */}
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-500">
            <Film className="h-4 w-4 text-purple-400/70" />
            {twoPass ? `PASS ${progress.pass || 1}/2` : (plan?.modeLabel || 'ENCODE').toUpperCase()}
          </div>
          <div className="relative">
            <svg className="reactor" viewBox="0 0 100 100" fill="none" aria-hidden>
              <circle cx="50" cy="50" r="46" stroke="#a855f7" strokeWidth="2" strokeDasharray="14 10 4 10" opacity="0.8" />
            </svg>
            <svg className="reactor-rev" viewBox="0 0 100 100" fill="none" aria-hidden>
              <circle cx="50" cy="50" r="46" stroke="#d946ef" strokeWidth="1.5" strokeDasharray="6 14" />
            </svg>
            <div className="font-display px-4 py-2 text-5xl font-black tabular-nums text-white headline-glow sm:text-6xl">
              {indeterminate ? <span className="text-slate-600">––</span> : percent}
              <span className="text-xl text-slate-500">%</span>
            </div>
          </div>
        </div>
        <div className="relative mt-3 h-3.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
          <motion.div
            className="beam-bar absolute inset-y-0 left-0 rounded-full"
            initial={false}
            animate={{ width: `${indeterminate ? 100 : percent}%`, opacity: indeterminate ? 0.35 : 1 }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
          />
          {!indeterminate && (
            <div className="absolute inset-y-0 left-0 w-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent bg-[length:200%_100%]" />
          )}
        </div>

        {/* visualizer + pantulan */}
        <div className="mt-3 flex h-10 items-stretch gap-[3px]" aria-hidden>
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="vbar"
              style={{
                animationDuration: `${0.45 + ((i * 37) % 55) / 100}s`,
                animationDelay: `${-((i * 53) % 100) / 100}s`,
                animationPlayState: encoding ? 'running' : 'paused',
                opacity: encoding ? 1 : 0.25,
              }}
            />
          ))}
        </div>
        <div className="flex h-5 scale-y-[-1] items-stretch gap-[3px] opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" aria-hidden>
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="vbar"
              style={{
                animationDuration: `${0.45 + ((i * 37) % 55) / 100}s`,
                animationDelay: `${-((i * 53) % 100) / 100}s`,
                animationPlayState: encoding ? 'running' : 'paused',
              }}
            />
          ))}
        </div>

        {/* pesan berjalan */}
        <div className="mt-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="text-xs font-semibold text-purple-100/80"
            >
              {stage === 1 ? MSGS[msgIdx] : stage === 2 ? 'Ngupload media ke server WhatsApp…' : 'Nyiapin…'}
            </motion.div>
          </AnimatePresence>
          {progress.note && <div className="mt-1 text-[11px] text-violet-300">{progress.note}</div>}

          {progress.retry && (
            <div className="mx-auto mt-2 max-w-md rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-2.5 text-left">
              <div className="text-[11px] font-extrabold text-amber-300">
                🔁 Coba ulang otomatis — percobaan {progress.retry.attempt}/{progress.retry.total} ({progress.retry.name})
              </div>
              <div className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
                Pengaturan utama tidak cocok untuk video ini, engine beralih ke pengaturan yang lebih hemat
                {progress.retry.width ? ` (${progress.retry.width}×${progress.retry.height})` : ''} —
                hasilnya tetap HD, cuma prosesnya beda. Jangan tutup halaman ya.
              </div>
            </div>
          )}

          {progress.heartbeat && !progress.retry && progress.idleSec >= 10 && (
            <div className="mt-1 text-[11px] text-slate-400">
              ⏳ Server masih ng-encode ({progress.idleSec}s tanpa frame baru) — video berat memang butuh waktu.
            </div>
          )}
        </div>

        {/* metrik */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Kecepatan" value={progress.speed ? `${progress.speed}×` : '—'} />
          <Stat label="FPS" value={progress.fps || '—'} />
          <Stat label="Sisa waktu" value={fmtEta(progress.etaSec)} />
          <Stat label="Tujuan" value={`${targets} nomor`} />
        </div>

        {/* timeline */}
        <div className="mt-6 flex items-start">
          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div key={s.id} className="flex flex-1 items-start last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                      done
                        ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                        : active
                        ? 'border-purple-400 bg-purple-500/20 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.5)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-600'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : s.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${done || active ? 'text-purple-100/80' : 'text-slate-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="mx-1 mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500"
                      initial={false}
                      animate={{ width: done ? '100%' : active ? '50%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* terminal log */}
        {logs?.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.07] bg-black/60">
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500/70" />
              <span className="h-2 w-2 rounded-full bg-violet-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">engine.log</span>
            </div>
            <div className="max-h-28 overflow-hidden p-3 font-mono text-[10px] leading-relaxed text-slate-500">
              {logs.slice(-5).map((l, i, arr) => (
                <div key={i} className={i === arr.length - 1 ? 'text-purple-100' : ''}>
                  <span className="text-purple-400">›</span> {l}
                  {i === arr.length - 1 && <span className="caret ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-purple-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-wipe mt-6 w-full" onClick={onCancel}>
          <X className="relative z-10 h-4 w-4" /> <span className="relative z-10">Batalin aja</span>
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-500">
          <Sparkles className="h-3 w-3 text-purple-400" /> Mohon jangan menutup tab ini agar proses tidak terputus.
        </p>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/40 px-2 py-2.5 text-center">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-bold text-purple-50">{value}</div>
    </div>
  );
}

function fmtEta(sec) {
  if (sec == null || !isFinite(sec)) return '—';
  if (sec < 60) return `${Math.ceil(sec)} dtk`;
  return `${Math.floor(sec / 60)} mnt ${Math.ceil(sec % 60)} dtk`;
}
