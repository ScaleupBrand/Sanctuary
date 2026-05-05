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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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
  const isPasswordResetRoute = pathname === '/cambiar-password'
  const isPublicRoute = pathname === '/' || isPasswordResetRoute
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const isTherapistRoute = pathname.startsWith('/terapeuta')
  const protectedAppRoutes = ['/inicio', '/brote', '/historial', '/regulacion', '/ajustes']
  const isAppRoute = protectedAppRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isProtectedRoute = isAppRoute || isOnboardingRoute || isTherapistRoute

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

  // Protected app and onboarding routes require a live Supabase session.
  if (!user && isProtectedRoute) {
    return redirectWithCookies('/login')
  }

  if (!user && !isAuthRoute && !isPublicRoute) {
    return redirectWithCookies('/login')
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('estado, onboarding_completado, rol')
      .eq('id', user.id)
      .single()

    if (profile) {
      const canAccessTherapistPortal = profile.rol === 'terapeuta' || profile.rol === 'admin'

      if (isPasswordResetRoute) {
        return supabaseResponse
      }

      if (isTherapistRoute) {
        if (!canAccessTherapistPortal) {
          return redirectWithCookies('/inicio')
        }

        return supabaseResponse
      }

      if (isAuthRoute) {
        if (profile.estado !== 'activo') {
          return redirectWithCookies('/inicio')
        }

        if (canAccessTherapistPortal) {
          return redirectWithCookies('/terapeuta/dashboard')
        }

        if (!profile.onboarding_completado) {
          return redirectWithCookies('/onboarding/bienvenida')
        }

        return redirectWithCookies('/inicio')
      }

      if (profile.estado !== 'activo') {
        // Pending users must see the lock screen (which is on /inicio or any app route)
        if (isOnboardingRoute) {
          return redirectWithCookies('/inicio')
        }

        if (isAppRoute && pathname !== '/inicio') {
          return redirectWithCookies('/inicio')
        }
      } else {
        if (!profile.onboarding_completado) {
          // Active but onboarding not finished
          if (!isOnboardingRoute) {
            return redirectWithCookies('/onboarding/bienvenida')
          }
        } else {
          // Active and onboarding finished
          if (isOnboardingRoute) {
            return redirectWithCookies('/inicio')
          }
        }
      }
    } else {
      if (isProtectedRoute && pathname !== '/inicio') {
        return redirectWithCookies('/inicio')
      }
    }
  }

  return supabaseResponse
}

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
