# CHANGELOG v7.1.0 — JernihHD (Privasi + Stabilitas Kamera)

Tanggal: 12 Oktober 2026 · Pengembang: **Rifky**

Fokus rilis ini: **(1)** menutup kebocoran privasi riwayat global,
**(2)** memperbaiki kegagalan video langsung dari kamera HP tanpa edit,
**(3)** bahasa & tampilan yang lebih profesional + branding pengembang,
**(4)** transparansi server gratis + donasi QRIS.

---

## 1. Privasi per perangkat (perbaikan utama)

Masalah: halaman riwayat + thumbnail + tautan unduhan bersifat **global** —
semua pengunjung dapat melihat dan mengunduh video milik orang lain.

Perbaikan:
- Setiap browser mendapat `ownerToken` acak (tersimpan di `localStorage`,
  dibuat sekali via WebCrypto). Dikirim sebagai header `x-owner-token`
  pada REST + auth socket.io.
- `server/history.js` ditulis ulang: setiap entri terikat `ownerToken` dan
  memiliki `accessToken` individual. `list(owner)` hanya mengembalikan milik
  pemanggil; entri legacy (tanpa pemilik) disembunyikan dari semua orang.
- REST `GET /api/history`, `DELETE /api/history[/:id]` kini terisolasi per
  pemilik. `GET /api/thumb/:id` dan `GET /api/download/:id` mewajibkan
  `?key=<accessToken>` atau header pemilik yang cocok, dengan header
  `X-Robots-Tag: noindex` + `Cache-Control: private`.
- Socket: setiap koneksi masuk ke room `owner:<token>`; event
  `history:update` hanya dikirim ke pemilik terkait (sebelumnya `io.emit`
  global). Pembatalan proses hanya oleh pemilik job berjalan.
- Client: `HistoryPanel` memakai URL berkunci (`withKey`), menampilkan lencana
  "Privat" + penjelasan, serta status kosong yang informatif. `SuccessCard`
  memakai `downloadUrl` berkunci dari server.
- `sweep()` memakai daftar internal semua pemilik + retensi
  `KEEP_VIDEOS` **per pemilik** agar file yatim tetap dibersihkan tanpa
  membocorkan data silang.

## 2. Stabilitas video kamera HP (MOV/HEVC/4K/60fps/VFR/10-bit)

Masalah: video yang direkam langsung dari kamera smartphone tanpa edit sering
gagal (`Server kehabisan RAM`, `ENOENT`, probe gagal) karena:
HEVC 4K rakus RAM-CPU, metadata durasi kosong, edit list + negative CTS,
rotasi displaymatrix, VFR, trek thumbnail ganda, audio multichannel/PCM.

Perbaikan (`server/video.js` + `server/index.js`):
- `probe()` baru: timeout 45 dtk + `-analyzeduration 20M -probesize 20M` +
  fallback `probeDirect()` via spawn ffprobe langsung bila fluent-ffmpeg gagal.
- `extractMeta()`: pilih trek video beresolusi terbesar; durasi dicoba dari
  stream → format → estimasi `nb_frames/fps`; fallback FPS berlapis
  (avg → r_frame → time_base → 30); flag baru `isHEVC/is4K/is10bit/
  isHighFps/isCameraRaw/durationUnknown`.
- `plan()`: asumsi durasi aman 60 dtk bila metadata kosong; `heavy` diperluas;
  penurunan otomatis 1080p→720p untuk 4K/HEVC/10-bit (bahkan saat RAM cukup);
  preset `veryfast` untuk file kamera 1-pass; `bframes` 2 saat lean; catatan
  UI khusus kamera + tips mode Turbo.
- `runFfmpeg()`: flag input toleran kamera selalu aktif —
  `-err_detect ignore_err -fflags +genpts+igndts -avoid_negative_ts make_zero
  -analyzeduration 20M -probesize 20M` + `-max_muxing_queue_size 9999`.
- `extractThumbnail()`: fallback accurate-seek bila fast-seek gagal (edit list);
  detik ke-1 bila durasi tak diketahui.
- `audioOptions()`: selalu normalisasi ke AAC stereo 48 kHz (kamera 5.1/PCM).
- `compressVideo()`: validasi preflight (file ada, ukuran > 0, metadata valid)
  dengan pesan ramah gantinya error `ENOENT` misterius.
- `POST /api/upload`: filter format kamera diperluas (`.mov .mts .m2ts .hevc
  .3gpp .3g2` + mimetype generik Android); tolak file 0-byte; pesan profesional.
