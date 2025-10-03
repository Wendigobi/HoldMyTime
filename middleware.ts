import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Supabase places an access token cookie named 'sb-access-token'
  const hasSession =
    req.cookies.has('sb-access-token') || req.cookies.has('sb:token')

  if (req.nextUrl.pathname.startsWith('/dashboard') && !hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
