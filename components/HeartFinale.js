'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const BASE_PHOTOS = [
  '/photos/1.png',
  '/photos/2.png',
  '/photos/3.png',
  '/photos/4.png',
  '/photos/5.png',
]

const PHOTOS = Array.from({ length: 24 }, (_, i) => BASE_PHOTOS[i % BASE_PHOTOS.length])
const FALLBACKS = ['♡', '✦', '♥', '✧']

function heartPositions(n) {
  const positions = []
  const outerCount = 16
  for (let i = 0; i < outerCount; i++) {
    const t = (i / outerCount) * 2 * Math.PI
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    positions.push({
      x: x * 3.2 + 50,
      y: y * 3.0 + 50,
      rotate: Math.sin(i * 1.73) * 12 + Math.cos(i * 0.91) * 6,
    })
  }
  const innerCount = n - outerCount
  for (let i = 0; i < innerCount; i++) {
    const t = (i / innerCount) * 2 * Math.PI + 0.3
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    positions.push({
      x: x * 1.65 + 50,
      y: y * 1.55 + 50,
      rotate: Math.cos(i * 2.1) * 8 + Math.sin(i * 1.4) * 6,
    })
  }
  return positions
}

function plasPop() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const now = ac.currentTime
    osc.connect(gain); gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520 + Math.random() * 280, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1)
    gain.gain.setValueAtTime(0.075, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.12)
    osc.start(now); osc.stop(now + 0.12)
  } catch (e) {}
}

function launchConfetti(canvas) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const colors = ['#ffffff','#ff66b2','#ff007f','#b30059','#ffd1e8','#ffda79','#c084fc']
  let raf
  canvas.style.opacity = '1'
  canvas.width = Math.floor(window.innerWidth * dpr)
  canvas.height = Math.floor(window.innerHeight * dpr)
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const parts = Array.from({ length: 120 }, () => ({
    x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 100,
    y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 6,
    vy: -3 - Math.random() * 4,
    gravity: 0.055 + Math.random() * 0.045,
    size: 5 + Math.random() * 9,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 9, life: 1,
    circle: Math.random() > 0.5,
  }))
  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity
      p.rot += p.rotV; p.life -= 0.005
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180)
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color
      ctx.shadowBlur = 8; ctx.shadowColor = p.color
      if (p.circle) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill() }
      else ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2)
      ctx.restore()
    })
    if (parts.some(p => p.life > 0 && p.y < window.innerHeight + 40))
      raf = requestAnimationFrame(draw)
  }
  draw()
  setTimeout(() => { cancelAnimationFrame(raf); canvas.style.opacity = '0' }, 5500)
}

function useHeartSize() {
  const [sizes, setSizes] = useState({ container: 400, card: 64 })
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const uiHeight = 156
      const availH = vh - uiHeight
      const availW = vw - 16
      const container = Math.floor(Math.min(availW, availH, 600))
      const card = Math.min(96, Math.max(56, Math.floor(container * 0.16)))
      setSizes({ container, card })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return sizes
}

function PhotoCard({ src, targetX, targetY, delay, rotate, fallback, cardSize }) {
  const [revealed, setRevealed] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => { plasPop(); setRevealed(true) }, delay)
    return () => clearTimeout(id)
  }, [delay])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        width: cardSize, height: cardSize,
        left: `${revealed ? targetX : 50}%`,
        top: `${revealed ? targetY : 50}%`,
        marginLeft: -cardSize / 2,
        marginTop: -cardSize / 2,
        borderRadius: Math.round(cardSize * 0.18),
        overflow: 'hidden',
        border: '3px solid rgba(255,255,255,.95)',
        boxShadow: hovered
          ? '0 0 28px rgba(255,0,127,1), 0 0 56px rgba(255,102,178,.7)'
          : '0 0 16px rgba(255,0,127,.85), 0 0 30px rgba(255,102,178,.4)',
        opacity: revealed ? 1 : 0,
        transform: revealed
          ? `scale(${hovered ? 1.14 : 1}) rotate(${rotate}deg)`
          : 'scale(.18) rotate(0deg)',
        transition: revealed
          ? 'left 1.05s cubic-bezier(.18,.82,.22,1), top 1.05s cubic-bezier(.18,.82,.22,1), opacity .32s ease, transform .3s ease, box-shadow .3s ease'
          : 'none',
        willChange: 'left, top, opacity, transform',
        zIndex: hovered ? 30 : 20,
        background: '#13000d',
        cursor: 'pointer',
      }}
    >
      {src && !imgErr ? (
        <img src={src} alt="" onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ff66b2',
          background: 'linear-gradient(135deg, rgba(255,102,178,.26), rgba(255,0,127,.12))',
          fontSize: Math.round(cardSize * 0.38),
        }}>{fallback}</div>
      )}
    </div>
  )
}

