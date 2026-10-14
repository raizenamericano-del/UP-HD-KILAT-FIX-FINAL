import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clapperboard,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  Phone,
  QrCode,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Timer,
  Unplug,
} from 'lucide-react';
import { useApp } from '../App.jsx';
import { api } from '../lib/api.js';
import { store, fmtPhone } from '../lib/store.js';
import BanWarning from './BanWarning.jsx';

const QR_TTL_DEFAULT = 55;

export default function ConnectPage() {
  const { conn, setPage, addToast, cfg } = useApp();
  const [method, setMethod] = useState('qr');
  const connState = conn?.state || 'idle';
  const connected = connState === 'connected';

  /* ---------- QR ---------- */
  const qrTtl = Math.round((conn?.qrTimeoutMs || QR_TTL_DEFAULT * 1000) / 1000);
  const [requestingQr, setRequestingQr] = useState(false);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(qrTtl);

  const requestQr = useCallback(async () => {
    setRequestingQr(true);
    try {
      await api('/api/connect/qr', { method: 'POST' });
      setQrSecondsLeft(qrTtl);
    } catch (err) {
      addToast('error', 'QR gagal dimuat', err.message);
    } finally {
      setRequestingQr(false);
    }
  }, [addToast, qrTtl]);

  useEffect(() => {
    if (method !== 'qr' || connected) return;
    requestQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, connected]);

  useEffect(() => {
    if (method !== 'qr' || connected) return;
    setQrSecondsLeft(qrTtl);
    const t = setInterval(() => setQrSecondsLeft((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [method, connected, connState, conn?.qr, qrTtl]);

  useEffect(() => {
    if (method === 'qr' && !connected && qrSecondsLeft === 0 && !requestingQr) requestQr();
  }, [qrSecondsLeft, method, connected, requestingQr, requestQr]);

  /* ---------- Pairing ---------- */
  const [pairNumber, setPairNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [now, setNow] = useState(Date.now());
  const pairing = conn?.pairing;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const codeLeft = pairing?.expiresAt ? Math.max(0, Math.floor((pairing.expiresAt - now) / 1000)) : 0;
  const codeExpired = !!pairing?.code && codeLeft <= 0;

  // Isi otomatis dari nomor yang terakhir dipakai.
  // (v5.0.5 salah baca `hdjir_default_target` — isinya nama platform seperti
  //  "tiktok"/"wa", bukan nomor — jadi field ini tidak pernah ingat nomornya.)
  useEffect(() => {
    const saved = store.getPairPhone();
    if (saved && !pairNumber) setPairNumber(saved.replace(/[^\d]/g, ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPairing = async (refresh = false) => {
    const cleaned = String(pairNumber || '').replace(/[^\d]/g, '');
    if (cleaned.length < 9) {
      setErr('Isi nomor WA dulu, minimal 9 digit. Contoh: 081234567890');
      addToast('error', 'Nomor belum lengkap', 'Isi dulu nomor WA yang mau ditautin.');
      return;
    }
    setBusy(true);
    setErr(null);
    store.setPairPhone(cleaned);
    try {
      const path = refresh ? '/api/connect/pairing/refresh' : '/api/connect/pairing';
      const res = await api(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: cleaned }),
      });
      const code = res?.code || res?.pairing?.code;
      // Tampilkan toast sesuai kenyataan: kode benar-benar ada atau belum.
      if (code) {
        addToast('success', refresh ? 'Kode baru keluar' : 'Kode pairing siap!', 'Masukan di WA → Perangkat Tertaut → Tautkan dengan nomor telepon.');
      } else {
        addToast('info', 'Nunggu WhatsApp…', 'Kodenya lagi disiapin, bentar lagi muncul.');
      }
    } catch (e) {
      setErr(e.message);
      addToast('error', 'Gagal ambil kode', e.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelPairing = async () => {
    setBusy(true);
    try {
      await api('/api/connect/pairing/cancel', { method: 'POST' });
      addToast('info', 'Pindah ke mode QR', 'Scan QR aja kalau itu lebih gampang.');
      setMethod('qr');
      setErr(null);
    } catch (e) {
      addToast('error', 'Gagal', e.message);
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    const code = pairing?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      addToast('success', 'Kode kecopy', `Kode pairing: ${code}`);
    } catch {
      addToast('info', 'Copy manual', `Kodenya: ${code}`);
    }
  };

  const doDisconnect = async () => {
    try {
      await api('/api/disconnect', { method: 'POST' });
      addToast('info', 'Udah diputus', 'Koneksinya diputus, tapi sesinya aman kesimpen.');
    } catch (e) {
      addToast('error', 'Gagal', e.message);
    }
  };

  const doLogout = async () => {
    if (!window.confirm('Logout = sesi kehapus. Nanti harus scan/pairing ulang. Lanjut?')) return;
    try {
      await api('/api/logout', { method: 'POST' });
      addToast('success', 'Udah logout', 'Sesi WhatsApp-nya dihapus.');
    } catch (e) {
      addToast('error', 'Gagal', e.message);
    }
  };

  /* ================= SUDAH NYAMBUNG ================= */
  if (connected) {
    return (
      <div className="space-y-4">
        <Hero cfg={cfg} />
        <ConnectedCard conn={conn} onSend={() => setPage('send')} onDisconnect={doDisconnect} onLogout={doLogout} />
        <BanWarning />
        <StatusSteps state={connState} phone={conn?.phone} />
      </div>
    );
  }

  /* ================= BELUM NYAMBUNG ================= */
  return (
    <div className="space-y-4">
      <Hero cfg={cfg} />

      <div className="flex items-center gap-1 rounded-2xl border border-white/[0.07] bg-[#0b0918]/90 p-1.5">
        {[
          { id: 'qr', label: 'QR Code', desc: 'Scan dari HP', icon: <QrCode className="h-4 w-4" /> },
          { id: 'pairing', label: 'Pairing Code', desc: '8 digit ketik manual', icon: <KeyRound className="h-4 w-4" /> },
        ].map((m) => (
          <button key={m.id} onClick={() => setMethod(m.id)} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2.5">
            {method === m.id && (
              <motion.span
                layoutId="method-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 shadow-[0_4px_24px_rgba(168,85,247,0.45)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-2 text-sm font-bold ${method === m.id ? 'text-[#180b33]' : 'text-slate-400'}`}>
              {m.icon} {m.label}
            </span>
            <span className={`relative z-10 text-[10px] font-semibold ${method === m.id ? 'text-[#180b33]/70' : 'text-slate-500'}`}>{m.desc}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {method === 'qr' ? (
          <motion.div key="qr" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <QrPanel
              qr={conn?.qr}
              state={connState}
              requesting={requestingQr}
              secondsLeft={qrSecondsLeft}
              ttl={qrTtl}
              onRefresh={requestQr}
            />
          </motion.div>
        ) : (
          <motion.div key="pairing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <PairingPanel
              number={pairNumber}
              setNumber={setPairNumber}
              busy={busy}
              pairing={pairing}
              codeLeft={codeLeft}
              codeExpired={codeExpired}
              err={err}
              onRequest={() => requestPairing(false)}
              onRefresh={() => requestPairing(true)}
              onCopy={copyCode}
              onCancel={cancelPairing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BanWarning />
      <StatusSteps state={connState} phone={conn?.phone} />
      <EngineStrip cfg={cfg} />
    </div>
  );
}

/* ==================== HERO: papan casting ==================== */
function Hero({ cfg }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 20 });
  const sry = useSpring(ry, { stiffness: 140, damping: 20 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        rx.set((((e.clientY - r.top) / r.height) - 0.5) * -6);
        ry.set((((e.clientX - r.left) / r.width) - 0.5) * 8);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0918]/90 p-7 text-center sm:p-10"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-96 -translate-x-1/2 rounded-full bg-purple-600/25 blur-[110px]" />
      {/* bohlam marquee */}
      <div className="pointer-events-none absolute inset-x-6 top-3 flex justify-between" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-300"
            style={{ animation: `blink-soft 1.6s ease-in-out ${i * 0.14}s infinite` }}
          />
        ))}
      </div>
      <div className="relative">
        <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-500" /> Now casting
        </div>
        <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-white headline-glow sm:text-4xl">
          Sambungin WhatsApp,<br className="hidden sm:block" /> biar <span className="grad-text">Status HD</span>-nya jalan.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-slate-300/90 sm:text-sm">
          Tinggal pilih: scan QR atau pakai <b className="text-white">pairing code</b>. Sesinya kesimpen permanen di
          server — ga perlu ulang tiap server restart.
        </p>
        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <Clapperboard className="h-3.5 w-3.5 text-purple-400" /> {cfg?.engine?.name || 'Kilat Engine'}
        </div>
      </div>
    </motion.div>
  );
}

/* ==================== QR PANEL: theater ==================== */
function QrPanel({ qr, state, requesting, secondsLeft, ttl, onRefresh }) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / Math.max(1, ttl)) * 100));
  const expired = secondsLeft <= 0;

  return (
    <div className="g-frame">
      <div className="g-frame-inner p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-purple-300/60">screen 01</div>
            <h2 className="font-display mt-0.5 text-xl font-bold text-white">Scan QR dari WA</h2>
            <p className="mt-0.5 text-xs text-slate-400">WA → Perangkat Tertaut → Tautkan Perangkat</p>
          </div>
          <span className={`chip ${qr ? 'chip-accent' : 'chip-amber'}`}>{qr ? 'QR siap' : 'Menyiapkan'}</span>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            {/* ring countdown */}
            <svg className="absolute -inset-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.25rem)] -rotate-90" viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.4" />
              <circle
                cx="50" cy="50" r="48" fill="none" stroke="url(#qrGrad)" strokeWidth="1.8" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 301.6} 301.6`}
                style={{ transition: 'stroke-dasharray 0.9s linear' }}
              />
              <defs>
                <linearGradient id="qrGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="60%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>

            {qr ? (
              <motion.div
                key={qr.slice(0, 32)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className="relative rounded-2xl bg-white p-3.5 shadow-[0_0_60px_rgba(168,85,247,0.35)]"
              >
                <QRCodeCanvas value={qr} size={216} level="M" marginSize={1} fgColor="#05050c" bgColor="#ffffff" />
                <div className="pointer-events-none absolute inset-3 overflow-hidden rounded-xl">
                  <motion.div
                    className="h-10 w-full bg-gradient-to-b from-transparent via-purple-500/35 to-transparent"
                    animate={{ y: [-40, 220] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <span className="absolute -left-1.5 -top-1.5 h-7 w-7 rounded-tl-lg border-l-[3px] border-t-[3px] border-purple-400" />
                <span className="absolute -right-1.5 -top-1.5 h-7 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] border-purple-400" />
                <span className="absolute -bottom-1.5 -left-1.5 h-7 w-7 rounded-bl-lg border-b-[3px] border-l-[3px] border-purple-400" />
                <span className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-br-lg border-b-[3px] border-r-[3px] border-purple-400" />
              </motion.div>
            ) : (
              <div className="grid h-[244px] w-[244px] place-items-center rounded-2xl border-2 border-dashed border-white/10 bg-black/40">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <span className="text-xs font-bold">{state === 'reconnecting' ? 'Menghubungkan ulang…' : 'Menyiapkan QR…'}</span>
                  <span className="text-[10px] text-slate-500">biasanya 2–5 detik</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 w-full max-w-xs">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> QR berlaku</span>
              <span className={`${expired ? 'text-amber-400' : 'text-purple-300'}`}>{Math.max(0, secondsLeft)}s</span>
            </div>
            <div className="track mt-1.5">
              <div className="track-fill" style={{ width: `${pct}%`, transition: 'width 0.9s linear' }} />
            </div>
          </div>

          <button className="btn-ghost mt-5 !py-2 text-xs" onClick={onRefresh} disabled={requesting}>
            <RefreshCw className={`h-3.5 w-3.5 ${requesting ? 'animate-spin' : ''}`} /> Refresh QR
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            QR diganti otomatis tiap ±{ttl} detik. Scan cepet ya, kalau basi tinggal refresh.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==================== PAIRING PANEL: casting code ==================== */
function PairingPanel({ number, setNumber, busy, pairing, codeLeft, codeExpired, err, onRequest, onRefresh, onCopy, onCancel }) {
  const code = pairing?.code || '';
  const digits = useMemo(() => code.split(''), [code]);
  const waiting = busy && !code;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="studio-panel p-6 sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-purple-300/60">screen 02</div>
          <h2 className="font-display mt-0.5 text-xl font-bold text-white">Pairing Code</h2>
          <p className="mt-0.5 text-xs text-slate-400">Buat yang HP-nya susah scan QR. Kode 8 digit, sekali pakai.</p>
        </div>
        {pairing?.code && (
          <span className={`chip ${codeExpired ? 'chip-amber' : 'chip-accent'}`}>{codeExpired ? 'Kedaluwarsa' : 'Aktif'}</span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label">Nomor WA yang mau ditautkan</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">+</span>
              <input
                className="input pl-7 font-mono tracking-wide"
                placeholder="6281234567890"
                inputMode="numeric"
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 15))}
                onKeyDown={(e) => e.key === 'Enter' && !busy && number.length >= 9 && onRequest()}
              />
            </div>
            <button className="btn-primary shrink-0" onClick={onRequest} disabled={busy || number.length < 9}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {code ? 'Kode Baru' : 'Ambil Kode'}
            </button>
          </div>
          <p className="hint">
            Format internasional tanpa + atau 0. Contoh: <b className="text-slate-300">081234567890</b> → otomatis jadi{' '}
            <b className="text-slate-300">6281234567890</b>.
          </p>
        </div>

        {err && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <div className="text-xs leading-relaxed text-red-200">{err}</div>
          </motion.div>
        )}

        <AnimatePresence>
          {(code || waiting || pairing?.active) && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`relative overflow-hidden rounded-2xl border p-5 text-center ${codeExpired ? 'border-violet-400/30 bg-violet-400/[0.06]' : 'border-purple-400/25 bg-purple-500/[0.05]'}`}
            >
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/90">
                {code ? (codeExpired ? 'Kodenya expired — bikin baru' : 'Kode pairing kamu') : 'Nunggu kode dari WhatsApp'}
              </div>

              {code ? (
                <>
                  <div className="mt-4 flex items-center justify-center gap-1 sm:gap-2" style={{ perspective: 600 }}>
                    {digits.slice(0, 8).map((d, i) => (
                      <motion.div
                        key={`${d}-${i}`}
                        initial={{ rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                        className="grid h-12 min-w-0 flex-1 place-items-center rounded-lg border border-purple-400/30 bg-black/70 font-mono text-xl font-black text-purple-100 shadow-[0_4px_20px_rgba(168,85,247,0.2)] min-[400px]:text-2xl sm:h-14 sm:w-11 sm:flex-none sm:text-3xl"
                      >
                        {d}
                      </motion.div>
                    ))}
                  </div>

                  {/* Nomor yang benar-benar terdaftar di WhatsApp untuk kode ini.
                      Penting: kode pairing terikat ke nomor, jadi user harus
                      bisa memastikan kodenya untuk nomor yang dia mau. */}
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Terdaftar untuk</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {fmtPhone(pairing?.number || number) || '—'}
                    </span>
                  </div>

                  <div className="mx-auto mt-4 max-w-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> Kode berlaku</span>
                      <span className={`${codeExpired ? 'text-amber-400' : 'text-purple-300'}`}>
                        {codeExpired ? 'habis' : `${Math.floor(codeLeft / 60)}:${String(codeLeft % 60).padStart(2, '0')}`}
                      </span>
                    </div>
                    <div className="track mt-1.5">
                      <div
                        className={`track-fill ${codeExpired ? '!bg-violet-400/70' : ''}`}
                        style={{ width: `${Math.max(0, Math.min(100, (codeLeft / 120) * 100))}%`, transition: 'width 0.95s linear' }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button className="btn-ghost !py-2 text-xs" onClick={() => { onCopy(); setCopied(true); }}>
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Ke-salin' : 'Salin kode'}
                    </button>
                    <button className="btn-ghost-accent !py-2 text-xs" onClick={onRefresh} disabled={busy}>
                      <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} /> {codeExpired ? 'Bikin kode baru' : 'Refresh kode'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-3 py-2">
                  <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
                  <div className="text-xs text-slate-400">
                    Handshake ke WhatsApp… kode muncul otomatis di sini.
                  </div>
                </div>
              )}

              {pairing?.lastError && (
                <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-left text-[11px] leading-relaxed text-red-300">
                  <b className="font-semibold">Error terakhir:</b> {pairing.lastError}
                </div>
              )}

              <div className="mt-5 rounded-xl border border-white/10 bg-black/50 p-3.5 text-left">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Cara masukin di HP</div>
                <ol className="mt-2 space-y-1 text-[11px] leading-relaxed text-slate-300">
                  <li>1. Buka WhatsApp → <b className="text-white">Setelan</b></li>
                  <li>2. <b className="text-white">Perangkat Tertaut</b> → <b className="text-white">Tautkan Perangkat</b></li>
                  <li>3. Pilih <b className="text-white">Tautkan dengan nomor telepon saja</b></li>
                  <li>4. Masukin 8 digit di atas <b className="text-white">PERSIS apa adanya</b> (huruf BESAR semua — jangan diubah kecil)</li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="btn-ghost w-full !py-2 text-xs" onClick={onCancel} disabled={busy}>
          <QrCode className="h-3.5 w-3.5" /> Ribet? Balik ke mode QR
        </button>
      </div>
    </div>
  );
}

/* ==================== CONNECTED: on air ==================== */
function ConnectedCard({ conn, onSend, onDisconnect, onLogout }) {
  const since = conn?.connectedAt ? new Date(conn.connectedAt) : null;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="g-frame">
      <div className="g-frame-inner p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-1.5 font-mono text-xs font-black tracking-[0.35em] text-fuchsia-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-500" /> ON AIR
          </div>
          <div className="relative">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-3xl bg-purple-500/25"
              animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
              className="relative grid h-24 w-24 place-items-center rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-purple-500/10 text-emerald-300"
            >
              <BadgeCheck className="h-11 w-11" strokeWidth={2.2} />
            </motion.div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white headline-glow">WhatsApp nyambung!</h2>
            <p className="mt-1 text-sm text-slate-400">Sesi kesimpen permanen — ga perlu scan ulang.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 font-mono text-base font-bold tracking-wider text-emerald-300">
              <Phone className="h-4 w-4" /> {conn.phone || '—'}
            </div>
            {since && (
              <span className="chip">
                aktif sejak {since.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          {conn.mock && !conn.realSession && (
            <div className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-300">
              MODE UJI — koneksi cuma simulasi
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button className="btn-premiere" onClick={onSend}>
              Gas, Kirim Video <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn-ghost" onClick={onDisconnect}>
              <Unplug className="h-4 w-4" /> Putusin
            </button>
            <button className="btn-danger" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ==================== CALL SHEET ==================== */
function StatusSteps({ state, phone }) {
  const steps = [
    { key: 'connect', label: 'Nyambung ke server WhatsApp' },
    { key: 'auth', label: 'Scan QR / masukin pairing code' },
    { key: 'done', label: phone ? `Login sebagai ${phone}` : 'Siap dipake' },
  ];
  const idx = state === 'connected' ? 2 : state === 'qr' || state === 'pairing' ? 1 : 0;

  return (
    <div className="studio-panel p-5">
      <div className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-purple-200/50">Call sheet · progress koneksi</div>
      <div className="mt-3 space-y-2.5">
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <motion.div key={s.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 text-[11px] font-black ${
                  done ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : active ? 'border-purple-400/60 bg-purple-500/15 text-purple-200' : 'border-white/10 bg-white/[0.03] text-slate-600'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
              </div>
              <span className={`text-sm ${done ? 'text-slate-300 line-through decoration-emerald-400/40' : active ? 'font-semibold text-white' : 'text-slate-600'}`}>{s.label}</span>
              {active && state === 'reconnecting' && <span className="text-[10px] font-bold text-violet-400">(nyoba ulang otomatis…)</span>}
            </motion.div>
          );
        })}
      </div>
      {state === 'logged_out' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-[11px] text-red-300">
          Sesinya udah di-logout. Scan QR / pairing ulang buat nyambung lagi.
        </motion.div>
      )}
    </div>
  );
}

/* ==================== TECH SPECS marquee ==================== */
function EngineStrip({ cfg }) {
  const items = [
    'Target: WA · TikTok · IG · Shorts',
    'Scale LANCZOS (bukan bilinear)',
    'HDR → SDR tonemapping',
    'x264 High 4.2 · AQ-mode 3 + psy-rd',
    '2-pass ABR mode Maksimal',
    'Loudness EBU R128 terukur (linear)',
    'GOP 2 detik + faststart',
    'Anti-banding scene gelap',
    'Auto-trim per platform',
    'AAC 48 kHz 192 kbps',
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0918]/90">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/40 px-4 py-2.5">
        <Smartphone className="h-3.5 w-3.5 text-purple-400" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {cfg?.engine?.name || 'Kilat Engine'} · yang bikin hasilnya tetep tajem
        </span>
      </div>
      <div className="relative overflow-hidden py-3">
        <div className="marquee gap-6">
          {[...items, ...items].map((t, i) => (
            <span key={i} className="flex shrink-0 items-center gap-2 text-[11px] text-slate-400">
              <span className="h-1 w-1 rounded-full bg-purple-400" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
