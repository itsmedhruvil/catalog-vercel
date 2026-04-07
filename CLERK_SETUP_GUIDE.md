# Clerk Authentication Setup Guide

## Current Issues Identified

### 1. Clerk in Development Mode
**Problem:** Your Clerk authentication is using test/development keys instead of production keys.

**Current Keys (Development):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dml0YWwtc3RhbGxpb24tMzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_uzoFPjJlC66bHCYs0wFQHW0AjFYcabIvncmmGtiF6F
```

**Why This Matters:**
- Test keys (`pk_test_` and `sk_test_`) are for development/testing only
- Production keys (`pk_live_` and `sk_live_`) are required for live applications
- Development mode may have limitations and shows "Development Mode" in the Clerk dashboard

### 2. Order Submission Issue
**Problem:** Users couldn't submit orders because they weren't being redirected to sign in before checkout.

**Root Cause:**
- The middleware requires authentication (`userId`) for POST `/api/orders`
- The checkout page didn't enforce sign-in requirement
- Users could access checkout without being authenticated, leading to 401 errors

## Solutions Implemented

### ✅ Fixed: Order Submission Authentication
**Changes Made:**
1. **Updated `src/app/checkout/page.jsx`:**
   - Added `useUser()` hook from Clerk to check authentication status
   - Added authentication check in `useEffect` to redirect unauthenticated users to sign-in
   - Added loading states while checking authentication
   - Users are now automatically redirected to `/sign-in` with a return URL to `/checkout`

2. **Authentication Flow:**
   - User adds items to cart → Goes to checkout
   - If not signed in → Redirected to sign-in page
   - After signing in → Automatically redirected back to checkout
   - Order can now be submitted successfully

### 🔄 Pending: Switch to Production Mode

## How to Switch Clerk to Production Mode

### Step 1: Get Production Keys from Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (vital-stallion-36)
3. Navigate to **API Keys** in the left sidebar
4. Under **Production keys**, click **Reveal** or **Copy** to get:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Step 2: Update Environment Variables

**Option A: Update `.env.local` (for local development)**
```bash
# Replace these lines in .env.local:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_production_publishable_key
CLERK_SECRET_KEY=sk_live_your_actual_production_secret_key
```

**Option B: Update Vercel Environment Variables (for production deployment)**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Redeploy your application

### Step 3: Restart Your Development Server
After updating `.env.local`, restart your dev server:
```bash
npm run dev
```

### Step 4: Verify Production Mode
1. Check your application - Clerk should no longer show "Development Mode"
2. Test the authentication flow:
   - Sign up a test user
   - Try placing an order
   - Verify everything works correctly

## Important Notes

### Security Considerations
- **Never commit production keys to version control**
- Keep `.env.local` in `.gitignore` (already done)
- Use environment variables in production (Vercel, etc.)

### Testing Before Going Live
1. Test with development keys first
2. Create test users and orders
3. Verify all authentication flows work
4. Then switch to production keys
5. Test again with production keys

### Clerk Configuration Checklist
- [ ] Get production API keys from Clerk dashboard
- [ ] Update `.env.local` with production keys
- [ ] Update Vercel environment variables
- [ ] Restart development server
- [ ] Test sign-up/sign-in flows
- [ ] Test order submission
- [ ] Verify no "Development Mode" warnings

## Current Authentication Flow

### For Regular Users:
1. **Browse Catalog** → No authentication required
2. **Add to Cart** → No authentication required
3. **Go to Checkout** → Must be signed in
   - If not signed in → Redirected to `/sign-in`
   - After signing in → Redirected back to `/checkout`
4. **Submit Order** → Requires authentication (enforced by middleware)
5. **View My Orders** → Must be signed in

### For Admin Users:
1. **Admin Detection** → Based on email in `NEXT_PUBLIC_ADMIN_EMAILS`
2. **Admin Routes** → `/orders`, `/clients`, `/analytics`, `/delivery`, `/alerts`
3. **Admin API Access** → Can manage products, orders, customers
4. **Admin UI** → Shows admin badge and additional menu items

## Middleware Configuration

The middleware (`src/middleware.ts`) handles:
- **Public Routes:** `/sign-in`, `/sign-up`
- **Admin Routes:** `/orders`, `/clients`, `/analytics`, `/delivery`
- **API Protection:** 
  - POST `/api/orders` requires authentication (for order creation)
  - GET `/api/products` is public (catalog browsing)
  - Other API routes require admin authentication

## Troubleshooting

### If Orders Still Fail:
1. Check browser console for errors
2. Verify user is signed in (check Clerk session)
3. Check network tab for 401 errors
4. Ensure middleware is running (check `src/middleware.ts`)

### If Still in Development Mode:
1. Verify you're using `pk_live_` and `sk_live_` keys
2. Clear browser cache and cookies
3. Restart development server
4. Check Clerk dashboard for any warnings

### If Sign-In Doesn't Work:
1. Verify Clerk keys are correct
2. Check Clerk dashboard for any configuration issues
3. Ensure `ClerkProvider` is in `src/app/layout.jsx`
4. Check browser console for Clerk errors

## Next Steps

1. **Get your production keys from Clerk**
2. **Update your environment variables**
3. **Test the complete flow:**
   - Sign up → Browse → Add to cart → Checkout → Place order
4. **Deploy to production** (if ready)

## Support

If you encounter any issues:
1. Check Clerk documentation: https://clerk.com/docs
2. Review your Clerk dashboard for any warnings
3. Check application logs in Vercel (if deployed)
4. Verify all environment variables are set correctly

---

**Remember:** Always test thoroughly with development keys before switching to production!