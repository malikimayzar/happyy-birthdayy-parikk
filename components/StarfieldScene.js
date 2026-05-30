'use client'
import { useEffect, useRef } from 'react'

// Confetti item generator
function spawnConfetti(container) {
  const colors = ['#ff69b4','#ffb6c1','#ff1493','#c2185b','#fff','#ffda79','#b44fff']
  const shapes = ['circle','square','triangle']
  const el = document.createElement('div')
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = 6 + Math.random() * 8
  const left = Math.random() * 100
  const duration = 2.5 + Math.random() * 2
  const delay = Math.random() * 0.5

  el.style.cssText = `
    position:absolute;top:-20px;left:${left}%;
    width:${size}px;height:${size}px;
    background:${shape === 'triangle' ? 'transparent' : color};
    border-radius:${shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '0'};
    ${shape === 'triangle' ? `border-left:${size/2}px solid transparent;border-right:${size/2}px solid transparent;border-bottom:${size}px solid ${color};background:transparent;width:0;height:0;` : ''}
    pointer-events:none;z-index:5;
    animation:confettiFall ${duration}s ease-in ${delay}s forwards;
    --drift:${(Math.random()-0.5)*80}px;
    --rot:${Math.random()*360}deg;
  `
  container.appendChild(el)
  setTimeout(() => el.remove(), (duration + delay + 0.5) * 1000)
}

// Floating emoji dari bawah
function spawnDriftEmoji(container) {
  const emojis = ['🎈','🎉','🎊','🎁','🌟','💝']
  const el = document.createElement('div')
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
  const left = 5 + Math.random() * 90
  const duration = 4 + Math.random() * 3
  el.style.cssText = `
    position:absolute;bottom:-40px;left:${left}%;
    font-size:${20 + Math.random() * 16}px;
    pointer-events:none;z-index:5;opacity:0.7;
    animation:emojiDrift ${duration}s ease-out forwards;
    --driftX:${(Math.random()-0.5)*60}px;
  `
  container.appendChild(el)
  setTimeout(() => el.remove(), duration * 1000)
}

export default function StarfieldScene({ onDone }) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const catRef = useRef(null)
  const heartRef = useRef(null)
  const particleRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    const particleContainer = particleRef.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transition = 'opacity .8s ease'
    requestAnimationFrame(() => { el.style.opacity = '1' })

    const t1 = setTimeout(() => {
      if (textRef.current) {
        textRef.current.style.opacity = '1'
        textRef.current.style.transform = 'translateY(0)'
      }
    }, 400)

    const t2 = setTimeout(() => {
      if (catRef.current) {
        catRef.current.style.opacity = '1'
        catRef.current.style.transform = 'scale(1)'
        const video = catRef.current.querySelector('video')
        if (video) {
          video.muted = true
          video.play().catch(() => {})
        }
      }
    }, 700)

    const t3 = setTimeout(() => {
      if (heartRef.current) {
        heartRef.current.style.opacity = '1'
        heartRef.current.style.transform = 'scale(1)'
      }
    }, 1100)

    // Confetti interval
    const confettiInterval = setInterval(() => {
      if (particleContainer) spawnConfetti(particleContainer)
    }, 350)

    // Emoji drift interval
    const emojiInterval = setInterval(() => {
      if (particleContainer) spawnDriftEmoji(particleContainer)
    }, 200)

    const t4 = setTimeout(() => {
      clearInterval(confettiInterval)
      clearInterval(emojiInterval)
      el.style.transition = 'opacity .7s ease, transform .7s ease'
      el.style.opacity = '0'
      el.style.transform = 'translateY(-20px)'
      setTimeout(onDone, 750)
    }, 11000)

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      clearTimeout(t3); clearTimeout(t4)
      clearInterval(confettiInterval)
      clearInterval(emojiInterval)
    }
  }, [onDone])

  return (
    <>
      {/* Keyframes inline biar isolated */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes emojiDrift {
          0%   { transform: translateY(0) translateX(0); opacity: 0.7; }
          100% { transform: translateY(-110vh) translateX(var(--driftX)); opacity: 0; }
        }
        @keyframes shimmerText {
          0%,100% { text-shadow: 0 0 10px #ff69b4, 0 0 30px #ff1493, 0 0 60px rgba(255,20,147,.5); letter-spacing: .18em; }
          50%      { text-shadow: 0 0 20px #fff, 0 0 50px #ff69b4, 0 0 100px #ff1493, 0 0 150px rgba(255,20,147,.3); letter-spacing: .22em; }
        }
        @keyframes glitchText {
          0%,90%,100% { clip-path: none; transform: translateX(0); }
          92%          { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
          94%          { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
          96%          { clip-path: none; transform: translateX(-2px); }
        }
        @keyframes cardFloat {
          0%,100% { transform: scale(1) translateY(0px); }
          50%      { transform: scale(1) translateY(-10px); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px rgba(255,20,147,.4), 0 0 40px rgba(180,79,255,.2); }
          50%      { box-shadow: 0 0 40px rgba(255,20,147,.8), 0 0 80px rgba(180,79,255,.4), 0 0 120px rgba(255,105,180,.2); }
        }
      `}</style>

      <div
        ref={containerRef}
        className="scene"
        style={{ zIndex: 10, opacity: 0, flexDirection: 'column', gap: 'clamp(8px,2vw,16px)', overflow: 'hidden' }}
      >
        {/* Particle container */}
        <div ref={particleRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }} />

        {/* Ambient emojis */}
        {['🌙','⭐','✨','💫'].map((em, i) => (
          <div key={i} style={{
            position: 'absolute', fontSize: '1.5rem', opacity: .35,
            left: [12,80,20,75][i]+'%', top: [15,10,75,70][i]+'%',
            animation: `float ${2+i*.5}s ease-in-out infinite`,
            animationDelay: i*.7+'s', zIndex: 6,
          }}>
            {em}
          </div>
        ))}

        {/* Text HAPPY BIRTHDAY — shimmer + glitch */}
        <div
          ref={textRef}
          style={{
            opacity: 0, transform: 'translateY(-30px)',
            transition: 'all .7s ease', textAlign: 'center', position: 'relative', zIndex: 10,
          }}
        >
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 'clamp(11px, 2.2vw, 15px)',
            letterSpacing: '.18em',
            color: '#ffb6d9',
            margin: 0,
            animation: 'shimmerText 2.5s ease-in-out infinite, glitchText 5s ease-in-out infinite',
          }}>
            🎂 HAPPY BIRTHDAY 🎂
          </p>
        </div>

        {/* Cat Video — float + glow */}
        <div
          ref={catRef}
          style={{
            opacity: 0, transform: 'scale(.4)',
            transition: 'all .8s cubic-bezier(.34,1.56,.64,1)',
            textAlign: 'center', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            position: 'relative', zIndex: 10,
          }}
        >
          <div style={{
            borderRadius: '16px',
            animation: 'cardFloat 3s ease-in-out infinite, glowPulse 3s ease-in-out infinite',
            display: 'inline-block',
          }}>
            <video
              src="/video/cat-birthday.mp4"
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
              style={{
                width: 'clamp(160px, 38vw, 280px)',
                height: 'auto',
                borderRadius: '12px',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Cake emoji */}
        <div
          ref={heartRef}
          style={{
            opacity: 0, transform: 'scale(0)',
            transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
            fontSize: '2rem', textAlign: 'center', zIndex: 10,
            animation: heartRef.current ? 'heartPulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          🎂
        </div>
      </div>
    </>
  )
}