- Pesan error (`friendlyError`) ditulis ulang profesional + kode baru
  `FORBIDDEN / TOO_LONG / NOT_FOUND` + petunjuk server gratis.

## 3. Bahasa profesional + branding Rifky

- Seluruh teks pengguna (server + client) ditulis ulang ke Bahasa Indonesia
  formal yang ramah: tanpa "bro/jir/lu/gas/nyambung/nunggu".
- Branding konsisten: "Dikembangkan oleh **Rifky**" di footer, logo subtitle,
  splash, README, `/api/config.developer`, dan log startup.
- Judul tahap proses, status navbar ("Terhubung", "Menghubungkan…"),
  kartu statistik, panduan forward WA, dan peringatan ban — semuanya formal.
- Versi `7.1.0` di `package.json` (root + client), fallback UI, dan README.

## 4. Transparansi server gratis + donasi QRIS

- `config.SERVER_NOTICE` + `config.DONATE` diekspos via `/api/config`.
- Komponen baru `ServerNotice.jsx`: banner "Mohon maaf atas ketidaknyamanan —
  proses unggah dan encode terkadang lama / sesekali gagal karena server gratis…",
  dapat ditutup, dengan panel QRIS donasi lipat.
- Komponen baru `DonateCard.jsx` di halaman Kirim: "Dukung Pengembangan
  JernihHD — donasi seikhlasnya…" + langkah pindai QRIS.
- Berkas `client/public/qris.jpg` (ditampilkan di UI) + arsip `qris-donasi.jpg`.
- Footer memuat ajakan donasi + catatan privasi per perangkat.

## 5. Catatan migrasi

- Riwayat lama (v7.0 ke bawah, tanpa `ownerToken`) otomatis disembunyikan demi
  privasi. File yatimnya dibersihkan oleh `sweep()` berkala. Tidak ada tindakan
  manual yang diperlukan.
- Pengguna yang menginginkan "identitas baru" dapat memakai
  `store.resetOwnerToken()` (console) — riwayat lama menjadi tidak dapat diakses.
- Tidak ada perubahan skema env. Deploy ulang seperti biasa
  (`npm run build && npm start`, atau via Dockerfile).

---

*JernihHD v7.1.0 — privasi dijaga, kamera HP didukung, bahasa profesional.
Dikembangkan oleh Rifky.*

---

## v7.3.3 — FIX: video portrait kamera HP jadi landscape gepeng

Tanggal: 14 Oktober 2026 · Pengembang: **Rifky**

Bug: video portrait dari kamera (disimpan landscape + metadata rotasi)
 terdeteksi sebagai landscape, lalu dipaksa masuk kanvas 1280x720 hingga
 gepeng ("ngez00m cekung"). File TikTok aman karena sudah portrait murni
 tanpa metadata rotasi.

Akar masalah: ffmpeg <=6 (Debian/Railway) melaporkan rotasi TANPA tag
 (hanya side-data displaymatrix); parser fluent-ffmpeg meratakannya ke
 field `stream.rotation` yang tidak dibaca `extractMeta()`.

Perbaikan: `extractMeta()` kini membaca SEMUA sumber rotasi (tags +
 stream rata + side_data terstruktur) dan toleran nilai pecahan.
 Diverifikasi end-to-end dengan ffmpeg 5.1.1 asli: portrait masuk =
 portrait keluar; ffmpeg 7.x tidak berubah perilaku.

## v7.3.2 — Perbaikan warna HDR kamera HP (jalur fallback)

Tanggal: 13 Oktober 2026 · Pengembang: **Rifky**

- Tonemap fallback (ffmpeg tanpa zscale, mis. Debian di Railway) kini
  mengonversi primaries BT.2020→BT.709 via filter `colorspace` bawaan.
  Video HDR langsung dari kamera (iPhone Dolby Vision, Android HDR10)
  warnanya akurat, tidak oversaturasi.
- Turut diaudit + diuji lewat pipeline asli: video portrait (rotasi
  90/180/270), HEVC 60fps, VFR, HDR, dan kontrol SDR — orientasi &
  integritas semua benar.

## v7.3.1 — QA layout mobile + hardening

Tanggal: 12 Oktober 2026 · Pengembang: **Rifky**

Lolos audit QA: 11/11 cek overflow (desktop 1366 + HP 390/360/320)
bersih, 0 console error, seluruh layar dicek visual satu-satu.

Perbaikan:
- Kotak digit pairing code kini menyusut mengikuti layar HP
  (sebelumnya 330px, jebol di layar ≤360px).
