'use client'
import { useEffect, useRef, useState } from 'react'

// ── CONFIG ──────────────────────────────────────────────────
const WHATSAPP_NUMBER = '628814083757'
const WHATSAPP_MSG = '-'

const PHOTOS = [
  '/photos/1.jpeg', '/photos/2.jpeg', '/photos/3.jpeg',
  '/photos/4.jpeg', '/photos/5.jpeg', '/photos/6.jpeg',
  '/photos/1.jpeg', '/photos/2.jpeg', '/photos/3.jpeg',
  '/photos/4.jpeg', '/photos/5.jpeg', '/photos/6.jpeg',
  '/photos/1.jpeg', '/photos/2.jpeg', '/photos/3.jpeg',
]

const EMOJIS = ['😊','🌸','💕','😄','🌟','💖','😍','🎀','✨','🥰','💗','🌺','😘','💝','🎂']
// ────────────────────────────────────────────────────────────

// Heart parametric curve
function heartPositions(n) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))
    return { x: x * 2.5 + 50, y: y * 2.3 + 52 }
  })
}

// Edge positions for fly-in
function edgePositions(n) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2
    return { x: 50 + Math.cos(angle) * 80, y: 50 + Math.sin(angle) * 80 }
  })
}

function plasPop() {
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)()
    const o   = ac.createOscillator(), g = ac.createGain()
    o.connect(g); g.connect(ac.destination)
    const t = ac.currentTime
    o.type = 'sine'
    o.frequency.setValueAtTime(500 + Math.random() * 300, t)
    o.frequency.exponentialRampToValueAtTime(200, t + .1)
    g.gain.setValueAtTime(.1, t); g.gain.linearRampToValueAtTime(0, t + .12)
    o.start(t); o.stop(t + .12)
  } catch(e) {}
}

function launchConfetti() {
  const cv = document.getElementById('confetti-canvas')
  if (!cv) return
  cv.style.display = 'block'; cv.style.opacity = '1'
  cv.width = window.innerWidth; cv.height = window.innerHeight
  const ctx    = cv.getContext('2d')
  const colors = ['#ff69b4','#ff1493','#ffb6c1','#ff85c2','#c2185b','#fff','#ffd1e8','#b44fff']
  const parts  = Array.from({ length: 90 }, () => ({
    x: Math.random() * cv.width, y: -20,
    vx: (Math.random() - .5) * 4, vy: 1.5 + Math.random() * 4,
    size: 4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360, rotV: (Math.random() - .5) * 8,
    shape: Math.random() > .45 ? 'rect' : 'heart',
  }))
  let raf
  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height)
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180)
      ctx.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2)
      } else {
        const s = p.size * .4; ctx.beginPath()
        ctx.moveTo(0, s*2); ctx.bezierCurveTo(-s*2,s,-s*2,-s*.5,0,-s*.5)
        ctx.bezierCurveTo(s*2,-s*.5,s*2,s,0,s*2); ctx.fill()
      }
      ctx.restore()
      if (p.y > cv.height + 20) { p.y = -20; p.x = Math.random() * cv.width }
    })
    raf = requestAnimationFrame(draw)
  }
  draw()
  setTimeout(() => {
    cancelAnimationFrame(raf)
    cv.style.transition = 'opacity .6s'; cv.style.opacity = '0'
    setTimeout(() => { cv.style.display='none'; cv.style.opacity='1'; cv.style.transition='' }, 700)
  }, 6000)
}

