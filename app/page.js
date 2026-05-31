'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import MusicBtn from '../components/MusicBtn'
import NavDots from '../components/NavDots'

const SpaceBg = dynamic(() => import('../components/SpaceBg'), { ssr: false })
const CursorEffect = dynamic(() => import('../components/CursorEffect'), { ssr: false })
const SplashScene = dynamic(() => import('../components/SplashScene'), { ssr: false })
const MatrixScene = dynamic(() => import('../components/MatrixScene'), { ssr: false })
const StarfieldScene = dynamic(() => import('../components/StarfieldScene'), { ssr: false })
const BookScene = dynamic(() => import('../components/BookScene'), { ssr: false })
const HeartFinale = dynamic(() => import('../components/HeartFinale'), {
  ssr: false,
  loading: () => null,
})

const TOTAL = 5

function spawnBurst(x, y) {
  const symbols = ['❤️', '💕', '✨', '💗', '⭐', '🌸']
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

function triggerGlitch() {
  const body = document.body
  body.classList.add('glitch-active')
  setTimeout(() => body.classList.remove('glitch-active'), 320)
}

function AudioController({ audioRef, onReady }) {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    onReady({
      start: () => {
        if (!audioRef.current) return
        audioRef.current.volume = 0.35
        audioRef.current
          .play()
          .then(() => { setPlaying(true); setVisible(true) })
          .catch(() => {})
      },
      show: () => setVisible(true),
    })
  }, [onReady])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  if (!visible) return null
  return <MusicBtn playing={playing} onToggle={toggle} />
}

export default function Home() {
  const [scene, setScene] = useState(0)
  const [renderedScene, setRenderedScene] = useState(0)
  const [fadeOpacity, setFadeOpacity] = useState(0)
  const audioRef = useRef(null)
  const audioCtrlRef = useRef(null)
  const sceneRef = useRef(0)
  const fadingRef = useRef(false) 

  useEffect(() => {
    sceneRef.current = scene
  }, [scene])

  useEffect(() => {
    const handler = (e) => {
      if (sceneRef.current === 1) return
      if (fadingRef.current) return 
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
      el.style.cssText = `position:fixed;pointer-events:none;font-size:1.4rem;bottom:0;left:${Math.random() * 100}vw;z-index:9999;animation:miniFloat 3s ease-out forwards;`
      el.textContent = ['❤️', '💕', '💗', '💖'][Math.floor(Math.random() * 4)]
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3200)
    }, 500)
    return () => clearInterval(interval)
  }, [scene])

  useEffect(() => {
    if (renderedScene === 3) {
      import('../components/HeartFinale').catch(() => {})
    }
  }, [renderedScene])

  const goScene = useCallback((n) => {
    if (n < 0 || n >= TOTAL) return

    if (n === 4) {
      fadingRef.current = true   
      setScene(4)
      setFadeOpacity(1)
      setTimeout(() => setRenderedScene(4), 350)
      setTimeout(() => {
        setFadeOpacity(0)
        fadingRef.current = false 
      }, 700)
      return
    }

    triggerGlitch()
    setScene(n)
    setRenderedScene(n)
  }, [])

  return (
    <>
      <SpaceBg />
      <CursorEffect />
      <audio ref={audioRef} loop src="/music/bg.mp3" preload="auto" />
      <AudioController audioRef={audioRef} onReady={(ctrl) => { audioCtrlRef.current = ctrl }} />

      {scene > 1 && <NavDots total={TOTAL - 2} current={scene - 2} onGo={(i) => goScene(i + 2)} />}

      {renderedScene === 0 && (
        <SplashScene onEnter={() => { audioCtrlRef.current?.start(); goScene(1) }} />
      )}
      {renderedScene === 1 && <MatrixScene onDone={() => goScene(2)} />}
      {renderedScene === 2 && <StarfieldScene onDone={() => goScene(3)} />}
      {renderedScene === 3 && <BookScene onDone={() => goScene(4)} />}
      {renderedScene === 4 && <HeartFinale />}

      {/* Fade overlay hitam — jembatan antar scene */}
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 99999,
        background: '#000',
        opacity: fadeOpacity,
        pointerEvents: fadeOpacity > 0 ? 'all' : 'none',
        transition: fadeOpacity === 1
          ? 'opacity 350ms ease-in'
          : 'opacity 500ms ease-out',
        willChange: 'opacity',
      }} />

      <style>{`
        .glitch-active::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 99990;
          pointer-events: none;
          background: rgba(255, 20, 147, 0.08);
        }
      `}</style>
    </>
  )
}