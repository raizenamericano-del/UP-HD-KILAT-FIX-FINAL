import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, Download, Film, Loader2, Lock, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { useApp } from '../App.jsx';
import { api, downloadVideo, withKey } from '../lib/api.js';
import { fmtDate, fmtDuration } from '../lib/store.js';

/**
 * Arsip rol film — riwayat PRIVAT per perangkat.
 * Hanya terlihat oleh perangkat yang mengunggah; thumbnail & unduhan
 * dilindungi kunci akses individual.
 */
export default function HistoryPanel({ onResend, busy }) {
  const { history, addToast } = useApp();
  const [resendingId, setResendingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = (history || []).filter((h) => (filter === 'all' ? true : h.status === filter));

  const handleResend = (entry) => {
    if (busy) {
      addToast('warn', 'Bentar', 'Masih ada proses yang jalan. Tunggu beres dulu.');
      return;
    }
    setResendingId(entry.id);
    setTimeout(() => {
      setResendingId(null);
      onResend(entry.id);
    }, 500);
  };

  const handleDownload = async (entry) => {
    setDownloadingId(entry.id);
    try {
      const url = withKey(`/api/download/${entry.id}`, entry.accessToken);
      const name = await downloadVideo(url, `${entry.originalName || 'video'}-HD.mp4`);
      addToast('success', 'Lagi didownload', `Nyiapin ${name}`);
    } catch (err) {
      addToast('error', 'Download gagal', err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(`/api/history/${id}`, { method: 'DELETE' });
      addToast('info', 'Udah dihapus', 'Riwayatnya udah dibuang.');
    } catch (err) {
      addToast('error', 'Gagal hapus', err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    try {
      await api('/api/history', { method: 'DELETE' });
      addToast('info', 'Riwayat dibersihin', 'Daftar riwayatmu udah kosong.');
    } catch (err) {
      addToast('error', 'Gagal bersihin', err.message);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0918]/90">
      {/* header arsip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-purple-400" />
          <h3 className="font-display text-sm font-extrabold tracking-wide text-white">ARSIP ROL</h3>
          <span className="chip">{(history || []).length}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            <Lock className="h-2.5 w-2.5" /> Cuma kamu
          </span>
        </div>
        {(history || []).length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-black/40 p-0.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'success', label: 'Berhasil' },
                { id: 'failed', label: 'Gagal' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                    filter === f.id ? 'bg-gradient-to-r from-violet-400 to-fuchsia-500 text-[#180b33]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={handleClearAll} className="text-[11px] font-semibold text-slate-500 transition hover:text-red-400">
              {confirmClear ? 'Yakin? Klik lagi' : 'Hapus Semua'}
            </button>
          </div>
        )}
      </div>

      {/* lubang sproket */}
      <div className="flex items-center justify-between gap-2 overflow-hidden border-y border-white/[0.06] bg-black/50 px-4 py-1.5" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="h-2.5 w-4 shrink-0 rounded-[3px] bg-white/[0.08]" />
        ))}
      </div>

      <div className="p-5 pt-3 sm:px-6 sm:pb-6">
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" />
          Isi daftar ini cuma kesimpen & keliatan di perangkat kamu. Orang lain buka web ini pun punyamu tetep aman, ga bakal keliatan.
        </p>

        {(history || []).length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
            <Clock className="mx-auto h-6 w-6 text-slate-600" />
            <div className="mt-2 text-xs font-bold text-slate-400">Belum ada apa-apa</div>
            <div className="mt-1 text-[11px] text-slate-600">
              Video yang kamu proses bakal kecatat di sini — privat, cuma di perangkat ini.
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            <AnimatePresence initial={false}>
              {filtered.map((h) => (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -26 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="card-lift relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 hover:border-purple-400/30 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]"
                >
                  {/* strip bingkai kiri */}
                  <span className={`absolute inset-y-0 left-0 w-1 ${h.status === 'success' ? 'bg-gradient-to-b from-violet-400 to-fuchsia-500' : 'bg-red-500/60'}`} />
                  {/* thumb (privat: wajib kunci akses) */}
                  {h.thumbFile ? (
                    <img
                      src={withKey(`/api/thumb/${h.id}`, h.accessToken)}
                      alt=""
                      className="ml-1 h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="ml-1 grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-slate-600">
                      <Clock className="h-5 w-5" />
                    </div>
                  )}

                  {/* info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold text-white">{h.originalName}</span>
                      {h.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />}
                      {h.source === 'resend' && <span className="chip chip-brand shrink-0">kirim ulang</span>}
                      {h.platformLabel && <span className="chip chip-iris shrink-0">{h.platformLabel}</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                      <span className="font-mono text-purple-300/90">
                        → {h.target || (h.downloadOnly ? 'download' : '—')}{h.targets?.length > 1 ? ` +${h.targets.length - 1}` : ''}
                      </span>
                      {h.status === 'success' && (
                        <>
                          <span>·</span><span>{h.resolution}</span>
                          <span>·</span><span>{fmtDuration(h.durationSec)}</span>
                          <span>·</span><span>{h.sizeMB} MB</span>
                          {h.mode && <><span>·</span><span className="uppercase">{h.mode}</span></>}
                          {h.trimmed && <><span>·</span><span className="text-violet-400">dipotong</span></>}
                        </>
                      )}
                      <span>·</span><span>{fmtDate(h.createdAt)}</span>
                    </div>
                    {h.status === 'failed' && h.error && <div className="mt-0.5 truncate text-[10px] text-red-400/80">{h.error}</div>}
                  </div>

                  {/* aksi */}
                  <div className="flex shrink-0 items-center gap-1">
                    {h.status === 'success' && (
                      <>
                        <button
                          className="btn-ghost !px-2.5 !py-1.5 text-[11px]"
                          onClick={() => handleDownload(h)}
                          disabled={downloadingId === h.id}
                          title="Unduh versi HD"
                        >
                          {downloadingId === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleResend(h)}
                          disabled={busy || resendingId === h.id}
                          className="btn-ghost !px-2.5 !py-1.5 text-[11px]"
                          title="Kirim ulang video ini"
                        >
                          {resendingId === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">Ulangi</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-400/10 hover:text-red-400"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {(history || []).length > 0 && filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">Ga ada riwayat di filter ini.</div>
        )}
      </div>
    </div>
  );
}
