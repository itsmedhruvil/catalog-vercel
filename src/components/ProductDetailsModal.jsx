import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Maximize2, Layers, Box, Package
} from 'lucide-react'

export default function ProductDetailsModal({ 
  product, 
  currentIndex, 
  setCurrentIndex, 
  onClose, 
  onOpenZoom 
}) {
  const images = product.images?.length > 0 ? product.images : null

  const nextImg = (e) => {
    e.stopPropagation()
    if (images && currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const prevImg = (e) => {
    e.stopPropagation()
    if (images && currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1 font-medium">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Details</h2>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Image Carousel Area */}
        <div className="relative aspect-square bg-gray-200 w-full max-w-4xl mx-auto cursor-pointer group" onClick={onOpenZoom}>
          {images ? (
            <>
              <img 
                src={images[currentIndex]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* Maximize Hint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={16} /> <span className="text-sm font-medium">Tap to zoom</span>
                </div>
              </div>

              {/* Navigation Arrows */}
              {currentIndex > 0 && (
                <button 
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 text-gray-800 rounded-full shadow-md backdrop-blur-sm"
                  onClick={prevImg}
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 text-gray-800 rounded-full shadow-md backdrop-blur-sm"
                  onClick={nextImg}
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5">
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} 
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
              <ImageIcon size={48} className="mb-2" />
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Product Info Area */}
        <div className="p-5 max-w-4xl mx-auto bg-white min-h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
          </div>

          {/* Details Badges */}
          <div className="flex flex-col gap-3 mb-6">
            {product.size && (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100"><Layers size={20} className="text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Size</p>
                  <p className="font-semibold text-gray-900">{product.size}</p>
                </div>
              </div>
            )}
            
            {product.pcsPerCarton && (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100"><Box size={20} className="text-gray-500" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Packing</p>
                  <p className="font-semibold text-gray-900">{product.pcsPerCarton}</p>
                </div>
              </div>
            )}
            
            {product.availableQuantity && (
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100"><Package size={20} className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-0.5">In Stock</p>
                  <p className="font-semibold text-blue-900">{product.availableQuantity} available</p>
                </div>
              </div>
            )}
          </div>

          {product.description && (
            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
          
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  )
}