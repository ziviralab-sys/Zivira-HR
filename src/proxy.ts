import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  
  // If no auth cookie and trying to access any page other than login, redirect to login
  if (!authCookie && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If auth cookie exists and trying to access login page, redirect to dashboard
  if (authCookie && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all routes except API routes, static files, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
};
