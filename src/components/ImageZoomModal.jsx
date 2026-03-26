import { useState, useRef } from 'react'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

export default function ImageZoomModal({ imageSrc, onClose }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
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

  return (
    <div 
      className="fixed inset-0 z-[70] bg-black flex flex-col animate-fade-in touch-none select-none"
    >
      {/* Top Bar Controls */}
      <div className="absolute top-0 w-full flex justify-end p-4 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md">
          <X size={28} />
        </button>
      </div>

      {/* Draggable & Pinch-Zoomable Area */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img 
          src={imageSrc} 
          alt="Zoomed product"
          className="max-w-full max-h-full object-contain pointer-events-none" 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transitionDuration: isDragging.current || pointerCache.current.size === 2 ? '0s' : '0.2s',
          }}
          onDoubleClick={toggleZoom}
          draggable="false"
        />
        
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
      </div>
    </div>
  )
}