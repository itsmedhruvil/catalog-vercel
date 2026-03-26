'use client'

import { useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export default function LightboxModal({ product, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const images = product.images?.length > 0 ? product.images : null

  // Tracking pointers for multi-touch (pinch) and dragging
  const pointerCache = useRef(new Map())
  const initialPinchDistance = useRef(null)
  const initialScale = useRef(1)
  const isDragging = useRef(false)
  const lastTouch = useRef({ x: 0, y: 0 })

  const getDistance = (p1, p2) => Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)

  const handlePointerDown = (e) => {
    pointerCache.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointerCache.current.size === 2) {
      // Two fingers on screen -> start pinch
      const pointers = Array.from(pointerCache.current.values())
      initialPinchDistance.current = getDistance(pointers[0], pointers[1])
      initialScale.current = scale
      isDragging.current = false // Disable dragging while pinching
    } else if (pointerCache.current.size === 1 && scale > 1) {
      // One finger down and we are zoomed in -> start drag
      isDragging.current = true
      lastTouch.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerMove = (e) => {
    if (!pointerCache.current.has(e.pointerId)) return
    pointerCache.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointerCache.current.size === 2) {
      // Handle Pinch to Zoom
      const pointers = Array.from(pointerCache.current.values())
      const currentDistance = getDistance(pointers[0], pointers[1])

      if (initialPinchDistance.current > 0) {
        const zoomFactor = currentDistance / initialPinchDistance.current
        const newScale = Math.min(Math.max(1, initialScale.current * zoomFactor), 5) // Allow max 5x zoom
        setScale(newScale)
        
        // Auto-recenter if user pinches all the way out
        if (newScale === 1) setPosition({ x: 0, y: 0 })
      }
    } else if (pointerCache.current.size === 1 && isDragging.current) {
      // Handle Panning (dragging)
      const dx = e.clientX - lastTouch.current.x
      const dy = e.clientY - lastTouch.current.y
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      lastTouch.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerUp = (e) => {
    pointerCache.current.delete(e.pointerId)

    if (pointerCache.current.size < 2) {
      initialPinchDistance.current = null
    }

    if (pointerCache.current.size === 0) {
      isDragging.current = false
    } else if (pointerCache.current.size === 1 && scale > 1) {
      // User lifted one finger but one remains -> resume dragging smoothly
      const remainingPointer = Array.from(pointerCache.current.values())[0]
      lastTouch.current = { x: remainingPointer.clientX, y: remainingPointer.clientY }
      isDragging.current = true
    }
  }

  const toggleZoom = (e) => {
    e.stopPropagation()
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2.5) // Double tap zooms in
    }
  }

  const prev = e => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  const next = e => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)) }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 w-full flex justify-between items-center p-4 text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md">
          <X size={28} />
        </button>
        {images?.length > 1 && (
          <span className="font-medium tracking-widest text-sm">{idx + 1} / {images.length}</span>
        )}
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Image */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {images ? (
          <>
            <img 
              src={images[idx]}
              alt={product.name}
              className="max-w-full max-h-full object-contain pointer-events-none" 
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transitionDuration: isDragging.current || pointerCache.current.size === 2 ? '0s' : '0.2s',
              }}
              onClick={toggleZoom}
              draggable="false"
            />
            
            {/* Navigation Arrows */}
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

            {/* Dots Indicator */}
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

            {/* Zoom Button Controls Overlay */}
            <div className="absolute right-6 bottom-8 flex flex-col gap-3 z-20" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setScale(s => Math.min(s + 0.5, 5))}
                className="p-3 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20 shadow-lg active:bg-white/30"
              >
                <ZoomIn size={24} />
              </button>
              <button 
                onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
                className={`p-3 text-white rounded-full backdrop-blur-md shadow-lg border border-white/20 transition-colors ${scale > 1 ? 'bg-blue-600 border-blue-500' : 'bg-white/10'}`}
              >
                <ZoomOut size={24} />
              </button>
            </div>
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
