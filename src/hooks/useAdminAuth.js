'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useMemo, useCallback, useEffect, useState } from 'react'
import { enableAdminMode, disableAdminMode, checkIsAdmin, isAdminMode as checkAdminMode } from '@/lib/admin'

export default function useAdminAuth() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [adminModeConfirmed, setAdminModeConfirmed] = useState(false)

  // Get email from user object
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || user?.email

  // Get admin role from Clerk public metadata (set via Clerk Dashboard)
  // Go to Clerk Dashboard → Users → Select user → Public metadata → {"role": "admin"}
  const userRole = user?.publicMetadata?.role

  // Check if the user has admin access (primary: role metadata, fallback: email)
  const hasAdminAccess = useMemo(() => {
    if (!isSignedIn) return false
    return checkIsAdmin({ role: userRole, email: userEmail })
  }, [isSignedIn, userRole, userEmail])

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
    } else if (isSignedIn && !hasAdminAccess && userEmail) {
      // User is signed in but doesn't have admin access (email verified)
      disableAdminMode()
      setAdminModeConfirmed(false)
    }
    // Only run this effect when we actually have email data for signed in users
  }, [isSignedIn, hasAdminAccess, userEmail])

  const handleSignOut = useCallback(async (options) => {
    // Use Clerk's signOut with options if provided
    await signOut(options)
    // Clean up admin mode synchronously before redirect
    disableAdminMode()
  }, [signOut])

  // Determine if user is admin - check both hasAdminAccess and localStorage
  const isAdmin = useMemo(() => {
    // Always check actual access first when user is loaded
    if (isLoaded && hasAdminAccess) return true
    // If we've confirmed admin mode in this session, use that
    if (adminModeConfirmed) return true
    // Fall back to localStorage check for page refreshes while loading
    if (typeof window !== 'undefined' && !isLoaded) {
      return checkAdminMode()
    }
    return false
  }, [isLoaded, hasAdminAccess, adminModeConfirmed])

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
