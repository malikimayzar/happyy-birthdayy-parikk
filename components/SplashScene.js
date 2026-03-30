'use client'
import { useEffect, useRef, useState } from 'react'

export default function SplashScene({ onEnter }) {
  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const trailRef = useRef(null)
  const [stars, setStars] = useState([]) // generate client-side only
  let lastTrail = useRef(0)

  useEffect(() => {
    // Generate stars client-side only (fix hydration mismatch)
    setStars(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur: Math.random() * 2 + 1.5,
      delay: Math.random() * 2,
    })))

    // Fade in
    const el = containerRef.current
    if (!el) return
    el.style.opacity = '0'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 1s ease'
      el.style.opacity = '1'
    })

    // Heart cursor + sparkle trail
    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
      const now = Date.now()
      if (now - lastTrail.current > 55 && trailRef.current) {
        lastTrail.current = now
        const sp = document.createElement('div')
        sp.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${4 + Math.random() * 5}px;height:${4 + Math.random() * 5}px;border-radius:50%;pointer-events:none;background:${Math.random() > .5 ? '#ff69b4' : '#ffb6c1'};transform:translate(-50%,-50%);animation:sparkleTrail ${.35 + Math.random() * .35}s ease forwards;z-index:99998;`
        trailRef.current.appendChild(sp)
        setTimeout(() => sp.remove(), 700)
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const handleClick = () => {
    const el = containerRef.current
    if (!el) return
    el.style.transition = 'opacity .6s ease, transform .6s ease'
    el.style.opacity = '0'
    el.style.transform = 'scale(1.04)'
    setTimeout(onEnter, 650)
  }

  return (
    <>
      <div ref={cursorRef} id="custom-cursor">
        <svg viewBox="0 0 100 90">
          <path d="M50,82C50,82 5,52 5,28C5,13 16,4 28,4C37,4 45,9 50,17C55,9 63,4 72,4C84,4 95,13 95,28C95,52 50,82 50,82Z" fill="#ff69b4"/>
        </svg>
      </div>
      <div ref={trailRef} id="cursor-trail-container" />

      <div
        ref={containerRef}
        onClick={handleClick}
        className="scene splash-bg"
        style={{ zIndex: 100, cursor: 'pointer', opacity: 0 }}
      >
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            left: s.x + '%', top: s.y + '%',
            width: s.size + 'px', height: s.size + 'px',
            '--dur': s.dur + 's', '--delay': s.delay + 's'
          }} />
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(16px,4vw,32px)', position: 'relative', zIndex: 10 }}>
          <h1 className="splash-text" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,6vw,70px)', lineHeight: 1.2, textAlign: 'center' }}>
            Something special<br />is waiting for you
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: "'Share Tech Mono', monospace", fontSize: 'clamp(10px,2vw,13px)', letterSpacing: '.2em' }}>
            — made with love —
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[0, .6, 1.2].map((d, i) => (
                <div key={i} className="tap-ring" style={{ position: 'absolute', animationDelay: d + 's' }} />
              ))}
              <span style={{ fontSize: 32, position: 'relative', zIndex: 2 }}>🌸</span>
            </div>
            <p style={{ color: 'rgba(255,45,120,.8)', fontFamily: "'Share Tech Mono', monospace", fontSize: 'clamp(10px,2vw,12px)', letterSpacing: '.3em', textTransform: 'uppercase' }}>
              Tap anywhere to begin
            </p>
          </div>
        </div>
      </div>
    </>
  )
}