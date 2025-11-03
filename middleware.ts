import { type NextRequest, NextResponse } from 'next/server'
// We import the client directly from @supabase/ssr here
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create the middleware-specific Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // This middleware implementation still uses get/set/remove
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookies for the current request
          request.cookies.set({ name, value, ...options })
          // Update response cookies to be sent back to the browser
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Update request cookies
          request.cookies.set({ name, value: '', ...options })
          // Update response cookies
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get the current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const requestedPath = request.nextUrl.pathname;

  // **PROTECTION LOGIC**

  // 1. If user is NOT logged in and tries to access admin area
  if (!user && (requestedPath.startsWith('/users') || requestedPath.startsWith('/api/create-user'))) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If user IS logged in and tries to access the login page
  if (user && requestedPath === '/login') {
    // Redirect them to the user dashboard
    return NextResponse.redirect(new URL('/users', request.url))
  }
  
  // 3. If all checks pass, continue
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/users/:path*',
    '/login'
  ],
}