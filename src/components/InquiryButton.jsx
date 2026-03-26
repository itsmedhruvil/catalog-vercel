'use client'

import { MessageCircle } from 'lucide-react'

export default function InquiryButton({ productName }) {
  const handleInquiry = () => {
    const message = `Hello I have inquiry for this ${productName}`
    const whatsappUrl = `https://wa.me/919712528819?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <MessageCircle size={32} className="text-green-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Inquire?
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Contact us directly on WhatsApp for quick responses, bulk pricing, and personalized assistance.
        </p>

        <button
          onClick={handleInquiry}
          className="group inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="sm:text-sm md:text-md lg:text-lg">Send WhatsApp Inquiry</span>
        </button>

        <div className="mt-4 text-xs text-gray-500">
          Opens in WhatsApp • Fast response guaranteed
        </div>
      </div>
    </div>
  )
}