'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

export default function LightboxModal({ product, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const images = product.images?.length > 0 ? product.images : null

  const prev = e => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  const next = e => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)) }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 w-full flex justify-between items-center p-4 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full hover:bg-black/60">
          <X size={24} />
        </button>
        {images?.length > 1 && (
          <span className="font-medium tracking-widest text-sm">{idx + 1} / {images.length}</span>
        )}
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Image */}
      <div className="flex-1 relative flex items-center justify-center">
        {images ? (
          <>
            <img
              src={images[idx]}
              alt={product.name}
              className="max-w-full max-h-full object-contain select-none"
              onClick={e => e.stopPropagation()}
              draggable={false}
            />
            {idx > 0 && (
              <button
                className="absolute left-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70"
                onClick={prev}
              >
                <ChevronLeft size={28} />
              </button>
            )}
            {idx < images.length - 1 && (
              <button
                className="absolute right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70"
                onClick={next}
              >
                <ChevronRight size={28} />
              </button>
            )}
            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setIdx(i) }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === idx ? 'bg-white scale-125' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <ImageIcon size={64} className="mb-4 opacity-50" />
            <p>No image available</p>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div
        className="px-6 pt-4 pb-10 bg-gradient-to-t from-black to-transparent text-white w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-1 truncate">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
            )}
          </div>
          {product.price && (
            <span className="text-xl font-bold shrink-0">{product.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}
