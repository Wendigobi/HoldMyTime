import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    // Supabase sets one of these cookies when authenticated
    const hasAuth =
      req.cookies.get('sb-access-token') ||
      req.cookies.get('supabase-auth-token') ||
      req.cookies.get('sb:token');

    if (!hasAuth) {
      const url = new URL('/login', req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
