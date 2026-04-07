'use client'

import { useClerk } from '@clerk/nextjs'
import { Shield, LogOut, User, Settings } from 'lucide-react'
import { useState, useCallback } from 'react'
import useAdminAuth from '@/hooks/useAdminAuth'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  // Use only useAdminAuth to avoid duplicate hook calls - it already uses useUser internally
  const { isSignedIn, isAdmin, user } = useAdminAuth()
  const { openUserProfile, signOut } = useClerk()
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Only show admin header for users with admin access
  if (!isSignedIn || !isAdmin) return null

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return // Prevent double-click
    setIsSigningOut(true)
    try {
      // Use Clerk's signOut with redirect for faster sign-out
      await signOut({ redirectUrl: '/catalog' })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: redirect manually if signOut fails
      window.location.href = '/catalog'
    }
  }, [signOut, isSigningOut])

  const handleGoToCatalog = useCallback(() => {
    setShowDropdown(false)
    router.push('/catalog')
  }, [router])

  return (
    <div className="fixed top-4 right-16 z-40">
      <div className="relative">
        {/* Admin Badge */}
        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
          <Shield size={18} />
          <span className="text-sm font-semibold">Admin Mode</span>
          
          {/* User Info */}
          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-blue-400">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.fullName || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={18} />
            )}
            <span className="text-sm hidden sm:inline">
              {user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Admin'}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="ml-2 p-1 hover:bg-blue-500 rounded-full transition-colors"
            title="Sign out"
            disabled={isSigningOut}
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            
            <button
              onClick={() => {
                openUserProfile()
                setShowDropdown(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <User size={14} />
              My Profile
            </button>
            
            <button
              onClick={handleGoToCatalog}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Settings size={14} />
              Go to Catalog
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <LogOut size={14} />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
