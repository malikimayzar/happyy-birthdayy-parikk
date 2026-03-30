'use client'
import { useEffect, useRef, useState } from 'react'

const CHARS = '♥✿❤HAPPYBIRTHDAYTOAlexsa0123456789♡✦★@#$%&'
const WORDS = ['HAPPY', 'BIRTHDAY', 'TO', 'Alexsa']

function playSfx() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const o = ac.createOscillator(), g = ac.createGain()
    o.connect(g); g.connect(ac.destination)
    const t = ac.currentTime
    o.type = 'sine'
    o.frequency.setValueAtTime(700, t)
    o.frequency.exponentialRampToValueAtTime(350, t + .1)
    g.gain.setValueAtTime(.18, t); g.gain.linearRampToValueAtTime(0, t + .15)
    o.start(t); o.stop(t + .15)
  } catch(e) {}
}

export default function MatrixScene({ onDone }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const timersRef = useRef([])
  const [ui, setUi] = useState({
    phase: 'matrix', countNum: null, countAnim: 'in', wordIdx: -1, wordAnim: 'in'
  })

  const addT = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return

    // Ukuran canvas = ukuran window
    const W = window.innerWidth
    const H = window.innerHeight
    cv.width = W
    cv.height = H

    const ctx = cv.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    const fontSize = 14
    const cols = Math.floor(W / fontSize)
    const drops = Array(cols).fill(1)

    let running = true

    const draw = () => {
      if (!running) return
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < cols; i++) {
        const c = CHARS[Math.floor(Math.random() * CHARS.length)]
        const r = Math.random()
        ctx.fillStyle = r>.93?'#fff':r>.78?'#ff9ec8':r>.55?'#ff1493':r>.25?'#cc0077':'#660033'
        ctx.font = `${fontSize}px monospace`
        ctx.fillText(c, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > H && Math.random() > .975) drops[i] = 0
        drops[i]++
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    // ── Sequence ──
    const runWords = (idx) => {
      setUi({ phase: 'words', countNum: null, countAnim: 'in', wordIdx: idx, wordAnim: 'in' })
      const hold = idx === WORDS.length - 1 ? 1800 : 900
      addT(() => {
        setUi(u => ({ ...u, wordAnim: 'out' }))
        addT(() => {
          if (idx < WORDS.length - 1) {
            runWords(idx + 1)
          } else {
            running = false
            cv.style.transition = 'opacity .8s ease'
            cv.style.opacity = '0'
            addT(onDone, 900)
          }
        }, 400)
      }, 550 + hold)
    }

    const runCountdown = (n) => {
      playSfx()
      setUi({ phase: 'countdown', countNum: n, countAnim: 'in', wordIdx: -1, wordAnim: 'in' })
      addT(() => {
        setUi(u => ({ ...u, countAnim: 'out' }))
        addT(() => {
          if (n > 1) runCountdown(n - 1)
          else runWords(0)
        }, 400)
      }, 1050)
    }

    addT(() => runCountdown(3), 2000)

    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, []) // eslint-disable-line

  const countStyle = {
    animation: ui.countAnim === 'in'
      ? 'countPop .5s cubic-bezier(.34,1.56,.64,1) forwards'
      : 'countOut .4s ease forwards'
  }
  const wordStyle = {
    animation: ui.wordAnim === 'in'
      ? 'glitchIn .55s cubic-bezier(.25,.46,.45,.94) forwards'
      : 'glitchOut .4s ease forwards'
  }

  return (
    <div className="scene" style={{ zIndex: 10, background: '#000' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2, display: 'block' }}
      />

      {ui.phase === 'countdown' && ui.countNum !== null && (
        <div style={{ position: 'relative', zIndex: 20, textAlign: 'center' }}>
          <div id="count-num" key={`c-${ui.countNum}-${ui.countAnim}`} style={countStyle}>
            {ui.countNum}
          </div>
        </div>
      )}

      {ui.phase === 'words' && ui.wordIdx >= 0 && (
        <div style={{ position: 'relative', zIndex: 20, textAlign: 'center' }}>
          <div id="word-display" key={`w-${ui.wordIdx}-${ui.wordAnim}`} style={wordStyle}>
            {WORDS[ui.wordIdx]}
          </div>
        </div>
      )}
    </div>
  )
}