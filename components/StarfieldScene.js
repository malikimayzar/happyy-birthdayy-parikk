'use client'
import { useEffect, useRef } from 'react'

export default function StarfieldScene({ onDone }) {
  const containerRef = useRef(null)
  const catRef = useRef(null)
  const textRef = useRef(null)
  const heartRef = useRef(null)

  useEffect(() => {
    // Simple CSS animation sequence without GSAP dependency issues
    const el = containerRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transition = 'opacity .8s ease'
    requestAnimationFrame(() => { el.style.opacity = '1' })

    const t1 = setTimeout(() => {
      if (textRef.current) { textRef.current.style.opacity = '1'; textRef.current.style.transform = 'translateY(0)' }
    }, 400)
    const t2 = setTimeout(() => {
      if (catRef.current) { catRef.current.style.opacity = '1'; catRef.current.style.transform = 'scale(1)' }
    }, 700)
    const t3 = setTimeout(() => {
      if (heartRef.current) { heartRef.current.style.opacity = '1'; heartRef.current.style.transform = 'scale(1)' }
    }, 1100)
    const t4 = setTimeout(() => {
      el.style.transition = 'opacity .7s ease, transform .7s ease'
      el.style.opacity = '0'; el.style.transform = 'translateY(-20px)'
      setTimeout(onDone, 750)
    }, 3800)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onDone])

  return (
    <div
      ref={containerRef}
      className="scene"
      style={{ zIndex: 10, opacity: 0, flexDirection: 'column', gap: 'clamp(8px,2vw,16px)' }}
    >
      {/* Floating ambient emojis */}
      {['🌙','⭐','✨','💫'].map((em, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: '1.5rem', opacity: .35, left: [12,80,20,75][i]+'%', top: [15,10,75,70][i]+'%', animation: `float ${2+i*.5}s ease-in-out infinite`, animationDelay: i*.7+'s' }}>{em}</div>
      ))}

      <div
        ref={textRef}
        style={{ opacity: 0, transform: 'translateY(-30px)', transition: 'all .7s ease', textAlign: 'center' }}
      >
        <p className="candle-text">🎂 HAPPY BIRTHDAY 🎂</p>
      </div>

      <div
        ref={catRef}
        className="birthday-cat"
        style={{ opacity: 0, transform: 'scale(.4)', transition: 'all .8s cubic-bezier(.34,1.56,.64,1)', textAlign: 'center' }}
      >
        🐱
      </div>

      <div
        ref={heartRef}
        style={{ opacity: 0, transform: 'scale(0)', transition: 'all .5s cubic-bezier(.34,1.56,.64,1)', fontSize: '2rem', textAlign: 'center', animation: '' }}
      >
        ❤️
      </div>
    </div>
  )
}
