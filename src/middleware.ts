/// <reference types="node" />
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminEmails } from '@/lib/admin';

type SessionClaimsLike = {
  email?: string;
  email_address?: string;
  primary_email_address?: string;
  primaryEmailAddress?: string;
};

const getUserEmailFromSessionClaims = (
  sessionClaims: SessionClaimsLike | null | undefined,
): string | undefined => {
  const rawEmail =
    sessionClaims?.email ??
    sessionClaims?.email_address ??
    sessionClaims?.primary_email_address ??
    sessionClaims?.primaryEmailAddress;

  if (!rawEmail || typeof rawEmail !== "string") {
    return undefined;
  }

  return rawEmail.trim().toLowerCase();
};

const getUserEmailFromClerk = async (
  userId: string | null | undefined,
): Promise<string | undefined> => {
  if (!userId) {
    return undefined;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const rawEmail =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress;

  return rawEmail?.trim().toLowerCase();
};

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
  const { userId, sessionClaims } = await auth();

  const pathname = req.nextUrl.pathname;
  const isMyOrdersRoute = pathname === "/my-orders";
  const isCheckoutRoute = pathname === "/checkout";
  const isOrderReceiptRoute = /^\/orders\/[^\/]+\/receipt$/.test(pathname);

  // Get user's email from session claims. Clerk does not always include email
  // claims in the middleware token, so fetch the user record when needed.
  const userEmail =
    getUserEmailFromSessionClaims(
      sessionClaims as SessionClaimsLike | undefined,
    ) ?? (await getUserEmailFromClerk(userId));

  const adminEmails = getAdminEmails();
  const isAdmin = 
    process.env.NODE_ENV === "development" || 
    (!!userEmail && adminEmails.includes(userEmail));

  // Debugging: Uncomment the line below to see why access is being denied in your server logs
  // console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Email: ${userEmail}, isAdmin: ${isAdmin}`);

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
