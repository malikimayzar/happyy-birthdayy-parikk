import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID
const COOLDOWN_MS = 15 * 60 * 1000 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

function parseDevice(ua) {
  let brand = 'Unknown'
  if (/iphone/i.test(ua)) brand = 'iPhone'
  else if (/ipad/i.test(ua)) brand = 'iPad'
  else if (/samsung/i.test(ua)) brand = 'Samsung'
  else if (/xiaomi|redmi|poco/i.test(ua)) brand = 'Xiaomi'
  else if (/oppo/i.test(ua)) brand = 'Oppo'
  else if (/vivo/i.test(ua)) brand = 'Vivo'
  else if (/realme/i.test(ua)) brand = 'Realme'
  else if (/huawei/i.test(ua)) brand = 'Huawei'
  else if (/android/i.test(ua)) brand = 'Android'

  let os = ''
  const iosMatch = ua.match(/OS ([\d_]+) like Mac OS X/)
  const androidMatch = ua.match(/Android ([\d.]+)/)
  const windowsMatch = ua.match(/Windows NT ([\d.]+)/)
  if (iosMatch) os = `iOS ${iosMatch[1].replace(/_/g, '.')}`
  else if (androidMatch) os = `Android ${androidMatch[1]}`
  else if (/macintosh/i.test(ua)) os = 'macOS'
  else if (windowsMatch) {
    const v = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' }
    os = `Windows ${v[windowsMatch[1]] || windowsMatch[1]}`
  } else if (/linux/i.test(ua)) os = 'Linux'

  let browser = 'Unknown'
  const edgeMatch = ua.match(/Edg\/([\d]+)/)
  const chromeMatch = ua.match(/Chrome\/([\d]+)/)
  const safariMatch = ua.match(/Version\/([\d]+).*Safari/)
  const firefoxMatch = ua.match(/Firefox\/([\d]+)/)
  if (edgeMatch) browser = `Edge ${edgeMatch[1]}`
  else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook App'
  else if (/Instagram/i.test(ua)) browser = 'Instagram App'
  else if (chromeMatch) browser = `Chrome ${chromeMatch[1]}`
  else if (safariMatch) browser = `Safari ${safariMatch[1]}`
  else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1]}`

  const emoji = /iphone|ipad|android|samsung|xiaomi|oppo|vivo|realme|huawei/i.test(ua) ? '📱' : '💻'
  return { emoji, brand, os, browser }
}

async function sendTelegram(message) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  })
}

async function handleVisitor(data) {
  const { path, ip, ua, referer, country, city, time } = data
  const cooldownKey = `cooldown:${ip}`
  const lastVisit = await redis.get(cooldownKey)
  if (lastVisit && Date.now() - lastVisit < COOLDOWN_MS) {
    return { skipped: true }
  }

  await redis.set(cooldownKey, Date.now(), { ex: 60 * 60 }) 
  const visitKey = `visits:${ip}`
  const visitCount = await redis.incr(visitKey)
  const isFirstTime = visitCount === 1
  const today = new Date().toISOString().slice(0, 10)
  await redis.incr(`daily:${today}`)
  const wib = new Date(time).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'short',
    timeStyle: 'medium',
  })

  const { emoji, brand, os, browser } = parseDevice(ua)

  let header = '🌸 *Lovescape — Visitor Baru!*'
  if (isFirstTime) header = '🆕 *Lovescape — Visitor Pertama Kali!*'
  else if (visitCount > 1) header = `💕 *Lovescape — Dia Balik Lagi! (Kunjungan ke-${visitCount})*`

  const message = `
${header}

🕐 *Waktu:* ${wib} WIB
📍 *Halaman:* \`${path}\`
${country !== 'unknown' ? `🌍 *Lokasi:* ${city}, ${country}` : ''}
${emoji} *Device:* ${brand} (${os})
🌐 *Browser:* ${browser}
🔗 *Referer:* ${referer}
📡 *IP:* \`${ip}\`
`.trim()

  await sendTelegram(message)
  return { ok: true, visitCount, isFirstTime }
}

async function handleScene(data) {
  const { ip, scene, prevScene } = data
  await redis.incr(`scene:${scene}`)
  const sceneEmoji = {
    Splash: '🌸',
    Matrix: '💚',
    Starfield: '✨',
    Book: '📖',
    HeartFinale: '❤️',
  }

  const message = `
🎬 *Lovescape — Scene Change*

${sceneEmoji[prevScene] || '▶️'} ${prevScene} → ${sceneEmoji[scene] || '▶️'} *${scene}*
📡 *IP:* \`${ip}\`
`.trim()

  await sendTelegram(message)
  return { ok: true }
}

async function handleDuration(data) {
  const { ip, duration } = data 
  const menit = Math.floor(duration / 60)
  const detik = duration % 60
  const durasiStr = menit > 0 ? `${menit} menit ${detik} detik` : `${detik} detik`
  const message = `
⏱️ *Lovescape — Visitor Keluar*

📡 *IP:* \`${ip}\`
⌛ *Durasi:* ${durasiStr}
`.trim()

  await sendTelegram(message)
  return { ok: true }
}
 
async function handleDailySummary() {
  const today = new Date().toISOString().slice(0, 10)
  const count = (await redis.get(`daily:${today}`)) || 0
  const scenes = ['Splash', 'Matrix', 'Starfield', 'Book', 'HeartFinale']
  const sceneCounts = await Promise.all(scenes.map(s => redis.get(`scene:${s}`)))
  const sceneEmoji = { Splash: '🌸', Matrix: '💚', Starfield: '✨', Book: '📖', HeartFinale: '❤️' }
  const heatmap = scenes
    .map((s, i) => `${sceneEmoji[s]} ${s}: ${sceneCounts[i] || 0}x`)
    .join('\n')

  const message = `
📊 *Lovescape — Ringkasan Harian*
📅 *${today}*

👥 *Total Visitor:* ${count} orang

🎬 *Scene Terpopuler:*
${heatmap}
`.trim()

  await sendTelegram(message)
  return { ok: true }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const { type } = data

    if (type === 'scene') return NextResponse.json(await handleScene(data))
    if (type === 'duration') return NextResponse.json(await handleDuration(data))
    if (type === 'daily') return NextResponse.json(await handleDailySummary())

    return NextResponse.json(await handleVisitor(data))
  } catch (err) {
    console.error('Track error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}