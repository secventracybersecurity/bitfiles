import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // RBAC Enforcement
  const url = new URL(request.url)
  
    if (url.pathname.startsWith('/root') || url.pathname.startsWith('/ai-admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Fetch profile for role check
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'ROOT_ADMIN') {
        // Log unauthorized access attempt if user is authenticated but not root
        if (user) {
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            event_type: 'unauthorized_admin_access',
            metadata: { path: url.pathname, role: profile?.role || 'unknown' }
          })
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
