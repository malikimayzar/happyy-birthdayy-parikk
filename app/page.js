'use client'
import { useState, useEffect, useRef } from 'react'
import SpaceBg from '@/components/SpaceBg'
import CursorEffect from '@/components/CursorEffect'
import SplashScene from '@/components/SplashScene'
import MatrixScene from '@/components/MatrixScene'
import VideoScene from '@/components/VideoScene'
import StarfieldScene from '@/components/StarfieldScene'
import BookScene from '@/components/BookScene'
import HeartFinale from '@/components/HeartFinale'
import MusicBtn from '@/components/MusicBtn'
import NavDots from '@/components/NavDots'

const TOTAL = 6

export default function Home() {
  const [scene, setScene] = useState(0)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (scene !== 5) return
    const interval = setInterval(() => {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;pointer-events:none;font-size:1.4rem;bottom:0;left:${Math.random()*100}vw;z-index:9999;animation:miniFloat 3s ease-out forwards;`
      el.textContent = ['❤️','💕','💗','💖'][Math.floor(Math.random()*4)]
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3200)
    }, 500)
    return () => clearInterval(interval)
  }, [scene])

  const startMusic = () => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.35
    audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {})
  }

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause(); setMusicPlaying(false)
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {})
    }
  }

  const goScene = (n) => { if (n >= 0 && n < TOTAL) setScene(n) }

  return (
    <>
      <SpaceBg />
      <CursorEffect />  {/* ← global, aktif di semua scene */}
      {scene > 0 && <MusicBtn playing={musicPlaying} onToggle={toggleMusic} />}
      {scene > 1 && <NavDots total={TOTAL-2} current={scene-2} onGo={(i) => goScene(i+2)} />}
      {scene > 1 && <div id="swipe-hint">swipe ›</div>}
      <audio ref={audioRef} loop src="/music/bg.mp3" preload="auto" />

      {scene === 0 && <SplashScene onEnter={() => { startMusic(); goScene(1) }} />}
      {scene === 1 && <MatrixScene onDone={() => goScene(2)} />}
      {scene === 2 && <VideoScene onDone={() => goScene(3)} />}
      {scene === 3 && <StarfieldScene onDone={() => goScene(4)} />}
      {scene === 4 && <BookScene onDone={() => goScene(5)} />}
      {scene === 5 && <HeartFinale />}
    </>
  )
}