- Semua chip/pill anti-wrap (contoh: "QR SIAP" tidak turun baris).
- Chip profil encode anti-gepet di baris judul panel proses.
- Tab navbar dapat aria-label (sebelumnya tanpa nama di HP karena
  label teks disembunyikan — hanya ikon).

## v7.3.0 — "Kilat": rebrand total + animasi badai + perbaikan bug

Tanggal: 12 Oktober 2026 · Pengembang: **Rifky**

Identitas baru: **KILAT HD — Studio Petir**. Palet ungu elektrik +
fuchsia + kuning petir di atas hitam-violet. Mesin encode, privasi,
dan logika server tidak berubah (selain string tampilan nama).

Baru:
- Logo petir dalam cincin orbit + wordmark KILAT HD + seluruh aset
  brand (ikon PWA, favicon, OG, splash) digambar ulang.
- Latar "badai": grid berjalan, orb energi melayang, kilat jauh
  sesekali, mesh violet + noise film.
- Splash sambaran petir: petir ke-gambar sendiri + kilat layar +
  huruf KILAT muncul satu-satu.
- Panel encode: cincin reaktor muter ganda di sekeliling %, progress
  jadi berkas energi mengalir, visualizer dapat pantulan, kilat tiap
  ganti tahap.
- Kartu sukses: 3 gelombang kejut + confetti petir (violet/fuchsia/
  kuning). Transisi antar halaman blur + scale sinematik.
- Nama baru di semua teks, judul tab, PWA, meta SEO, dan info engine
  dari server ("Kilat Engine", tagline "HD Sekejap Kilat").

Perbaikan bug:
- "Kirim Ulang" dari riwayat selalu gagal ("riwayat tidak tersedia")
  karena yang dikirim objek utuh, bukan id — diperbaiki di client,
  plus server kini tahan kalau dapat format lama.
- Bar waktu toast kini sinkron dengan durasi tampilnya (20 dtk untuk
  error ber-detail teknis, sebelumnya selalu 6 dtk).
- Bersih-bersih: kode partikel mati dihapus, sisa warna tema lama 0.

## v7.2.0 — "Ember Studio": UI overhaul total + animasi encode

Tanggal: 12 Oktober 2026 · Pengembang: **Rifky**

Perombakan tampilan menyeluruh — konsep **studio film sinematik**.
Yang berubah HANYA presentasi; kualitas encode, privasi, dan logika
socket/server **tidak disentuh sama sekali**.

Baru:
- Latar "studio theater": mesh gradien melayang, grid blueprint,
  16 partikel bara api naik, film grain, vignette.
- Logo baru: cincin orbit muter + segitiga play + wordmark EMBER ▸HD◂.
- Navbar pil melayang; splash clapperboard "TAKE 1 · REC".
- Panel encode ala monitor studio: angka % raksasa, bar tukang-cukur
  berjalan, visualizer 32 bar, timeline 4 tahap, terminal log + kursor.
- Kartu sukses: centang ke-gambar sendiri + stempel "TAYANG" + tiket hasil.
- Riwayat jadi "arsip rol film" (strip sproket + bingkai per item).
- Halaman koneksi: hero papan casting (bohlam kedip), QR theater
  (bingkai gradien muter + beam scan), kartu "ON AIR", call sheet.
- Toast "cue card" sutradara; footer end-credits; tombol premiere
  berdenyut + tombol batal dengan kilau nyapu.
- Confetti & semua aksen diseragamkan ke palet bara api.

## v7.1.1 — Rebrand "Ember" + teks natural + versi disembunyikan

- Identitas visual baru **"Ember"**: gradien amber → orange → rose di atas
  charcoal hangat (sebelumnya "Glacier": emerald → cyan → blue). Token warna
  `brand`/`iris`/`accent` diganti nilainya, seluruh komponen ikut berubah.
- **Logo baru**: tombol play gradien ember + cincin orbit (sebelumnya tetesan
  air). Seluruh PNG (ikon PWA, maskable, favicon, apple-touch, OG, splash)
  di-render ulang dari SVG via `npm run icons`.
- Seluruh teks UI ditulis ulang dengan Bahasa Indonesia natural/santai
  (tidak kaku, tidak seperti buatan AI). Banner server & donasi memakai
  kalimat admin sendiri.
- **Nomor versi dihapus dari semua tampilan** (footer, navbar, splash,
  pengaturan, badge engine, OG/splash image, manifest). Versi hanya tercatat
  di `package.json`/API internal.
- Kualitas encode TIDAK berubah sama sekali (bitrate, CRF, ladder, filter).
