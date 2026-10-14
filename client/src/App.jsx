import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { api } from './lib/api';
import { store } from './lib/store';
import Splash from './components/Splash.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ConnectPage from './components/ConnectPage.jsx';
import SendPage from './components/SendPage.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import Toasts from './components/Toasts.jsx';
import KeyGate from './components/KeyGate.jsx';
import ServerNotice from './components/ServerNotice.jsx';

// Konteks global: toast + socket + conn + history + cfg
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Orb energi (deterministik — stabil tiap render)
const ORBS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 83 + 7) % 100,
  top: (i * 57 + 11) % 100,
  size: 90 + ((i * 67) % 130),
  dur: 14 + ((i * 41) % 12),
  delay: -((i * 29) % 20),
  hue: i % 3,
}));

function StudioBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#070512]" aria-hidden>
      <div className="absolute inset-0 bg-blueprint grid-pan" />
      <div className="absolute -top-[22%] left-1/2 h-[70vh] w-[110vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.26),transparent)] blur-2xl" style={{ animation: 'drift-a 18s ease-in-out infinite' }} />
      <div className="absolute top-[20%] -left-[12%] h-[60vh] w-[52vw] rounded-full bg-[radial-gradient(closest-side,rgba(217,70,239,0.18),transparent)] blur-2xl" style={{ animation: 'drift-b 22s ease-in-out infinite' }} />
      <div className="absolute top-[35%] -right-[12%] h-[55vh] w-[50vw] rounded-full bg-[radial-gradient(closest-side,rgba(250,204,21,0.10),transparent)] blur-2xl" style={{ animation: 'drift-c 26s ease-in-out infinite' }} />
      {ORBS.map((o, i) => (
        <span
          key={i}
          className={`orb orb-${o.hue}`}
          style={{
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: o.size,
            height: o.size,
            animationDuration: `${o.dur}s`,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}
      {/* kilat jauh sesekali */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(237,233,254,0.5),transparent)] storm-flash" />
      <div className="noise" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
    </div>
  );
}

export default function App() {
  const [cfg, setCfg] = useState(null);
  const [conn, setConn] = useState(null);
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [splash, setSplash] = useState(true);
  // Halaman awal: param URL (?page=send — dipakai shortcut manifest PWA)
  // menang atas preferensi localStorage.
  const [page, setPageState] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('page');
      if (q === 'send' || q === 'connect') return q;
    } catch { /* noop */ }
    return store.getPage() || 'connect';
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gateError, setGateError] = useState(null);
  const socketRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  const setPage = useCallback((p) => {
    setPageState(p);
    store.setPage(p);
  }, []);

  /* ---------- Toast ---------- */
  const addToast = useCallback((type, title, message, extra = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-4), { id, type, title, message, ...extra }]);
    // Error dengan detail teknis dibiarkan lebih lama biar bisa dibaca/dicopy
    const ttl = extra.detail ? 20000 : 6000;
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  /* ---------- Config + gate ---------- */
  useEffect(() => {
    api('/api/config')
      .then((c) => {
        setCfg(c);
        window.CONFIG = c; // dipakai komponen lain kalau perlu
      })
      .catch(() => {
        if (store.getKey()) {
          store.setKey('');
          setGateError('Key-nya salah, coba lagi.');
          window.location.reload();
        } else {
          setGateError('Ga nyambung ke server. Coba refresh halamannya.');
        }
      });
  }, []);

  const keyRequired = cfg?.appKeyRequired && !store.getKey();

  /* ---------- Socket ---------- */
  useEffect(() => {
    if (!cfg || keyRequired) return;
    const sock = io('/', {
      transports: ['websocket', 'polling'],
      auth: { key: store.getKey(), ownerToken: store.getOwnerToken() },
      reconnectionDelayMax: 5000,
    });
    socketRef.current = sock;

    sock.on('connect', () => setSocketReady(true));
    sock.on('disconnect', () => setSocketReady(false));
    sock.on('connect_error', (err) => {
      if (err.message === 'unauthorized') {
        store.setKey('');
        setGateError('Key-nya salah, coba lagi.');
        window.location.reload();
      }
    });

    sock.on('conn:update', (st) => setConn(st));
    sock.on('history:update', (h) => setHistory(h || []));
    sock.on('notice', (n) => addToast(n.type || 'info', n.title || '', n.message || ''));
    sock.on('send:error', (e) => {
      if (e?.code === 'CANCELED') return;
      const title = e?.code === 'OOM' ? 'RAM Server Habis' : e?.code === 'ENCODER_INIT' ? 'Encoder Gagal Start' : e?.code === 'BUSY' ? 'Lagi Sibuk' : e?.code === 'FORBIDDEN' ? 'Bukan Punya Kamu' : 'Gagal';
      addToast('error', title, e?.message || 'Ada yang error, coba lagi.', {
        detail: e?.detail || null,
        hint: e?.hint || null,
      });
    });

    // Sinkron status awal
    api('/api/status').then(setConn).catch(() => {});
    return () => {
      sock.removeAllListeners();
      sock.close();
      socketRef.current = null;
      setSocketReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, keyRequired]);

  // Auto-pindah ke halaman Kirim SEKALI saat transisi ke connected
  const prevConnState = useRef(null);
  useEffect(() => {
    const prev = prevConnState.current;
    prevConnState.current = conn?.state;
    if (conn?.state === 'connected' && prev !== 'connected' && page === 'connect') {
      setPage('send');
    }
  }, [conn?.state, page, setPage]);

  // Splash
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1700);
    return () => clearTimeout(t);
  }, []);

  const effectiveConnected = !!cfg?.mockSend || conn?.state === 'connected';

  const ctx = {
    cfg,
    conn,
    effectiveConnected,
    history,
    setHistory,
    socket: socketRef.current,
    socketReady,
    addToast,
    page,
    setPage,
    settingsOpen,
    setSettingsOpen,
    gateError,
    setGateError,
  };

  return (
    <Ctx.Provider value={ctx}>
      <AnimatePresence>{splash && <Splash key="splash" />}</AnimatePresence>

      <div className="relative flex min-h-screen flex-col">
        <StudioBackdrop />

        {keyRequired ? (
          <KeyGate />
        ) : (
          <>
            <Navbar />
            <ServerNotice />
            <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-3 pb-16 pt-6 sm:px-6 sm:pt-8">
              <AnimatePresence mode="wait">
                {page === 'connect' ? (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 22, scale: 0.985, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, scale: 0.99, filter: 'blur(4px)' }}
                    transition={{ duration: 0.32, ease: [0.22, 0.9, 0.28, 1] }}
                  >
                    <ConnectPage />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, y: 22, scale: 0.985, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, scale: 0.99, filter: 'blur(4px)' }}
                    transition={{ duration: 0.32, ease: [0.22, 0.9, 0.28, 1] }}
                  >
                    <SendPage />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
            <Footer />
          </>
        )}

        <SettingsModal />
        <Toasts toasts={toasts} />
      </div>
    </Ctx.Provider>
  );
}
