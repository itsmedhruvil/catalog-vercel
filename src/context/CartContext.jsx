'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

const CartContext = createContext(null)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const { user } = useUser()
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Get user-specific cart key
  const getCartKey = useCallback(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      return `cart_${user.primaryEmailAddress.emailAddress.replace(/[@.]/g, '_')}`
    }
    return 'cart_guest' // Guest cart
  }, [user])

  // Load cart from localStorage on mount or when user changes
  useEffect(() => {
    const loadCart = () => {
      const cartKey = getCartKey()
      const savedCart = localStorage.getItem(cartKey)
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e)
          setCartItems([])
        }
      } else {
        setCartItems([])
      }
      setIsLoading(false)
    }

    loadCart()
  }, [getCartKey])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const cartKey = getCartKey()
      localStorage.setItem(cartKey, JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading, getCartKey])

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1, size = '') => {
    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.productId === product.id && item.size === size
      )

      if (existingIndex > -1) {
        // Update quantity of existing item
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      // Add new item
      const newItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: parseFloat(product.price) || 0,
        quantity,
        size,
        availableQuantity: parseInt(product.totalQuantity || product.calculatedAvailable || '0')
      }

      return [...prevItems, newItem]
    })
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((productId, size = '') => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.productId === productId && item.size === size))
    )
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity, size = '') => {
    if (newQuantity < 1) {
      removeFromCart(productId, size)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }, [removeFromCart])

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([])
    // Also clear from localStorage
    const cartKey = getCartKey()
    localStorage.removeItem(cartKey)
  }, [getCartKey])

  // Get cart totals
  const cartTotals = useCallback(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return { itemCount, subtotal }
  }, [cartItems])

  // Open cart
  const openCart = useCallback(() => {
    setIsCartOpen(true)
  }, [])

  // Close cart
  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  // Toggle cart
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev)
  }, [])

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotals,
    openCart,
    closeCart,
    toggleCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext