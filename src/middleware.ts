import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.get('jobhub_authed')?.value === '1'
  
  if (!isAuthed) {
    const nextUrl = new URL('/login', request.url)
    nextUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employer/:path*',
    '/applications/:path*',
    '/dashboard/:path*',
    '/candidate/:path*'
  ],
}
