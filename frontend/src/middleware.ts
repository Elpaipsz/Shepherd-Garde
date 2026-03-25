import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware — Route Protection
 * 
 * Protects authenticated-only routes by checking for the presence of
 * the access_token in the Authorization header or cookies.
 * 
 * Note: Since JWTs are stored in localStorage (not cookies), this middleware
 * cannot verify the token cryptographically at the edge. Instead, it provides
 * a first-line defense: if no token cookie exists, redirect to /login.
 * 
 * For full security, protected API routes are enforced server-side by Django JWT.
 */

const PROTECTED_ROUTES = ['/account', '/checkout']
const AUTH_ROUTES = ['/login', '/register']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for auth token in cookies (we'll set it there as well for SSR/middleware access)
    const tokenCookie = request.cookies.get('sg_authenticated')?.value

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !tokenCookie) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect already-authenticated users away from login/register
    if (isAuthRoute && tokenCookie) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/account/:path*',
        '/checkout/:path*',
        '/login',
        '/register',
    ],
}
