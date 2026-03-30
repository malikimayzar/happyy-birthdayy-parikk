'use client'
import { useEffect, useRef, useState } from 'react'

// ── CONFIG ─────────────────────────────────────
// Kalau lo udah punya file video, isi path-nya di sini.
// Contoh: '/video/pesan.mp4'
// Kalau kosong (''), user bisa upload manual di scene ini.
const VIDEO_SRC = '/video/sendi.mp4'
// ──────────────────────────────────────────────

export default function VideoScene({ onDone }) {
  const [hasVideo, setHasVideo] = useState(!!VIDEO_SRC)
  const [videoSrc, setVideoSrc] = useState(VIDEO_SRC)
  const videoRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (hasVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [hasVideo])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setVideoSrc(url)
    setHasVideo(true)
  }

  return (
    <div
      className="scene"
      style={{ zIndex: 10, flexDirection: 'column', gap: 'clamp(14px,3vw,24px)', padding: 'clamp(16px,4vw,32px)' }}
    >
      <div
        style={{
          color: '#ffb6c1', fontSize: 12, letterSpacing: '3px',
          textAlign: 'center', animation: 'fadeSlideUp .8s ease forwards',
          fontFamily: 'Share Tech Mono, monospace',
        }}
      >
        🎬 &nbsp; PESAN VIDEO UNTUKMU &nbsp; 🎬
      </div>

      <div
        id="video-frame"
        style={{ width: '100%', maxWidth: 'min(500px,94vw)' }}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            style={{ width: '100%', borderRadius: 16, display: 'block', maxHeight: '60vh', objectFit: 'contain', animation: 'videoFadeIn .8s ease forwards' }}
            playsInline
            autoPlay
            loop
            muted={false}
            controls
          />
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            style={{ width: '100%', padding: 'clamp(24px,5vw,40px) 20px', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 52, marginBottom: 12, animation: 'gifFloat 2s ease-in-out infinite' }}>🎥</div>
            <div style={{ color: '#ff69b4', fontSize: 13, letterSpacing: '2px', marginBottom: 6 }}>Klik untuk upload Video</div>
            <div style={{ color: 'rgba(255,182,193,.5)', fontSize: 11 }}>Format: .mp4, .mov, .webm</div>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!hasVideo && (
          <button className="btn-sm" onClick={() => inputRef.current?.click()}>
            📂 Pilih File Video
          </button>
        )}
        <button className="btn" onClick={onDone} style={{ padding: '10px 24px', fontSize: 13 }}>
          Lanjut ▶
        </button>
      </div>
    </div>
  )
}
