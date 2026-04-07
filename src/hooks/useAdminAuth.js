'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useMemo, useCallback, useRef, useEffect } from 'react'
import { enableAdminMode, disableAdminMode, ADMIN_EVENT, isAdminEmail } from '@/lib/admin'

export default function useAdminAuth() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const prevIsSignedInRef = useRef(isSignedIn)

  const userEmail = user?.primaryEmailAddress?.emailAddress

  // Check if the user's email is in the admin list
  const hasAdminAccess = useMemo(() => {
    if (!isSignedIn || !userEmail) return false
    return isAdminEmail(userEmail)
  }, [isSignedIn, userEmail])

  // Enable/disable admin mode based on access - only when state actually changes
  useEffect(() => {
    const prevIsSignedIn = prevIsSignedInRef.current
    const hasChanged = prevIsSignedIn !== isSignedIn
    
    if (typeof window !== 'undefined' && hasChanged) {
      if (isSignedIn && hasAdminAccess) {
        enableAdminMode()
      } else if (!isSignedIn) {
        // Only disable when signing out (not just admin access change)
        disableAdminMode()
      }
    }
    
    prevIsSignedInRef.current = isSignedIn
  }, [isSignedIn, hasAdminAccess])

  const handleSignOut = useCallback(async (options) => {
    // Use Clerk's signOut with options if provided
    await signOut(options)
    // Clean up admin mode synchronously before redirect
    disableAdminMode()
  }, [signOut])

  // Memoize the return value to prevent unnecessary re-renders in consuming components
  return useMemo(() => ({
    isSignedIn,
    isLoaded,
    isLoading: !isLoaded,
    user,
    isAdmin: hasAdminAccess,
    hasAdminAccess,
    signOut: handleSignOut,
    email: userEmail,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
  }), [isSignedIn, isLoaded, user, hasAdminAccess, handleSignOut, userEmail])
}
