'use client'
import { useEffect, useRef, useState } from 'react'

// ── CONFIG ──────────────────────────────────────────────────
const BOOK_PHOTOS = [
  '/photos/1.jpeg', '/photos/2.jpeg',
  '/photos/3.jpeg', '/photos/4.jpeg',
  '/photos/5.jpeg', '/photos/6.jpeg',
]
const PAGE_MESSAGES = [
  'Selamat Ulang Tahun, Nabilla Alexsandra.',
  'Selamat Ulang Tahun, Varsha.',
  'Teruslah tumbuh, Teruslah Melangkah, dan Teruslah berbahagia.',
]
// ────────────────────────────────────────────────────────────

function playSfx() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    const now = ctx.currentTime
    o.type = 'triangle'
    o.frequency.setValueAtTime(600, now)
    o.frequency.exponentialRampToValueAtTime(300, now + .2)
    g.gain.setValueAtTime(.1, now); g.gain.linearRampToValueAtTime(0, now + .25)
    o.start(now); o.stop(now + .25)
  } catch(e) {}
}

// ── SAFE PHOTO SLOT ──────────────────────────────────────────
function PhotoSlot({ src }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div style={{ flex:1, borderRadius:8, background:'linear-gradient(135deg,#ffe0f0,#ffc0d8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, minHeight:0, overflow:'hidden' }}>
        💕
      </div>
    )
  }
  return (
    <div style={{ flex:1, borderRadius:8, overflow:'hidden', minHeight:0, position:'relative' }}>
      <img src={src} alt="" onError={() => setErr(true)}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
    </div>
  )
}

