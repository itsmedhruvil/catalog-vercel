'use client'

import { Layers, Box, Package } from 'lucide-react'

export default function ProductDetails({ product }) {
  const isSoldOut = product.availableQuantity != null && product.availableQuantity !== '' && Number(product.availableQuantity) <= 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Product Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1 capitalize">
              Category: {product.category || 'Uncategorized'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">Points</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{product.price}</p>
            </div>
            
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {product.size && (
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Layers size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-0.5">Size</p>
                <p className="text-xs font-semibold text-gray-900">{product.size}</p>
              </div>
            </div>
          )}
          
          {product.pcsPerCarton && (
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Box size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Packing</p>
                <p className="text-xs font-semibold text-gray-900">{product.pcsPerCarton}</p>
              </div>
            </div>
          )}
          
          {product.availableQuantity && (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                <Package size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-0.5">In Stock</p>
                <p className="text-xs font-semibold text-blue-900">{product.availableQuantity} available</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900">Product ID:</span>
              <span className="ml-2 text-xs sm:text-sm md:text-base text-gray-600">{product.id}</span>
            </div>
            <div>
              <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                isSoldOut 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isSoldOut ? 'Out of Stock' : 'Available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}