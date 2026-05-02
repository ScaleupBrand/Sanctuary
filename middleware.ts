import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login' || pathname === '/registro'
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  // Helper function to redirect while preserving cookies from supabaseResponse
  const redirectWithCookies = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const response = NextResponse.redirect(url)
    // Copy all cookies from the supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value)
    })
    return response
  }

  // If user is not logged in and trying to access an app route, redirect to login
  if (!user && !isAuthRoute && pathname !== '/') {
    return redirectWithCookies('/login')
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('estado, onboarding_completado')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (profile.estado === 'pendiente') {
        // Pending users must see the lock screen (which is on /inicio or any app route)
        if (isOnboardingRoute || isAuthRoute) {
          return redirectWithCookies('/inicio')
        }
      } else if (profile.estado === 'activo') {
        if (!profile.onboarding_completado) {
          // Active but onboarding not finished
          if (!isOnboardingRoute && !isAuthRoute) {
            return redirectWithCookies('/onboarding/bienvenida')
          }
        } else {
          // Active and onboarding finished
          if (isOnboardingRoute || isAuthRoute) {
            return redirectWithCookies('/inicio')
          }
        }
      }
    } else if (isAuthRoute) {
      return redirectWithCookies('/inicio')
    }
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

