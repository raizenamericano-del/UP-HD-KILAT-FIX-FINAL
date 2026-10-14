import { motion } from 'framer-motion';
import { ArrowRight, CheckCheck, Clapperboard, Download, Loader2, RefreshCw, Send, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../App.jsx';
import { downloadVideo, withKey } from '../lib/api.js';

/** Kartu sukses Kilat Studio: premiere stamp + tiket + langkah forward */
export default function SuccessCard({ result, onReset, onResend }) {
  const meta = result?.meta || {};
  const { addToast } = useApp();
  const [dlBusy, setDlBusy] = useState(false);

  const doDownload = async () => {
    const url = meta.downloadUrl || (result?.entryId ? withKey(`/api/download/${result.entryId}`, result?.accessToken) : null);
    if (!url) return;
    setDlBusy(true);
    try {
      await downloadVideo(url);
    } catch (e) {
      addToast('error', 'Download gagal', e?.message || 'File-nya ga ketemu di server.');
    } finally {
      setDlBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 190, damping: 20 }}
      className="g-frame"
    >
      <div className="g-frame-inner p-6 text-center sm:p-9">
        {/* centang ke-gambar sendiri + stempel */}
        <div className="relative mx-auto h-28 w-28">
          <span aria-hidden className="shock-ring" />
          <span aria-hidden className="shock-ring" style={{ animationDelay: '0.5s' }} />
          <span aria-hidden className="shock-ring" style={{ animationDelay: '1s', borderColor: 'rgba(217,70,239,0.7)' }} />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-purple-500/25"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
          <svg className="draw-check absolute inset-0 h-full w-full" viewBox="0 0 112 112" fill="none">
            <defs>
              <linearGradient id="checkgrad" x1="0" y1="0" x2="112" y2="112" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.55" stopColor="#a855f7" />
                <stop offset="1" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <circle cx="56" cy="56" r="48" stroke="url(#checkgrad)" strokeWidth="6" strokeLinecap="round" />
            <path d="M38 57.5 50.5 70 75 44" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ delay: 1.05, type: 'spring', stiffness: 400, damping: 16 }}
            className="absolute -bottom-1 -right-6 rounded-md border-2 border-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 font-display text-[11px] font-black tracking-[0.2em] text-emerald-300"
          >
            TAYANG
          </motion.div>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="font-display mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl headline-glow">
          {meta.downloadOnly ? 'Video HD siap didownload!' : 'Video udah kekirim!'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-300">
          {meta.downloadOnly ? (
            <>
              Encode <b className="text-purple-300">{meta.platformLabel || 'target'}</b> beres — download filenya,
              terus upload manual ke platform tujuan. Kualitas HD-nya aman.
            </>
          ) : (
            <>
              Udah masuk ke <b className="font-mono text-purple-300">{result?.targets?.join(', ') || result?.target}</b>{' '}
              — tinggal forward ke Status.
            </>
          )}
        </motion.p>

        {/* tiket hasil */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative mx-auto mt-6 max-w-lg rounded-2xl border border-white/10 bg-black/40">
          <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-r border-white/10 bg-[#0d0a1c]" />
          <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-l border-white/10 bg-[#0d0a1c]" />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.06] sm:grid-cols-4">
            <Res label="Resolusi" value={meta.resolution || '—'} />
            <Res label="Ukuran" value={`${meta.sizeMB || '—'} MB`} />
            <Res label="Durasi" value={`${Math.round(meta.durationSec || 0)}s`} />
            <Res label="Engine" value={meta.mode ? `mode ${meta.mode}` : meta.engine?.split(' ')[0] || 'Kilat'} />
          </div>
          <div className="border-t border-dashed border-white/15 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            ★ admittance · kilat studio ★
          </div>
        </motion.div>

        {meta.downloadUrl && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }} className="mx-auto mt-5 max-w-md">
            <button onClick={doDownload} disabled={dlBusy} className="btn-primary flex w-full items-center justify-center gap-2 !py-4 text-base">
              {dlBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} Download Video HD
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              File ini yang siap kamu upload ke {meta.platformLabel || 'platform tujuan'} — bitrate, fps &
              loudness telah dikunci sesuai spesifikasi platform agar tidak pecah saat di-encode ulang.
            </p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {meta.downloadOnly ? (
            <span className="inline-flex items-center gap-1"><Download className="h-3 w-3 text-purple-400" /> mode download — tanpa kirim WA</span>
          ) : (
            <span className="inline-flex items-center gap-1"><CheckCheck className="h-3 w-3 text-emerald-400" /> udah masuk server WA</span>
          )}
          {meta.videoKbps ? <span className="chip">{Math.round(meta.videoKbps / 1000 * 10) / 10} Mbps video</span> : null}
          {meta.trimmed ? <span className="chip-amber">dipotong {Math.round(meta.durationSec)}s</span> : null}
          {meta.platformLabel ? <span className="chip-iris">{meta.platformLabel}</span> : null}
          {meta.engine ? <span className="chip-accent">{meta.engine}</span> : null}
        </motion.div>

        {/* cara forward (khusus yang dikirim ke WA) */}
        {!meta.downloadOnly && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mx-auto mt-6 max-w-md rounded-2xl border border-purple-400/25 bg-purple-500/[0.06] p-4 text-left">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
              <Clapperboard className="h-3.5 w-3.5" /> Langkah di HP kamu
            </div>
            <ol className="mt-3 space-y-2.5">
              {[
                <>Buka WhatsApp → chat dari nomor pengirim</>,
                <><b className="text-white">Tekan-tahan</b> videonya (jangan didownload ulang)</>,
                <>Pilih <b className="text-white">Teruskan</b> → <b className="text-white">Status</b></>,
                <>Siap diunggah. Kualitas telah di-encode maksimal agar tetap tajam.</>,
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-slate-300">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-[10px] font-black text-[#180b33]">{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* aksi */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {result?.entryId && (
            <button className="btn-primary" onClick={doDownload} disabled={dlBusy}>
              <Download className="h-4 w-4" /> Simpan Versi HD
            </button>
          )}
          {result?.entryId && (
            <button className="btn-ghost" onClick={() => onResend?.(result.entryId)}>
              <RefreshCw className="h-4 w-4" /> Kirim Ulang
            </button>
          )}
          <button className="btn-ghost" onClick={onReset}>
            <UploadCloud className="h-4 w-4" /> Video Lain <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-slate-500">
          <Send className="h-3 w-3" /> Tips: video di atas 30 detik tetep kepotong 30 detik sama Status — makanya ada fitur potong otomatis.
        </p>
      </div>
    </motion.div>
  );
}

function Res({ label, value }) {
  return (
    <div className="bg-[#0d0a1c] px-2 py-3">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-xs font-bold text-purple-50">{value}</div>
    </div>
  );
}
