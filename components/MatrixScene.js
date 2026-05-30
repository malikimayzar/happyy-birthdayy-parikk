'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = ['♥', '♥', '♡', '❣', '✦', '•']
const WORDS = ['HAPPY', 'BIRTHDAY', 'TO', 'Farikha', '🎂']
const RAIN_COLORS = ['#ff69b4', '#e0006f', '#9b0050', '#3a001a']

function playSfx() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ac.createOscillator()
    const gain = ac.createGain()
    const now = ac.currentTime
    oscillator.connect(gain)
    gain.connect(ac.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(740, now)
    oscillator.frequency.exponentialRampToValueAtTime(360, now + 0.12)
    gain.gain.setValueAtTime(0.14, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.16)
    oscillator.start(now)
    oscillator.stop(now + 0.16)
  } catch (e) {}
}

export default function MatrixScene({ onDone }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const timersRef = useRef([])
  const dropsRef = useRef([])
  const [ui, setUi] = useState({
    phase: 'matrix',
    countNum: null,
    countAnim: 'in',
    wordIdx: -1,
    wordAnim: 'in',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let running = true
    let width = 0
    let height = 0
    let dpr = 1
    let fontSize = 13
    let cols = 0

    const addTimer = (fn, ms) => {
      const id = setTimeout(fn, ms)
      timersRef.current.push(id)
      return id
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      fontSize = Math.max(13, Math.min(17, Math.floor(width / 40)))
      const colSpacing = fontSize * 0.55
      cols = Math.ceil(width / colSpacing) + 2

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      dropsRef.current = Array.from({ length: cols }, (_, i) => ({
        // FIX: sebagian kolom mulai dari atas langsung, sebagian dari atas layar
        y: Math.random() > 0.5
          ? Math.random() * -height       
          : Math.random() * height * 0.3, // sebagian sudah di tengah saat load
        speed: fontSize * (0.25 + Math.random() * 0.45), // kecepatan bervariasi = kesan rintik
        // FIX: trail jauh lebih panjang = menjuntai seperti referensi
        length: Math.floor(height / fontSize * (0.45 + Math.random() * 0.55)),
        colSpacing,
        x: i * colSpacing,
      }))
    }

    const draw = () => {
      if (!running) return

      // FIX: fade lebih ringan (0.08) = trail lebih panjang terlihat
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = `900 ${fontSize}px "Share Tech Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      dropsRef.current.forEach((drop) => {
        for (let j = 0; j < drop.length; j++) {
          const y = drop.y - j * fontSize
          if (y < -fontSize || y > height + fontSize) continue

          const head = j === 0
          const ratio = j / drop.length

          ctx.globalAlpha = head ? 1 : Math.max(0.04, 1 - ratio * 1.05)

          if (head) {
            // Ujung: putih-pink terang dengan glow
            ctx.fillStyle = '#ffe0f0'
            ctx.shadowBlur = 10
            ctx.shadowColor = '#ff69b4'
          } else if (ratio < 0.15) {
            ctx.fillStyle = '#ffb3d9'
            ctx.shadowBlur = 6
            ctx.shadowColor = '#ff007f'
          } else if (ratio < 0.35) {
            ctx.fillStyle = RAIN_COLORS[0]
            ctx.shadowBlur = 3
            ctx.shadowColor = '#c7006a'
          } else if (ratio < 0.65) {
            ctx.fillStyle = RAIN_COLORS[1]
            ctx.shadowBlur = 1
            ctx.shadowColor = '#8b0045'
          } else {
            // FIX: ekor bawah makin pudar ke gelap = kesan rintik menghilang
            ctx.fillStyle = RAIN_COLORS[2]
            ctx.shadowBlur = 0
            ctx.shadowColor = 'transparent'
          }

          ctx.fillText(
            CHARS[Math.floor(Math.random() * CHARS.length)],
            drop.x,
            y
          )
        }

        ctx.shadowBlur = 0
        drop.y += drop.speed

        // FIX: reset lebih cepat dan variatif = tidak ada jeda kosong
        if (drop.y - drop.length * fontSize > height) {
          if (Math.random() > 0.72) {
            drop.y = -fontSize * (2 + Math.random() * 8)
            drop.speed = fontSize * (0.55 + Math.random() * 0.9)
            drop.length = Math.floor(height / fontSize * (0.45 + Math.random() * 0.55))
          }
        }
      })

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    const runWords = (idx) => {
      setUi({ phase: 'words', countNum: null, countAnim: 'in', wordIdx: idx, wordAnim: 'in' })
      addTimer(() => {
        setUi((current) => ({ ...current, wordAnim: 'out' }))
        addTimer(() => {
          if (idx < WORDS.length - 1) {
            runWords(idx + 1)
            return
          }
          running = false
          canvas.style.opacity = '0'
          addTimer(() => onDone?.(), 850)
        }, 420)
      }, idx === WORDS.length - 1 ? 1900 : 1200)
    }

    const runCountdown = (num) => {
      playSfx()
      setUi({ phase: 'countdown', countNum: num, countAnim: 'in', wordIdx: -1, wordAnim: 'in' })
      addTimer(() => {
        setUi((current) => ({ ...current, countAnim: 'out' }))
        addTimer(() => {
          if (num > 1) runCountdown(num - 1)
          else runWords(0)
        }, 420)
      }, 980)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    addTimer(() => runCountdown(3), 1800)

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [onDone])

  const activeText = ui.phase === 'countdown' ? ui.countNum : WORDS[ui.wordIdx]
  const animationName = ui.phase === 'countdown'
    ? ui.countAnim === 'in' ? 'matrixCountIn' : 'matrixCountOut'
    : ui.wordAnim === 'in' ? 'matrixWordIn' : 'matrixWordOut'

  return (
    <div className="scene" style={{ zIndex: 10, background: '#000000' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          display: 'block',
          opacity: 1,
          transition: 'opacity 0.8s ease',
        }}
      />

      {activeText && (
        <div
          key={`${ui.phase}-${activeText}-${animationName}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            width: '100%',
            padding: '0 18px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              color: '#ff66b2',
              fontFamily: 'Impact, "Share Tech Mono", monospace',
              fontSize: ui.phase === 'countdown'
                ? 'clamp(112px, 30vw, 260px)'
                : 'clamp(44px, 12vw, 132px)',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: ui.phase === 'countdown' ? 0 : '0.04em',
              textShadow: '0 0 12px #ff007f, 0 0 25px #ff007f',
              animation: `${animationName} ${ui.phase === 'countdown' ? '0.5s' : '0.56s'} cubic-bezier(.22,1,.36,1) forwards`,
              willChange: 'opacity, transform, filter',
            }}
          >
            {activeText}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes matrixCountIn {
          0% { opacity: 0; transform: scale(2.1); filter: blur(12px) brightness(2.5); }
          62% { opacity: 1; transform: scale(0.94); filter: blur(0) brightness(1.4); }
          100% { opacity: 1; transform: scale(1); filter: blur(0) brightness(1); }
        }
        @keyframes matrixCountOut {
          0% { opacity: 1; transform: scale(1); filter: blur(0); }
          100% { opacity: 0; transform: scale(0.12); filter: blur(14px); }
        }
        @keyframes matrixWordIn {
          0% { opacity: 0; transform: scale(1.32) skewX(-7deg); filter: blur(14px) brightness(2.4); }
          32% { opacity: 1; transform: scale(1.05) skewX(4deg); filter: blur(0) brightness(1.8); }
          100% { opacity: 1; transform: scale(1) skewX(0); filter: drop-shadow(0 0 18px #ff007f); }
        }
        @keyframes matrixWordOut {
          0% { opacity: 1; transform: scale(1); filter: blur(0); }
          100% { opacity: 0; transform: scale(0.72); filter: blur(16px); }
        }
      `}</style>
    </div>
  )
}