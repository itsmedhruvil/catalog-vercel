'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useMemo, useCallback } from 'react'
import { enableAdminMode, disableAdminMode, ADMIN_EVENT, isAdminEmail } from '@/lib/admin'

export default function useAdminAuth() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  const userEmail = user?.primaryEmailAddress?.emailAddress

  // Check if the user's email is in the admin list
  const hasAdminAccess = useMemo(() => {
    if (!isSignedIn || !userEmail) return false
    return isAdminEmail(userEmail)
  }, [isSignedIn, userEmail])

  // Enable/disable admin mode based on access
  useMemo(() => {
    if (typeof window !== 'undefined') {
      if (isSignedIn && hasAdminAccess) {
        enableAdminMode()
      } else {
        disableAdminMode()
      }
    }
  }, [isSignedIn, hasAdminAccess])

  const handleSignOut = useCallback(async () => {
    await signOut()
    disableAdminMode()
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT, { detail: { isAdmin: false } }))
  }, [signOut])

  return {
    isSignedIn,
    user,
    isAdmin: hasAdminAccess,
    hasAdminAccess,
    signOut: handleSignOut,
    email: userEmail,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
  }
}
