'use client'

import { useUser } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import InquiryButton from './InquiryButton'
import ProductQuickActions from './ProductQuickActions'

export default function ProductPageActions({ productName, productId }) {
  const { isSignedIn } = useUser()

  // Show full actions for signed-in users
  if (isSignedIn) {
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inquiry Button */}
        <InquiryButton productName={productName} />
        
        {/* Quick Actions */}
        <ProductQuickActions 
          productName={productName} 
          productId={productId}
        />
      </div>
    )
  }

  // Show sign-in prompt for logged-out users
  return (
    <div className="mt-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn size={32} className="text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Sign In to Access Full Features
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Sign in to send inquiries, share products, and place orders. Get instant access to pricing and stock information.
        </p>

        <a
          href="/sign-in"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <LogIn size={20} />
          Sign In Now
        </a>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Send WhatsApp Inquiries
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            View Real-time Stock
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Place Orders
          </div>
        </div>
      </div>
    </div>
  )
}