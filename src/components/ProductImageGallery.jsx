'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductImageGallery({ images, productName, imageFit = "cover", onImageClick }) {
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isMagnifying, setIsMagnifying] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })

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

  const openImagePopup = () => {
    if (onImageClick) {
      onImageClick(mainImageIndex)
    }
  }

  const handleMouseMove = (e) => {
    if (window.innerWidth >= 1024) { // Only on desktop
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMagnifierPosition({ x, y })
    }
  }

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) { // Only on desktop
      setIsMagnifying(true)
    } else {
      // On mobile/tablet, open popup on tap
      openImagePopup()
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) { // Only on desktop
      setIsMagnifying(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Image Section */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Main Image */}
        <div 
          className="aspect-square bg-gray-100 relative group cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={openImagePopup}
        >
          {images[mainImageIndex] ? (
            <img
              src={images[mainImageIndex]}
              alt={`${productName} - Image ${mainImageIndex + 1}`}
              className={`w-full h-full object-${imageFit} transition-transform duration-300 ease-out`}
              loading="lazy"
              style={{
                transform: isMagnifying && window.innerWidth >= 1024 ? 'scale(1.5)' : 'scale(1)',
                transformOrigin: `${magnifierPosition.x}px ${magnifierPosition.y}px`,
                transition: 'transform 0.3s ease-out'
              }}
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
    </div>
  )
}
