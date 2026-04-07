'use client'

import { useState, useMemo } from 'react'
import { ShoppingCart, Check, MinusCircle, PlusCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useUser } from '@clerk/nextjs'
import LoginRequiredModal from './LoginRequiredModal'
import { isAdminMode } from '@/lib/admin'

export default function AddToCartButton({ product, variant = 'default', className = '' }) {
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [showQuantity, setShowQuantity] = useState(false)
  const { isSignedIn } = useUser()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Only hide add to cart button for admin mode users, not regular signed-in users
  const isAdmin = useMemo(() => isAdminMode(), [isSignedIn])

  // Don't show add to cart button for admins (users in admin mode)
  if (isAdmin) return null

  const cartItem = cartItems.find(
    item => item.productId === product.id && item.size === (product.size || '')
  )
  const isInCart = !!cartItem
  const cartQuantity = cartItem?.quantity || 0

  const isSoldOut = 
    product.isSoldOut || 
    (product.calculatedAvailable !== undefined && 
     product.calculatedAvailable !== '' && 
     parseInt(product.calculatedAvailable) <= 0)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Check if user is signed in
    if (!isSignedIn) {
      setShowLoginModal(true)
      return
    }
    
    if (isSoldOut) return
    
    addToCart(product, quantity, product.size || '')
    setShowQuantity(true)
  }

  const handleRemoveFromCart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    removeFromCart(product.id, product.size || '')
    setQuantity(1)
    setShowQuantity(false)
  }

  const handleQuantityChange = (e, newQuantity) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (newQuantity < 1) {
      handleRemoveFromCart(e)
    } else {
      updateQuantity(product.id, newQuantity, product.size || '')
      setQuantity(newQuantity)
    }
  }

  // Don't show for sold out items in some variants
  if (isSoldOut && variant === 'icon-only') {
    return (
      <>
        <button
          disabled
          className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg ${
            isSoldOut
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${className}`}
          title="Sold Out"
        >
          <ShoppingCart size={16} />
        </button>
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          feature="order"
        />
      </>
    )
  }

  // Icon-only variant (for product cards)
  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isSoldOut}
        className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition-all duration-300 ${
          isSoldOut
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white hover:scale-110'
        } ${className}`}
        title={isSoldOut ? 'Sold Out' : 'Add to Cart'}
      >
        <ShoppingCart size={16} />
      </button>
    )
  }

  // Compact variant (for catalog grid)
  if (variant === 'compact') {
    if (isInCart) {
      return (
        <div className="flex items-center gap-1 bg-green-600 text-white rounded-lg px-2 py-1">
          <button
            onClick={(e) => handleQuantityChange(e, cartQuantity - 1)}
            className="p-0.5 hover:bg-green-700 rounded"
          >
            <MinusCircle size={14} />
          </button>
          <span className="text-sm font-semibold w-6 text-center">{cartQuantity}</span>
          <button
            onClick={(e) => handleQuantityChange(e, cartQuantity + 1)}
            className="p-0.5 hover:bg-green-700 rounded"
          >
            <PlusCircle size={14} />
          </button>
        </div>
      )
    }

    return (
      <button
        onClick={handleAddToCart}
        disabled={isSoldOut}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          isSoldOut
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        } ${className}`}
      >
        {isSoldOut ? 'Sold Out' : 'Add to Cart'}
      </button>
    )
  }

  // Full variant (for product detail page)
  if (isInCart) {
    return (
      <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700">
          <Check size={20} />
          <span className="font-semibold">In Cart</span>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={(e) => handleQuantityChange(e, cartQuantity - 1)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
          >
            <MinusCircle size={20} />
          </button>
          <span className="text-xl font-bold text-green-800 w-8 text-center">{cartQuantity}</span>
          <button
            onClick={(e) => handleQuantityChange(e, cartQuantity + 1)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
          >
            <PlusCircle size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusCircle size={18} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-16 text-center border border-gray-300 rounded-lg py-2 font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isSoldOut}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
          isSoldOut
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
        } ${className}`}
      >
        <ShoppingCart size={22} />
        {isSoldOut ? 'Sold Out' : 'Add to Cart'}
      </button>
    </div>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        feature="order"
      />
    </>
  )
}
