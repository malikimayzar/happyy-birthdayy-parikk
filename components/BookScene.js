'use client'

import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFlip } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-flip'

const PAGES = [
  { type: 'cover', photo: '/photos/cover.png', 
    message: 'teruntuk Farikha, dari Maliki' },
  { type: 'content', photo: '/photos/1.png', 
    message: 'Selamat ulang tahun, Farikha...' },
  { type: 'content', photo: '/photos/2.png', 
    message: 'Semoga langkahmu selalu ringan dan hatimu selalu hangat.' },
  { type: 'content', photo: '/photos/3.png', 
    message: 'Terus tumbuh, terus bersinar, dan tetap jadi Farikha yang Lucu...' },
  { type: 'content', photo: '/photos/4.png', 
    message: 'Semoga hari-harimu selalu indah, Farikha.' },
  { type: 'back', photo: '/photos/back.png', 
    message: 'Tap buku untuk melanjutkan...' },
]

function PhotoCard({ photo, message, isCover, isBack, pageNum, total, isActive }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isActive || !message) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const startDelay = setTimeout(() => {
      timerRef.current = setInterval(() => {
        i++
        setDisplayed(message.slice(0, i))
        if (i >= message.length) {
          clearInterval(timerRef.current)
          setDone(true)
        }
      }, 45) 
    }, 400)

    return () => {
      clearTimeout(startDelay)
      clearInterval(timerRef.current)
    }
  }, [isActive, message])

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '12px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%',
        position: 'relative', overflow: 'hidden',
        borderRadius: '24px',
        background: '#111',
        backgroundImage: `url(${photo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>

        {/* Gradient buat teks */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }} />

        {/* Pesan dengan typewriter */}
        {message && (
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            padding: '0 20px', textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: '18px', color: '#fff', margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              minHeight: '28px',
            }}>
              {isActive ? displayed : message}

              {isActive && !done && (
                <span style={{
                  display: 'inline-block',
                  width: '2px', height: '18px',
                  background: '#ff69b4',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'cursorBlink 0.7s step-end infinite',
                }} />
              )}
            </p>
          </div>
        )}

        {/* Page indicator */}
        {!isCover && !isBack && (
          <div style={{
            position: 'absolute', top: 15, right: 15,
            color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'monospace'
          }}>
            {pageNum} / {total}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookScene({ onDone }) {
  const doneRef = useRef(false)
  const lastSwipeTime = useRef(0)
  const [slide, setSlide] = useState(0)
  const [tapped, setTapped] = useState(false) 
  const totalSlides = PAGES.length
  const contentPages = PAGES.filter(p => p.type === 'content')

  const handleSlideChange = (swiper) => {
    if (swiper.activeIndex === totalSlides - 2) {
      lastSwipeTime.current = Date.now()
    }
    if (swiper.activeIndex >= totalSlides - 1) {
      setSlide(swiper.activeIndex)
      return  
    }
    setSlide(swiper.activeIndex)
  }

  // Handler tap di back cover
  const handleBackTap = () => {
    if (slide < totalSlides - 1) return 
    if (tapped) return  
    setTapped(true)
    setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        onDone?.()
      }
    }, 1800) 
  }
  const cardW = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 320) : 300
  const cardH = Math.round(cardW * (16 / 9))

  return (
    <div className="scene" style={{ zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {/* position: relative ditambah di sini */}
      <div style={{ width: cardW, height: cardH, position: 'relative' }}>
        <Swiper
          effect="flip"
          grabCursor
          modules={[EffectFlip]}
          onSlideChange={handleSlideChange}
          speed={700}
          longSwipesRatio={0.4}
          threshold={30}
          flipEffect={{ slideShadows: true, limitRotation: true }}
          style={{ width: '100%', height: '100%' }}
        >
          {PAGES.map((p, i) => (
            <SwiperSlide key={i}>
              <PhotoCard 
                photo={p.photo} 
                message={p.message} 
                isCover={p.type === 'cover'}
                isBack={p.type === 'back'}
                pageNum={contentPages.findIndex(c => c === p) + 1}
                total={contentPages.length}
                isActive={slide === i}  
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Overlay tap di back cover */}
        {slide === totalSlides - 1 && (
          <div
            onClick={handleBackTap}
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Love frame muncul setelah tap */}
            {tapped && (
              <div style={{
                position: 'absolute', inset: 0,
                border: '4px solid #ff69b4',
                borderRadius: '24px',
                boxShadow: '0 0 30px rgba(255,105,180,.8), inset 0 0 30px rgba(255,105,180,.3)',
                animation: 'loveFrameIn 0.5s cubic-bezier(.34,1.56,.64,1) forwards',
                pointerEvents: 'none',
              }} />
            )}

            {/* Hearts burst dari tengah */}
            {tapped && ['❤️','💕','💗','💖','✨'].map((em, i) => (
              <div key={i} style={{
                position: 'absolute',
                fontSize: '1.6rem',
                animation: `heartBurst${i} 1.2s ease-out forwards`,
                pointerEvents: 'none',
              }}>{em}</div>
            ))}

            {/* Hint tap sebelum ditap */}
            {!tapped && (
              <p style={{
                position: 'absolute', bottom: 60,
                color: 'rgba(255,182,217,.7)',
                fontFamily: "'Dancing Script', cursive",
                fontSize: '14px',
                animation: 'subtlePulse 2s ease-in-out infinite',
                pointerEvents: 'none',
              }}></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}