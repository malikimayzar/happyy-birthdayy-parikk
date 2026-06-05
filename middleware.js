import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const visitorData = {
    path: pathname,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
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