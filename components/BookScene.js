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

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 2 + (i % 3),
  x: 8 + (i * 7.5) % 84,
  y: 6 + (i * 11.3) % 88,
  dur: 3.5 + (i % 4),
  delay: -(i * 0.5),
  color: ['#fff8dc','#ffe4e1','#e0f7ff','#ffd6fa'][i % 4],
}))

function PhotoCard({ photo, message, isCover, isBack, pageNum, total, isActive }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)
  const [slideIn, setSlideIn] = useState(false)

  useEffect(() => {
    if (!isActive) { setSlideIn(false); return }
    const id = setTimeout(() => setSlideIn(true), 30)
    return () => clearTimeout(id)
  }, [isActive])

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
      transformStyle: 'preserve-3d',
      WebkitTransformStyle: 'preserve-3d',
      willChange: 'transform',
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)',
    }}>
      {/* Glow border: breath pulse */}
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        borderRadius: '26px',
        padding: '2px',
        background: isCover
          ? 'linear-gradient(135deg, #ff69b4, #87ceeb)'
          : isBack
          ? 'linear-gradient(135deg, #ff69b4, #c8a2c8)'
          : 'linear-gradient(135deg, rgba(255,182,217,0.6), rgba(135,206,235,0.6))',
        animation: isActive ? 'borderBreath 3s ease-in-out infinite' : 'none',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}>
        <div style={{
          width: '100%', height: '100%',
          position: 'relative', overflow: 'visible',
          borderRadius: '24px',
          background: '#111',
          backgroundImage: `url(${photo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          opacity: isActive ? (slideIn ? 1 : 0) : 1,
          transform: isActive ? (slideIn ? 'scale(1) translateZ(1px)' : 'scale(0.94) translateZ(1px)') : 'scale(1) translateZ(1px)',
          WebkitTransform: isActive ? (slideIn ? 'scale(1) translateZ(1px)' : 'scale(0.94) translateZ(1px)') : 'scale(1) translateZ(1px)',
          transition: 'opacity 500ms ease-out, transform 500ms cubic-bezier(0.34,1.2,0.64,1)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          WebkitMaskImage: '-webkit-radial-gradient(circle, white, black)',
          maskImage: 'radial-gradient(circle, white, black)',
        }}>

          {/* Gradient bawah biar teks terbaca */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: isCover ? '45%' : '38%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
            zIndex: 4,
          }} />

          {/* Teks — Dancing Script, no blur, no pill, shadow hitam tebal */}
          {message && (
            <div style={{
              position: 'absolute', bottom: 20, left: 0, right: 0,
              padding: '0 20px', textAlign: 'center',
              zIndex: 5,
            }}>
              <p style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: isCover ? '22px' : '20px',
                color: '#fff',
                margin: 0,
                fontWeight: 400,
                letterSpacing: '0.02em',
                textShadow: [
                  '0 1px 0 rgba(0,0,0,1)',
                  '0 2px 4px rgba(0,0,0,1)',
                  '0 4px 12px rgba(0,0,0,0.95)',
                  '1px 1px 0 rgba(0,0,0,0.9)',
                  '-1px -1px 0 rgba(0,0,0,0.9)',
                ].join(', '),
                minHeight: '28px',
                animation: isActive && done ? 'textOpacityPulse 3s ease-in-out infinite' : 'none',
                willChange: isActive && done ? 'opacity' : 'auto',
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

          {!isCover && !isBack && (
            <div style={{
              position: 'absolute', top: 15, right: 15,
              color: 'rgba(255,255,255,0.7)', fontSize: 10,
              fontFamily: 'monospace', zIndex: 5,
            }}>
              {pageNum} / {total}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookScene({ onDone }) {
  const doneRef = useRef(false)
  const lastSwipeTime = useRef(0)
  const flipSoundRef = useRef(null)
  const [slide, setSlide] = useState(0)
  const [tapped, setTapped] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = '/photos/cover.png'
    const onLoad = () => setTimeout(() => setReady(true), 150)
    if (img.complete) onLoad()
    else { img.onload = onLoad; img.onerror = onLoad }
    
    // Preload flip sound and attempt audio unlock
    if (flipSoundRef.current) {
      flipSoundRef.current.preload = 'auto'
      flipSoundRef.current.load()
    }
  }, [])

  const totalSlides = PAGES.length
  const contentPages = PAGES.filter(p => p.type === 'content')
  const [coverSwiped, setCoverSwiped] = useState(false)

  const handleSlideChange = (swiper) => {
    // Play flip sound with volume throttling for iOS
    if (flipSoundRef.current) {
      flipSoundRef.current.currentTime = 0
      flipSoundRef.current.volume = 0.4
      flipSoundRef.current.play().catch(() => {})
    }
    
    if (swiper.activeIndex === totalSlides - 2) {
      lastSwipeTime.current = Date.now()
    }
    if (swiper.activeIndex >= totalSlides - 1) {
      setSlide(swiper.activeIndex)
      return
    }
    if (swiper.activeIndex > 0) setCoverSwiped(true)
    setSlide(swiper.activeIndex)
  }

  const handleBackTap = () => {
    if (slide < totalSlides - 1) return
    if (tapped) return
    setTapped(true)
    if (!doneRef.current) {
      doneRef.current = true
      onDone?.()
    }
  }

  useEffect(() => {
    PAGES.forEach(p => {
      if (p.photo) {
        const img = new Image()
        img.src = p.photo
      }
    })
  }, [])

  const cardW = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 320) : 300
  const cardH = Math.round(cardW * (16 / 9))

  return (
    <>
      <style>{`
        .swiper-slide {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          overflow: visible !important;
          -webkit-overflow-scrolling: auto;
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .swiper-wrapper {
          overflow: visible !important;
        }
        @keyframes coverFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes loveFrameIn {
          0%   { opacity: 0; transform: scale(.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes particleTwinkle {
          0%   { opacity: 0;   transform: translateY(0px) scale(0.8); }
          40%  { opacity: 0.8; transform: translateY(-5px) scale(1.1); }
          100% { opacity: 0;   transform: translateY(-12px) scale(0.7); }
        }
        @keyframes rippleDrift1 {
          0%   { opacity: 0.4; }
          100% { opacity: 0.9; }
        }
        /* Breath pulse — redup → nyala → redup pelan */
        @keyframes borderBreath {
          0%, 100% {
            box-shadow:
              0 0 6px 1px rgba(255,105,180,0.3),
              0 0 0px 0px rgba(255,105,180,0);
          }
          50% {
            box-shadow:
              0 0 20px 4px rgba(255,105,180,0.8),
              0 0 40px 8px rgba(255,105,180,0.3),
              0 0 60px 12px rgba(200,150,255,0.15);
          }
        }
        @keyframes textOpacityPulse {
          0%, 100% { opacity: 0.88; }
          50%       { opacity: 1; }
        }
        @keyframes heartBurst0 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-60px,-80px) scale(0.3);opacity:0} }
        @keyframes heartBurst1 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(60px,-80px) scale(0.3);opacity:0} }
        @keyframes heartBurst2 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-80px,20px) scale(0.3);opacity:0} }
        @keyframes heartBurst3 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(80px,20px) scale(0.3);opacity:0} }
        @keyframes heartBurst4 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(0px,-100px) scale(0.3);opacity:0} }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div className="scene" style={{
        zIndex: 10, display: 'flex',
        justifyContent: 'center', alignItems: 'center', height: '100vh',
      }}>
        <div style={{
          willChange: ready ? 'transform' : 'auto',
          animation: ready && !coverSwiped && slide === 0
            ? 'coverFloat 3.5s ease-in-out infinite'
            : 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}>
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
              style={{
                width: '100%', height: '100%',
              }}
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

            {slide === totalSlides - 1 && (
              <div
                onClick={handleBackTap}
                style={{
                  position: 'absolute', inset: 0, zIndex: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
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
                {tapped && ['❤️','💕','💗','💖','✨'].map((em, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    fontSize: '1.6rem',
                    animation: `heartBurst${i} 1.2s ease-out forwards`,
                    pointerEvents: 'none',
                  }}>{em}</div>
                ))}
                {!tapped && (
                  <p style={{
                    position: 'absolute', bottom: 60,
                    color: 'rgba(255,182,217,.7)',
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: '14px',
                    animation: 'subtlePulse 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}