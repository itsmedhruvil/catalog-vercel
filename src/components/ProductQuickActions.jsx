'use client'

import Link from 'next/link'

export default function ProductQuickActions({ productName, productId }) {
  const handleShare = () => {
    const productUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: productName,
        text: `Check out ${productName}`,
        url: productUrl
      }).catch(() => {
        // User cancelled share
      })
    } else {
      navigator.clipboard.writeText(productUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Actions</h3>
      <div className="space-y-3">
        <Link
          href="/catalog"
          className="block w-full py-3 px-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          Continue Shopping
        </Link>
        <button
          onClick={handleShare}
          className="block w-full py-3 px-4 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
        >
          Share Product
        </button>
      </div>
    </div>
  )
}
