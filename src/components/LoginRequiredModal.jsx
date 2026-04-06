'use client'

import { X, LogIn, ShoppingCart, MessageCircle, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LoginRequiredModal({ isOpen, onClose, feature = 'order' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  const featureMessages = {
    order: {
      title: 'Sign In to Order',
      description: 'Please sign in to add items to your cart and place orders. You\'ll also be able to track your order history.',
      icon: ShoppingCart,
    },
    inquiry: {
      title: 'Sign In to Inquire',
      description: 'Please sign in to send WhatsApp inquiries. This helps us provide you with personalized assistance.',
      icon: MessageCircle,
    },
    stock: {
      title: 'Sign In to View Stock',
      description: 'Sign in to see real-time stock availability, pricing, and place orders.',
      icon: Eye,
    },
    default: {
      title: 'Sign In Required',
      description: 'Please sign in to access this feature.',
      icon: LogIn,
    },
  }

  const { title, description, icon: Icon } = featureMessages[feature] || featureMessages.default

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6">
            <Icon size={40} className="text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

          {/* Description */}
          <p className="text-gray-600 mb-8">{description}</p>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-3">With an account, you can:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                View real-time stock availability
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                See pricing and place orders
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Track your order history
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Get personalized assistance
              </li>
            </ul>
          </div>

          {/* Sign In Button */}
          <a
            href="/sign-in"
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            <LogIn size={20} />
            Sign In with Google
          </a>

          {/* Alternative text */}
          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}