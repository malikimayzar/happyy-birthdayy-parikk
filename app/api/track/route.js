import { NextResponse } from 'next/server'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(request) {
  try {
    const data = await request.json()
    const { path, ip, ua, referer, country, city, time } = data

    const wib = new Date(time).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'short',
      timeStyle: 'medium',
    })

    const isMobile = /mobile|android|iphone|ipad/i.test(ua)
    const device = isMobile ? '📱 Mobile' : '💻 Desktop'

    const message = `
🌸 *Lovescape — Visitor Baru!*

🕐 *Waktu:* ${wib} WIB
📍 *Halaman:* \`${path}\`
${country !== 'unknown' ? `🌍 *Lokasi:* ${city}, ${country}` : ''}
${device}
🔗 *Referer:* ${referer}
🌐 *IP:* \`${ip}\`
`.trim()

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}