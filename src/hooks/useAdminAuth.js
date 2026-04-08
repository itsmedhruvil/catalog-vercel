'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useMemo, useCallback, useEffect, useState } from 'react'
import { enableAdminMode, disableAdminMode, isAdminEmail, isAdminMode as checkAdminMode } from '@/lib/admin'

export default function useAdminAuth() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [adminModeConfirmed, setAdminModeConfirmed] = useState(false)

  const userEmail = user?.primaryEmailAddress?.emailAddress

  // Check if the user's email is in the admin list
  const hasAdminAccess = useMemo(() => {
    if (!isSignedIn || !userEmail) return false
    return isAdminEmail(userEmail)
  }, [isSignedIn, userEmail])

  // Enable/disable admin mode based on access
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (isSignedIn && hasAdminAccess) {
      // User is signed in and has admin access - enable admin mode
      enableAdminMode()
      setAdminModeConfirmed(true)
    } else if (!isSignedIn) {
      // User signed out - disable admin mode
      disableAdminMode()
      setAdminModeConfirmed(false)
    } else if (isSignedIn && !hasAdminAccess) {
      // User is signed in but doesn't have admin access
      disableAdminMode()
      setAdminModeConfirmed(false)
    }
  }, [isSignedIn, hasAdminAccess])

  const handleSignOut = useCallback(async (options) => {
    // Use Clerk's signOut with options if provided
    await signOut(options)
    // Clean up admin mode synchronously before redirect
    disableAdminMode()
  }, [signOut])

  // Determine if user is admin - check both hasAdminAccess and localStorage
  const isAdmin = useMemo(() => {
    // If we've confirmed admin mode in this session, use that
    if (adminModeConfirmed) return true
    // Otherwise check hasAdminAccess
    if (hasAdminAccess) return true
    // Fall back to localStorage check for page refreshes
    if (typeof window !== 'undefined') {
      return checkAdminMode()
    }
    return false
  }, [hasAdminAccess, adminModeConfirmed])

  // Memoize the return value to prevent unnecessary re-renders in consuming components
  return useMemo(() => ({
    isSignedIn,
    isLoaded,
    isLoading: !isLoaded,
    user,
    isAdmin,
    hasAdminAccess,
    signOut: handleSignOut,
    email: userEmail,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
  }), [isSignedIn, isLoaded, user, isAdmin, hasAdminAccess, handleSignOut, userEmail])
}
