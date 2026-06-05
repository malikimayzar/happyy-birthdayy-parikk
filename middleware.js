import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Skip file-file yang ga perlu di-track
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/music') ||  // ← tambah ini
    pathname.match(/\.(mp3|mp4|wav|ogg|webp|png|jpg|svg|ico)$/) // ← skip semua file media
  ) {
    return NextResponse.next()
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const visitorData = {
    path: pathname,
    ip,  // ← sekarang IP beneran
    ua: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || 'direct',
    country: request.geo?.country || 'unknown',
    city: request.geo?.city || 'unknown',
    time: new Date().toISOString(),
  }

  const baseUrl = `https://${request.headers.get('host')}`
  fetch(`${baseUrl}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitorData),
  }).catch(() => {})

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}