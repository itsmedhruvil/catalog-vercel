'use client'

import { useMemo } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useUser } from '@clerk/nextjs'

export default function FloatingCartButton() {
  const { cartTotals, openCart, isCartOpen } = useCart()
  const { itemCount } = cartTotals()
  const { isSignedIn } = useUser()

  // Use useMemo to prevent unnecessary re-renders
  const isAdmin = useMemo(() => isSignedIn, [isSignedIn])

  // Don't show the floating button if cart is open, empty, or user is admin (signed in)
  if (isCartOpen || itemCount === 0 || isAdmin) return null

  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200 group"
      aria-label="Open shopping cart"
    >
      <ShoppingCart size={24} className="group-hover:rotate-[-10deg] transition-transform duration-200" />
      
      {/* Badge showing item count */}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse-once">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        View Cart
        <span className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </button>
  )
}