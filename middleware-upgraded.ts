import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Define route configurations
const PUBLIC_ROUTES = ['/', '/about', '/contact', '/products', '/services']
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
const PROTECTED_ROUTES = ['/dashboard', '/reservations', '/profile']
const ADMIN_ROUTES = ['/admin']
const API_PUBLIC_ROUTES = ['/api/webhook', '/api/public']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response early so we can modify cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Check if API route is public
    const isPublicApi = API_PUBLIC_ROUTES.some(route =>
      pathname.startsWith(route)
    )

    if (isPublicApi) {
      return response
    }

    // Protected API routes require authentication
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Admin API routes check
    if (pathname.startsWith('/api/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    return response
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Protect private routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      // Redirect non-admin users to dashboard
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co;"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
