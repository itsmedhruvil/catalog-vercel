/// <reference types="node" />
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkIsAdmin, getAdminIdentityFromClaims, getAdminIdentityFromUser } from '@/lib/admin';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Clerk internal callback/handover routes
  "/sign-in-fallback(.*)",
  "/sign-up-fallback(.*)",
]);

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

  // Get user authentication status and session claims from the JWT
  // NOTE: sessionClaims contains the JWT claims embedded in the session, 
  // including public metadata if configured in Clerk JWT template.
  // This is MUCH faster than fetching from Clerk API.
  const { userId, sessionClaims } = await auth();

  const pathname = req.nextUrl.pathname;
  const isMyOrdersRoute = pathname === "/my-orders";
  const isCheckoutRoute = pathname === "/checkout";
  const isOrderReceiptRoute = /^\/orders\/[^\/]+\/receipt$/.test(pathname);

  const { role: userRole, email: userEmail } = getAdminIdentityFromClaims(
    sessionClaims as Record<string, unknown> | undefined,
  );

  let adminCheck: boolean | undefined;

  const getIsAdmin = async () => {
    if (adminCheck !== undefined) {
      return adminCheck;
    }

    if (process.env.NODE_ENV === "development") {
      adminCheck = true;
      return adminCheck;
    }

    // Fast path: role/email is already present in the session claims.
    if (checkIsAdmin({ role: userRole, email: userEmail })) {
      adminCheck = true;
      return adminCheck;
    }

    if (!userId) {
      adminCheck = false;
      return adminCheck;
    }

    // Some Clerk JWT/session configurations omit public metadata or email
    // from sessionClaims. For admin gates, fall back to the backend user object.
    try {
      const user = await (await clerkClient()).users.getUser(userId);
      const { role, email } = getAdminIdentityFromUser(user);
      adminCheck = checkIsAdmin({ role, email });
    } catch (error) {
      console.error("Failed to resolve Clerk admin identity:", error);
      adminCheck = false;
    }

    return adminCheck;
  };

  // For customer routes, allow access to authenticated users
  if (isMyOrdersRoute || isCheckoutRoute || isOrderReceiptRoute) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // If trying to access admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (!(await getIsAdmin())) {
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

      if (!(await getIsAdmin())) {
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

      if (!(await getIsAdmin())) {
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

      if (!(await getIsAdmin())) {
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
    // Skip static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
