'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export default function StarfieldScene({ onDone }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [entered, setEntered] = useState(false)

  // ─ Callback Ref: Immediate DOM-level autoplay during injection phase (bypasses timing issues) ─
  const videoRefCallback = useCallback((node) => {
    if (node) {
      // 1. Force absolute silence at the strict DOM level immediately
      node.muted = true
      node.defaultMuted = true
      node.setAttribute('muted', '1')
      node.playsInline = true
      node.setAttribute('playsinline', 'true')
      node.setAttribute('webkit-playsinline', 'true')

      // 2. Fire play immediately during the DOM injection phase
      node.play().catch((err) => {
        console.log('Autoplay blocked by strict iOS policy (e.g. Low Power Mode), keeping touchstart fallback active:', err)
      })

      // Store the node in a standard ref for later use
      videoRef.current = node
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transition = 'opacity .8s ease'
    requestAnimationFrame(() => { el.style.opacity = '1' })

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

  // ─ Low Power Mode Fallback: Trigger video play on first touch if autoplay fails ─
  useEffect(() => {
    if (!entered) return

    const video = videoRef.current
    if (!video) return

    let playAttempted = false
    let touchListenerAttached = false

    const attemptPlay = () => {
      if (playAttempted) return
      playAttempted = true

      video.play().then(() => {
        // Play succeeded; remove touch listener if it exists
        if (touchListenerAttached) {
          window.removeEventListener('touchstart', handleTouchFallback, { once: true })
          touchListenerAttached = false
        }
      }).catch((error) => {
        // Play failed (likely Low Power Mode on iOS)
        // Attach one-time touchstart listener as fallback
        if (!touchListenerAttached) {
          touchListenerAttached = true
          window.addEventListener('touchstart', handleTouchFallback, { once: true })
        }
      })
    }

    const handleTouchFallback = () => {
      touchListenerAttached = false
      video.play().catch(() => {})
    }

    // Initial play attempt after a brief delay to ensure video is ready
    const playTimer = setTimeout(attemptPlay, 150)

    return () => {
      clearTimeout(playTimer)
      if (touchListenerAttached) {
        window.removeEventListener('touchstart', handleTouchFallback)
        touchListenerAttached = false
      }
    }
  }, [entered])

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
          ref={videoRefCallback}
          src="/video/cat-birthday.mp4"
          autoPlay
          loop
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