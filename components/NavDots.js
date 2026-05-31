'use client'

export default function NavDots({ total, current, onGo }) {
  return (
    <div id="nav-dots" style={{ position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`ndot${i === current ? ' on' : ''}`}
          onClick={() => onGo(i)}
        />
      ))}
    </div>
  )
}