// ── HANDS ILLUSTRATION ───────────────────────────────────────
function HandsIllustration() {
  return (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg"
      style={{ width:'85%', maxWidth:220, height:'auto' }}>
      <g transform="translate(0,10)">
        <ellipse cx="62" cy="120" rx="32" ry="22" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5"/>
        <ellipse cx="32" cy="108" rx="9" ry="14" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-25,32,108)"/>
        <rect x="38" y="76" width="14" height="36" rx="7" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-8,45,94)"/>
        <rect x="52" y="72" width="14" height="40" rx="7" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-2,59,92)"/>
        <rect x="66" y="76" width="13" height="37" rx="6.5" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(5,72,94)"/>
        <rect x="79" y="84" width="11" height="30" rx="5.5" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(12,85,99)"/>
      </g>
      <g transform="translate(200,10) scale(-1,1)">
        <ellipse cx="62" cy="120" rx="32" ry="22" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5"/>
        <ellipse cx="32" cy="108" rx="9" ry="14" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-25,32,108)"/>
        <rect x="38" y="76" width="14" height="36" rx="7" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-8,45,94)"/>
        <rect x="52" y="72" width="14" height="40" rx="7" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(-2,59,92)"/>
        <rect x="66" y="76" width="13" height="37" rx="6.5" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(5,72,94)"/>
        <rect x="79" y="84" width="11" height="30" rx="5.5" fill="#FFCBA4" stroke="#f0a080" strokeWidth="1.5" transform="rotate(12,85,99)"/>
      </g>
      <g transform="translate(100,72) scale(1.1)">
        <path d="M0,8 C0,-4 -14,-8 -14,2 C-14,10 0,22 0,22 C0,22 14,10 14,2 C14,-8 0,-4 0,8 Z" fill="#ff4d6d" stroke="#cc2244" strokeWidth="1"/>
        <ellipse cx="-5" cy="3" rx="3" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(-20,-5,3)"/>
      </g>
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════
//  MOBILE BOOK — Card-based dengan animasi cover flip CSS 3D
// ═══════════════════════════════════════════════════════════
function MobileBook({ onDone }) {
  // state: 'cover' | 'page0' | 'page1' | 'page2' | 'closing'
  const [state, setState]         = useState('cover')
  const [coverFlipped, setCoverFlipped] = useState(false)
  const [pageAnim, setPageAnim]   = useState('in')
  const [pageIdx, setPageIdx]     = useState(0)
  const doneRef = useRef(false)
  const timers  = useRef([])
  const addT    = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Auto-flip cover on mount
  useEffect(() => {
    addT(() => {
      playSfx()
      setCoverFlipped(true)
      addT(() => setState('page0'), 700)
    }, 600)
  }, []) // eslint-disable-line

  const nextPage = () => {
    playSfx()
    if (pageIdx < PAGE_MESSAGES.length - 1) {
      setPageAnim('out')
      addT(() => {
        setPageIdx(i => i + 1)
        setPageAnim('in')
      }, 350)
    } else {
      // Last page → close cover animation → done
      if (doneRef.current) return
      doneRef.current = true
      setPageAnim('out')
      addT(() => {
        setState('closing')
        setCoverFlipped(false)  // cover flips back (close)
        addT(onDone, 800)
      }, 350)
    }
  }

  const prevPage = () => {
    if (pageIdx === 0) return
    playSfx()
    setPageAnim('out')
    addT(() => {
      setPageIdx(i => i - 1)
      setPageAnim('in')
    }, 350)
  }

  const cardH = 'clamp(180px,52vw,280px)'

  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      gap:16, width:'100%', maxWidth:'94vw', position:'relative', zIndex:20,
      padding: '0 12px',
    }}>

      {/* ── COVER (flips open) ── */}
      <div style={{
        width: '100%',
        perspective: '800px',
        // Hide cover after it's flipped and page is showing
        display: state === 'cover' || state === 'closing' ? 'block' : 'none',
      }}>
        <div style={{
          width:'100%',
          transformStyle: 'preserve-3d',
          transition: 'transform .7s cubic-bezier(.645,.045,.355,1)',
          transform: coverFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          position: 'relative',
          height: 'clamp(240px,65vw,340px)',
        }}>
          {/* Cover Front — hands illustration */}
          <div style={{
            position:'absolute', inset:0,
            background:'#fff',
            borderRadius:16,
            backfaceVisibility:'hidden',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'flex-end',
            paddingBottom:16,
            boxShadow:'0 0 40px rgba(255,20,147,.3), 0 8px 32px rgba(0,0,0,.4)',
            overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'30%', background:'linear-gradient(180deg,rgba(255,182,193,.1),transparent)' }}/>
            <HandsIllustration />
          </div>

          {/* Cover Back (inside) */}
          <div style={{
            position:'absolute', inset:0,
            background:'#fdf0f6',
            borderRadius:16,
            backfaceVisibility:'hidden',
            transform:'rotateY(180deg)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontSize:48 }}>💕</span>
          </div>
        </div>
      </div>

      {/* ── BOOK PAGES ── */}
      {(state === 'page0' || state === 'page1' || state === 'page2') && (
        <div
          key={pageIdx}
          style={{
            width: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid rgba(255,105,180,.4)',
            boxShadow: '0 0 30px rgba(255,20,147,.35)',
            background: '#fdf6fa',
            animation: pageAnim === 'in'
              ? 'cardSlideIn .4s ease forwards'
              : 'cardSlideOut .35s ease forwards',
          }}
        >
          {/* Caption */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(255,105,180,.15),rgba(255,20,147,.06))',
            borderBottom: '1px solid rgba(255,105,180,.2)',
            padding: '12px 16px', textAlign: 'center',
            color: '#c2185b', fontStyle: 'italic',
            fontSize: 'clamp(12px,3.5vw,15px)', lineHeight: 1.5,
            fontFamily: "'Dancing Script', cursive",
          }}>
            {PAGE_MESSAGES[pageIdx]}
          </div>

          {/* Photos */}
          <div style={{ display:'flex', gap:8, padding:10, height: cardH, overflow:'hidden' }}>
            <PhotoSlot src={BOOK_PHOTOS[pageIdx * 2]} />
            <PhotoSlot src={BOOK_PHOTOS[pageIdx * 2 + 1]} />
          </div>
        </div>
      )}

      {/* ── PAGE INDICATOR & CONTROLS ── */}
      {state !== 'cover' && state !== 'closing' && (
        <>
          <div style={{ color:'rgba(255,182,193,.6)', fontSize:11, letterSpacing:'3px', fontFamily:"'Share Tech Mono',monospace" }}>
            {pageIdx + 1} / {PAGE_MESSAGES.length}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-sm" style={{ opacity: pageIdx === 0 ? .4 : 1 }} onClick={prevPage}>
              ◀ Prev
            </button>
            <button className="btn" onClick={nextPage} style={{ padding:'10px 22px', fontSize:13 }}>
              {pageIdx === PAGE_MESSAGES.length - 1 ? 'Selesai ✨' : 'Selanjutnya ▶'}
            </button>
          </div>
        </>
      )}

      {state === 'cover' && (
        <p style={{ color:'rgba(255,182,193,.5)', fontSize:11, letterSpacing:'2px', fontFamily:"'Share Tech Mono',monospace", animation:'swipeHint 2s ease-in-out infinite' }}>
          Membuka buku...
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════
export default function BookScene({ onDone }) {
  return (
    <div className="scene" style={{ zIndex:10 }}>
      <MobileBook onDone={onDone} />
    </div>
  )
}