export default function HeartFinale() {
  const [titleVisible, setTitleVisible] = useState(false)
  const timers = useRef([])
  const confettiRef = useRef(null)
  const targetPos = useMemo(() => heartPositions(PHOTOS.length), [])
  const { container: containerSize, card: cardSize } = useHeartSize()

  useEffect(() => {
    const add = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id) }
    const allDone = 380 + PHOTOS.length * 75 + 1100
    add(() => setTitleVisible(true), allDone - 600)
    add(() => launchConfetti(confettiRef.current), allDone)
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [])

  return (
    <>
      <style>{`
        @keyframes subtlePulse {
          0%,100% { opacity:.55; transform:translateY(0); }
          50%      { opacity:.8; transform:translateY(-2px); }
        }
      `}</style>

      <canvas ref={confettiRef} style={{
        position: 'fixed', inset: 0, zIndex: 16,
        pointerEvents: 'none', opacity: 0, transition: 'opacity .65s ease',
      }} />

      <div className="scene" style={{
        zIndex: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '4px 8px',
        overflow: 'visible',
      }}>

        {/* Judul — Dancing Script, warna & style persis "Made for Farikha" */}
        <div style={{
          zIndex: 25, textAlign: 'center',
          marginBottom: 'clamp(4px, 1vh, 10px)',
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'all 0.8s cubic-bezier(.34,1.2,.64,1)',
        }}>
          <p style={{
            color: '#ffd1e8',
            fontSize: 'clamp(18px, 6vw, 24px)',
            fontFamily: "'Dancing Script', cursive",
            fontStyle: 'italic',
            fontWeight: 400,
            margin: 0,
            animation: titleVisible ? 'subtlePulse 4s ease-in-out infinite' : 'none',
          }}>
            Happy Birthday Farikha
          </p>
        </div>

        {/* Container foto heart */}
        <div style={{
          position: 'relative',
          width: containerSize,
          height: containerSize,
          flexShrink: 0,
          zIndex: 20,
          overflow: 'visible',
        }}>
          <svg style={{
            position: 'absolute', width: '100%', height: '100%',
            top: 0, left: 0, opacity: 0.12, zIndex: 5, pointerEvents: 'none',
            filter: 'drop-shadow(0 0 52px rgba(255,0,127,.95))',
          }} viewBox="0 0 200 200">
            <defs>
              <radialGradient id="hg" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#ff007f" />
                <stop offset="100%" stopColor="#b30059" />
              </radialGradient>
            </defs>
            <path d="M100,175C100,175 12,115 12,58C12,28 33,10 58,10C74,10 88,18 100,36C112,18 126,10 142,10C167,10 188,28 188,58C188,115 100,175 100,175Z" fill="url(#hg)" />
          </svg>

          {PHOTOS.map((photo, i) => (
            <PhotoCard
              key={`${photo}-${i}`}
              src={photo}
              targetX={targetPos[i].x}
              targetY={targetPos[i].y}
              rotate={targetPos[i].rotate}
              delay={320 + i * 75}
              fallback={FALLBACKS[i % FALLBACKS.length]}
              cardSize={cardSize}
            />
          ))}
        </div>
      </div>
    </>
  )
}