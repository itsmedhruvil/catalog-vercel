'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

export default function ProductImageGallery({ images, productName, imageFit = "cover" }) {
  const [mainImageIndex, setMainImageIndex] = useState(0)

  const nextImage = () => {
    if (images.length > 1) {
      setMainImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setMainImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const selectImage = (index) => {
    setMainImageIndex(index)
  }

  const openWhatsApp = () => {
    const message = `Hello I have inquiry for this ${productName}`
    const whatsappUrl = `https://wa.me/919712528819?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Main Image Section */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Main Image */}
        <div className="aspect-square bg-gray-100 relative group cursor-pointer">
          {images[mainImageIndex] ? (
            <img
              src={images[mainImageIndex]}
              alt={`${productName} - Image ${mainImageIndex + 1}`}
              className={`w-full h-full object-${imageFit}`}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-300">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 text-gray-600 rounded-full shadow-lg backdrop-blur-sm hover:bg-white transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 text-gray-600 rounded-full shadow-lg backdrop-blur-sm hover:bg-white transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Inquiry Button */}
          <button
            onClick={openWhatsApp}
            className="absolute bottom-4 right-4 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
          >
            <ZoomIn size={24} />
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              {mainImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                index === mainImageIndex 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {index === mainImageIndex && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-xl"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Inquiry Button */}
      <div className="lg:hidden">
        <button
          onClick={openWhatsApp}
          className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-colors"
        >
          Inquire Now
        </button>
      </div>
    </div>
  )
}