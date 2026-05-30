'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import SpaceBg from '@/components/SpaceBg'
import CursorEffect from '@/components/CursorEffect'
import SplashScene from '@/components/SplashScene'
import MatrixScene from '@/components/MatrixScene'
import StarfieldScene from '@/components/StarfieldScene'
import BookScene from '@/components/BookScene'
import HeartFinale from '@/components/HeartFinale'
import MusicBtn from '@/components/MusicBtn'
import NavDots from '@/components/NavDots'

const TOTAL = 5

// FIX: count dikurangi 10-16 → 5-7, lebih ringan
function spawnBurst(x, y) {
  const symbols = ['❤️','💕','✨','💗','⭐','🌸']
  const count = 5 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8
    const speed = 60 + Math.random() * 90
    const dx = Math.cos(angle) * speed
    const dy = Math.sin(angle) * speed
    const size = 14 + Math.random() * 12
    const sym = symbols[Math.floor(Math.random() * symbols.length)]
    el.textContent = sym
    el.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      font-size:${size}px;pointer-events:none;z-index:99996;
      transform:translate(-50%,-50%);
      animation:burstFly 0.8s ease-out forwards;
      --dx:${dx}px;--dy:${dy}px;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 850)
  }
}

// FIX: glitch disederhanakan jadi simple fade, hapus skew & filter berat
function triggerGlitch() {
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;inset:0;z-index:99990;pointer-events:none;
    background:rgba(255,20,147,0.08);
    animation:simpleFade 0.3s ease-out forwards;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 320)
}

function AudioController({ audioRef, onReady }) {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    onReady({
      start: () => {
        if (!audioRef.current) return
        audioRef.current.volume = 0.35
        audioRef.current.play().then(() => { setPlaying(true); setVisible(true) }).catch(() => {})
      },
      show: () => setVisible(true),
    })
  }, [])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  if (!visible) return null
  return <MusicBtn playing={playing} onToggle={toggle} />
}

export default function Home() {
  const [scene, setScene] = useState(0)
  const audioRef = useRef(null)
  const audioCtrlRef = useRef(null)
  const sceneRef = useRef(0)

  useEffect(() => { sceneRef.current = scene }, [scene])

  // FIX: disable burst saat Matrix (scene 1) karena canvas sudah berat
  useEffect(() => {
    const handler = (e) => {
      if (sceneRef.current === 1) return
      const x = e.clientX ?? e.touches?.[0]?.clientX
      const y = e.clientY ?? e.touches?.[0]?.clientY
      if (x !== undefined) spawnBurst(x, y)
    }
    window.addEventListener('click', handler)
    window.addEventListener('touchend', handler)
    return () => {
      window.removeEventListener('click', handler)
      window.removeEventListener('touchend', handler)
    }
  }, [])

  useEffect(() => {
    if (scene !== 4) return
    const interval = setInterval(() => {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;pointer-events:none;font-size:1.4rem;bottom:0;left:${Math.random()*100}vw;z-index:9999;animation:miniFloat 3s ease-out forwards;`
      el.textContent = ['❤️','💕','💗','💖'][Math.floor(Math.random()*4)]
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3200)
    }, 500)
    return () => clearInterval(interval)
  }, [scene])

  const goScene = useCallback((n) => {
    if (n >= 0 && n < TOTAL) {
      triggerGlitch()
      setScene(n)
    }
  }, [])

  return (
    <>
      <SpaceBg />
      <CursorEffect />
      <audio ref={audioRef} loop src="/music/bg.mp3" preload="auto" />
      <AudioController audioRef={audioRef} onReady={(ctrl) => { audioCtrlRef.current = ctrl }} />

      {scene > 1 && <NavDots total={TOTAL-2} current={scene-2} onGo={(i) => goScene(i+2)} />}
      {scene > 1 && <div id="swipe-hint">swipe ›</div>}

      {scene === 0 && (
        <SplashScene onEnter={() => {
          audioCtrlRef.current?.start()
          goScene(1)
        }} />
      )}
      {scene === 1 && <MatrixScene onDone={() => goScene(2)} />}
      {scene === 2 && <StarfieldScene onDone={() => goScene(3)} />}
      {scene === 3 && <BookScene onDone={() => goScene(4)} />}
      {scene === 4 && <HeartFinale />}

      <style>{`
        @keyframes simpleFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  )
}