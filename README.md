# 💖 Lovescape for Alexa — v2

Birthday website cinematic. Flow: Splash → Matrix+Countdown → Video → Birthday Cat → 3D Book → Photo Heart ❤️

---

## 📁 Struktur

```
lovescape-alexa/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js            ← orchestrator semua scene
├── components/
│   ├── SpaceBg.js         ← starfield canvas (persistent)
│   ├── MusicBtn.js        ← tombol musik
│   ├── NavDots.js         ← navigasi dots
│   ├── SplashScene.js     ← tap to enter + heart cursor
│   ├── MatrixScene.js     ← matrix rain + countdown + glitch words
│   ├── VideoScene.js      ← video pesan (upload atau path)
│   ├── StarfieldScene.js  ← birthday cat animation
│   ├── BookScene.js       ← 3D book (desktop) / swipe (mobile)
│   └── HeartFinale.js     ← foto pop ke bentuk hati + confetti + CTA
└── public/
    ├── music/bg.mp3       ← TARUH MUSIK DI SINI
    └── photos/            ← TARUH FOTO DI SINI (1.jpg - 6.jpg)
```

---

## 🚀 Setup

### 1. Install & run
```bash
npm install
npm run dev
```

### 2. Foto (PENTING)
Taruh foto di `public/photos/` dengan nama:
- `1.jpg` sampai `6.jpg` (untuk book + heart)

Atau edit array di `BookScene.js` dan `HeartFinale.js`:
```js
const BOOK_PHOTOS = ['/photos/namafoto.jpg', ...]
const HEART_PHOTOS = [{ src: '/photos/namafoto.jpg' }, ...]
```

### 3. Musik
Taruh MP3 di `public/music/bg.mp3`

### 4. Video (opsional)
Edit `VideoScene.js`:
```js
const VIDEO_SRC = '/video/pesan.mp4'
```
Atau biarkan kosong — user bisa upload manual di scene video.

### 5. WhatsApp CTA
Edit `HeartFinale.js`:
```js
const WHATSAPP_NUMBER = '6281234567890'
const WHATSAPP_MSG    = 'Happy Birthday Alexa! 🎂❤️'
```

---

## 🌐 Deploy ke Vercel
```bash
npm install next@latest
npx vercel --prod
```
# SendiAlexa
