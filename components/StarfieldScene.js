'use client'
import { useEffect, useRef, useState } from 'react'

export default function StarfieldScene({ onDone }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transition = 'opacity .8s ease'
    requestAnimationFrame(() => { el.style.opacity = '1' })

    const video = videoRef.current
    if (video) {
      video.muted = true
      video.play().catch(() => {})
    }

    const enterFrame = requestAnimationFrame(() => {
      setTimeout(() => setEntered(true), 80)
    })

    const t = setTimeout(() => {
      el.style.transition = 'opacity .7s ease'
      el.style.opacity = '0'
      setTimeout(onDone, 750)
    }, 11000)

    return () => {
      clearTimeout(t)
      cancelAnimationFrame(enterFrame)
    }
  }, [onDone])

  return (
    <div
      ref={containerRef}
      className="scene"
      style={{ 
        zIndex: 10, 
        opacity: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
        animation: 'float 4s ease-in-out infinite',
        willChange: 'transform',
      }}
    >

      {/* ── NEW: card wrapper dengan pop-in + gentle pulse ── */}
      <div style={{
        willChange: 'transform, opacity',
        opacity: entered ? 1 : 0,
        transform: entered ? 'scale(1)' : 'scale(0.95)',
        transition: entered
          ? 'opacity 600ms ease-out, transform 600ms ease-out'
          : 'none',
        animation: entered ? 'cardPulse 3.5s ease-in-out 600ms infinite' : 'none',
      }}>
        <video
          ref={videoRef}
          src="/video/cat-birthday.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            width: 'clamp(200px, 60vw, 360px)',
            height: 'auto',
            borderRadius: '16px',
            display: 'block',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}