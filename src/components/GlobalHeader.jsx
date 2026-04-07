'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { 
  Shield, 
  LogOut, 
  User, 
  Settings, 
  Menu, 
  LogIn,
  X,
  ShoppingCart,
  BarChart3,
  Bell,
  Truck,
  Package,
  Home,
  Search as SearchIcon
} from 'lucide-react'
import useAdminAuth from '@/hooks/useAdminAuth'
import { useCart } from '@/context/CartContext'

export default function GlobalHeader() {
  const { isSignedIn, isAdmin, user } = useAdminAuth()
  const { signOut, openUserProfile } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { cartTotals, openCart } = useCart()
  const { itemCount } = cartTotals()

  // Don't show on sign-in/sign-up pages
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null
  }

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOut({ redirectUrl: '/catalog' })
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.href = '/catalog'
    }
  }, [signOut, isSigningOut])

  const handleGoToCatalog = useCallback(() => {
    setShowDropdown(false)
    router.push('/catalog')
  }, [router])

  const isProductPage = pathname?.startsWith('/product/')
  const isCatalogPage = pathname === '/catalog'

  // Define menu items based on user type
  const adminMenuItems = [
    { icon: <Home size={20} />, label: 'Catalog', path: '/catalog' },
    { icon: <Package size={20} />, label: 'Orders Management', path: '/orders' },
    { icon: <User size={20} />, label: 'Client Database', path: '/clients' },
    { icon: <BarChart3 size={20} />, label: 'Analytics Dashboard', path: '/analytics' },
    { icon: <Bell size={20} />, label: 'Inventory Alerts', path: '/alerts' },
    { icon: <Truck size={20} />, label: 'Delivery Management', path: '/delivery' },
  ]

  const userMenuItems = [
    { icon: <Home size={20} />, label: 'Catalog', path: '/catalog' },
    { icon: <Package size={20} />, label: 'My Orders', path: '/my-orders' },
  ]

  const menuItems = isAdmin ? adminMenuItems : userMenuItems

  return (
    <>
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <button 
              onClick={() => router.push('/catalog')}
              className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Home size={20} />
              <span className="hidden sm:inline">Catalog</span>
            </button>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button (for catalog page) */}
              {isCatalogPage && (
                <button
                  onClick={() => {
                    const searchInput = document.querySelector('input[placeholder="Search products by name..."]')
                    if (searchInput) {
                      searchInput.focus()
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Search"
                >
                  <SearchIcon size={20} />
                </button>
              )}

              {/* Cart Button - Only for non-admin users */}
              {!isAdmin && itemCount > 0 && (
                <button
                  onClick={() => openCart()}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingCart size={20} />
                  <span className="absolute top-1 right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {itemCount}
                  </span>
                </button>
              )}

              {/* Sign In / Admin Badge */}
              {isSignedIn && isAdmin && (
                <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Shield size={14} />
                  <span className="hidden sm:inline">Admin</span>
                </div>
              )}

              {/* User Menu / Sign In Button */}
              {isSignedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.fullName || 'User'}
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
                          <User size={16} />
                          My Profile
                        </button>
                        
                        <button
                          onClick={handleGoToCatalog}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Settings size={16} />
                          Go to Catalog
                        </button>
                        
                        <hr className="my-2 border-gray-100" />
                        
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <LogOut size={16} />
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push('/sign-in')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Off-Canvas Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path)
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                {isAdmin ? 'Admin Mode Active' : 'Viewer Mode'}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}