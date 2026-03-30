'use client'
import { useEffect, useRef } from 'react'

// Global heart cursor + sparkle trail — mount sekali di layout, aktif di semua scene
export default function CursorEffect() {
  const cursorRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const trail = trailRef.current
    if (!cursor || !trail) return
    let last = 0

    const move = (e) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
      const now = Date.now()
      if (now - last > 55) {
        last = now
        const sp = document.createElement('div')
        sp.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${4+Math.random()*5}px;height:${4+Math.random()*5}px;border-radius:50%;pointer-events:none;background:${Math.random()>.5?'#ff69b4':'#ffb6c1'};transform:translate(-50%,-50%);animation:sparkleTrail ${.35+Math.random()*.35}s ease forwards;z-index:99998;`
        trail.appendChild(sp)
        setTimeout(() => sp.remove(), 700)
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} id="custom-cursor">
        <svg viewBox="0 0 100 90">
          <path d="M50,82C50,82 5,52 5,28C5,13 16,4 28,4C37,4 45,9 50,17C55,9 63,4 72,4C84,4 95,13 95,28C95,52 50,82 50,82Z" fill="#ff69b4"/>
        </svg>
      </div>
      <div ref={trailRef} id="cursor-trail-container" />
    </>
  )
}