// ── SINGLE PHOTO CARD — proper hook usage ───────────────────
function PhotoCard({ src, targetX, targetY, startX, startY, delay, emoji }) {
  const [revealed, setRevealed] = useState(false)
  const [imgErr,   setImgErr]   = useState(false)
  const sz = 'clamp(42px,8.5vw,64px)'

  useEffect(() => {
    const id = setTimeout(() => {
      plasPop()
      setRevealed(true)
    }, delay)
    return () => clearTimeout(id)
  }, [delay])

  return (
    <div style={{
      position:'absolute',
      width:sz, height:sz,
      left:  `${revealed ? targetX : startX}%`,
      top:   `${revealed ? targetY : startY}%`,
      marginLeft:`calc(${sz} / -2)`,
      marginTop: `calc(${sz} / -2)`,
      borderRadius:10, overflow:'hidden',
      border:'2.5px solid rgba(255,105,180,.9)',
      boxShadow:'0 0 14px rgba(255,20,147,.6)',
      opacity: revealed ? 1 : 0,
      transform: `scale(${revealed ? 1 : 0})`,
      transition: revealed
        ? 'left .7s cubic-bezier(.34,1.56,.64,1), top .7s cubic-bezier(.34,1.56,.64,1), opacity .35s ease, transform .6s cubic-bezier(.34,1.56,.64,1)'
        : 'none',
      zIndex:20,
    }}>
      {src && !imgErr ? (
        <img src={src} alt="" onError={() => setImgErr(true)}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', pointerEvents:'none' }} />
      ) : (
        <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,rgba(255,105,180,.25),rgba(255,20,147,.12))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(16px,3vw,24px)' }}>
          {emoji}
        </div>
      )}
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────
export default function HeartFinale() {
  const [ctaVisible, setCtaVisible] = useState(false)
  const timers = useRef([])
  const addT = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Pre-compute positions once
  const targetPos = useRef(heartPositions(PHOTOS.length))
  const startPos  = useRef(edgePositions(PHOTOS.length))

  useEffect(() => {
    const allDone = 300 + PHOTOS.length * 150 + 700
    addT(launchConfetti, allDone)
    addT(() => setCtaVisible(true), allDone + 600)
  }, []) // eslint-disable-line

  return (
    <div className="scene" style={{ zIndex:10, flexDirection:'column', gap:14 }}>
      {/* Glow bg */}
      <svg style={{ position:'absolute', width:'min(340px,76vw)', height:'auto', top:'50%', left:'50%', transform:'translate(-50%,-52%)', opacity:.08, zIndex:5, pointerEvents:'none', filter:'drop-shadow(0 0 50px rgba(255,20,147,.9))' }} viewBox="0 0 200 180">
        <defs><radialGradient id="hbg2" cx="50%" cy="38%" r="65%"><stop offset="0%" stopColor="#ff9ec8"/><stop offset="50%" stopColor="#ff1493"/><stop offset="100%" stopColor="#8b0057"/></radialGradient></defs>
        <path d="M100,162C100,162 10,108 10,55C10,26 30,8 55,8C70,8 83,16 100,34C117,16 130,8 145,8C170,8 190,26 190,55C190,108 100,162 100,162Z" fill="url(#hbg2)"/>
      </svg>

      {/* Photo heart */}
      <div style={{ position:'relative', width:'min(380px,86vw)', aspectRatio:'1', zIndex:20 }}>
        {PHOTOS.map((photo, i) => (
          <PhotoCard
            key={i}
            src={photo}
            targetX={targetPos.current[i].x}
            targetY={targetPos.current[i].y}
            startX={startPos.current[i].x}
            startY={startPos.current[i].y}
            delay={300 + i * 150}
            emoji={EMOJIS[i % EMOJIS.length]}
          />
        ))}
      </div>

      <div style={{ position:'relative', zIndex:20, textAlign:'center' }}>
        <p style={{ color:'#ff69b4', fontSize:'clamp(15px,3.5vw,24px)', fontWeight:700, letterSpacing:'3px', textShadow:'0 0 20px #ff1493', fontFamily:"'Playfair Display',serif" }}>
          ✨ Happy Birthday Alexsa ✨
        </p>
        <p style={{ color:'#ffb6c1', fontSize:12, marginTop:4, fontFamily:"'Share Tech Mono',monospace" }}>
          ❤️ Made with love ❤️
        </p>
      </div>

      {ctaVisible && (
        <div style={{ position:'relative', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', gap:10, animation:'fadeSlideUp .7s ease forwards' }}>
          <button className="btn" style={{ fontSize:'clamp(12px,2.5vw,15px)', padding:'13px 34px' }}
            onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`, '_blank')}>
            💌 Klik untuk kejutan terakhir
          </button>
          <button className="btn-sm" onClick={() => window.location.reload()}>🔄 Ulang dari Awal</button>
        </div>
      )}
    </div>
  )
}