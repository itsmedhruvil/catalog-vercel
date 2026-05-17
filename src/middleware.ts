/// <reference types="node" />
import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkIsAdmin } from '@/lib/admin';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Define strictly admin-only routes (including /orders for admin order management)
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/alerts(.*)",
  "/clients(.*)",
  "/analytics(.*)",
  "/delivery(.*)",
  "/orders(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through without auth check
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get user authentication status
  const { userId } = await auth();

  const pathname = req.nextUrl.pathname;
  const isMyOrdersRoute = pathname === "/my-orders";
  const isCheckoutRoute = pathname === "/checkout";
  const isOrderReceiptRoute = /^\/orders\/[^\/]+\/receipt$/.test(pathname);

  // Initialize role and email - fetched from Clerk API when authenticated.
  let userRole: string | undefined;
  let userEmail: string | undefined;

  // If user is authenticated, fetch their public metadata from Clerk
  if (userId) {
    try {
      // Fetch user from Clerk API to get public metadata and email
      // Note: sessionClaims in Clerk v7 does NOT include metadata by default
      // We need to use clerkClient to fetch the full user object
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      
      // Keep this in sync with useAdminAuth, which reads Clerk public metadata
      // on the client to render the admin UI.
      userRole = user.publicMetadata?.role as string | undefined;
      
      // Get primary email address
      const primaryEmail = user.emailAddresses.find(
        (email: { id: string }) => email.id === user.primaryEmailAddressId
      );
      userEmail = primaryEmail?.emailAddress?.toLowerCase();
      
      // Debug: uncomment to see what's being fetched in server logs
      // console.log(`[Middleware] User: ${userId}, Email: ${userEmail}, Role: ${userRole}`);
    } catch (error) {
      console.error('[Middleware] Error fetching user from Clerk:', error);
      // Continue without admin access if Clerk API fails
    }
  }

  // Primary: check Clerk public metadata role
  // Fallback: check email (backwards compatibility)
  const isAdmin =
    process.env.NODE_ENV === "development" ||
    checkIsAdmin({ role: userRole, email: userEmail });

  // Debugging: Uncomment the line below to see why access is being denied in your server logs
  // console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Email: ${userEmail}, Role: ${userRole}, isAdmin: ${isAdmin}`);

  // For customer routes, allow access to authenticated users
  if (isMyOrdersRoute || isCheckoutRoute || isOrderReceiptRoute) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // If trying to access admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/catalog", req.url));
    }
  }

  // For API routes, add admin check for admin-specific endpoints
  if (req.nextUrl.pathname.startsWith("/api/")) {
    if (
      req.nextUrl.pathname === "/api/products" ||
      req.nextUrl.pathname.match(/^\/api\/products\/[^\/]+$/)
    ) {
      if (req.method === "GET") {
        return NextResponse.next();
      }

      if (!userId) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!isAdmin) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return NextResponse.next();
    }

    if (req.nextUrl.pathname === "/api/upload") {
      if (!userId) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!isAdmin) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return NextResponse.next();
    }

    if (req.nextUrl.pathname === "/api/orders" && req.method === "POST") {
      if (!userId) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized - Must be signed in to create order",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return NextResponse.next();
    }

    if (req.nextUrl.pathname === "/api/orders" && req.method === "GET") {
      if (!userId) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized - Must be signed in to fetch orders",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return NextResponse.next();
    }

    if (
      req.nextUrl.pathname.match(/^\/api\/orders\/[^\/]+$/) &&
      req.method === "GET"
    ) {
      if (!userId) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized - Must be signed in to fetch order",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return NextResponse.next();
    }

    if (
      req.nextUrl.pathname.startsWith("/api/customers") ||
      (req.nextUrl.pathname.startsWith("/api/orders") && req.method !== "GET")
    ) {
      if (!userId) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!isAdmin) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
