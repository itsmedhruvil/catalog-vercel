import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/clients(.*)',
  '/analytics(.*)',
  '/delivery(.*)',
  '/orders(.*)',
  '/orders/create(.*)',
  '/orders/test(.*)',
  '/orders/analytics(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through without auth check
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // Get user authentication status
  const { userId, sessionClaims } = await auth()
  
  // Get user's email from session claims
  const userEmail = sessionClaims?.email as string | undefined
  
  // Admin email - only this email gets admin access
  const adminEmails: string[] = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? 'corp.weexalate@gmail.com')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
  
  // Check if user is admin
  const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase())
  
  // If trying to access admin routes
  if (isAdminRoute(req)) {
    // Must be signed in
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
    
    // Must be admin
    if (!isAdmin) {
      // Redirect non-admin users to catalog
      return NextResponse.redirect(new URL('/catalog', req.url))
    }
  }
  
  // For API routes, add admin check for admin-specific endpoints
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Allow public access to product listing
    if (req.nextUrl.pathname === '/api/products') {
      return NextResponse.next()
    }
    
    // For admin API routes (customers, orders), check admin status
    if (req.nextUrl.pathname.startsWith('/api/customers') || 
        req.nextUrl.pathname.startsWith('/api/orders')) {
      if (!userId) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      if (!isAdmin) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
