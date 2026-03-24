'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus, Edit2, Share2, X, Check, Image as ImageIcon,
  ChevronLeft, ChevronRight, CheckCircle2, Link as LinkIcon,
  Loader2
} from 'lucide-react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api'
import ProductFormModal from './ProductFormModal'
import LightboxModal from './LightboxModal'
import ShareOptionsModal from './ShareOptionsModal'

export default function CatalogClient({ initialSharedIds = [], initialFilter = 'all' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(
    ['all', 'branded', 'unbranded'].includes(initialFilter) ? initialFilter : 'all'
  )
  const [sharedIds] = useState(initialSharedIds)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [activeModal, setActiveModal] = useState(null)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [toast, setToast] = useState('')

  const isSharedView = sharedIds.length > 0

  // ── Load products ────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch {
      showToast('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  // ── Derived list ─────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    if (sharedIds.length > 0) return products.filter(p => sharedIds.includes(p.id))
    if (filter !== 'all') return products.filter(p => p.category === filter)
    return products
  }, [products, filter, sharedIds])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const copyLink = (url) => {
    navigator.clipboard?.writeText(url).catch(() => {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    showToast('Link copied!')
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (activeModal === 'add') {
      const created = await createProduct(data)
      setProducts(prev => [created, ...prev])
      showToast('Product added')
    } else {
      const updated = await updateProduct(data.id, data)
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
      showToast('Product updated')
    }
    setActiveModal(null)
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setActiveModal(null)
    showToast('Product deleted')
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const shareSelected = () => {
    const base = window.location.origin + '/catalog'
    copyLink(`${base}?shared=${[...selectedIds].join(',')}`)
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const shareCategoryLink = (cat) => {
    copyLink(`${window.location.origin}/catalog?filter=${cat}`)
  }

  const shareAllLink = () => {
    copyLink(`${window.location.origin}/catalog`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 bg-white shadow-sm px-3 sm:px-4 py-3 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
            {isSharedView ? 'Curated Collection' : 'My Catalog'}
          </h1>
          {!isSharedView && <p className="text-xs text-gray-500 hidden sm:block">Manage & Share Products</p>}
        </div>

        {!isSharedView && (
          <div className="flex gap-1.5 sm:gap-2 items-center shrink-0 ml-2">
            {isSelectionMode ? (
              <>
                <button
                  onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()) }}
                  className="p-1.5 sm:p-2 bg-gray-100 text-gray-600 rounded-full"
                >
                  <X size={18} className="sm:size-5" />
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={shareSelected}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-semibold"
                  >
                    <Share2 size={14} className="sm:size-4" />
                    <span className="hidden sm:inline">Share </span>({selectedIds.size})
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveModal('shareOptions')}
                  className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Share options"
                >
                  <LinkIcon size={20} className="sm:size-5.5" />
                </button>
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Select products to share"
                >
                  <CheckCircle2 size={20} className="sm:size-5.5" />
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── FILTERS ── */}
      {!isSharedView && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'branded', 'unbranded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* ── GRID ── */}
      <main className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={28} />
            <span className="text-sm">Loading…</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ImageIcon className="mx-auto mb-4 opacity-20" size={64} />
            <p className="font-medium">No products yet</p>
            {!isSharedView && <p className="text-sm mt-1">Tap + to add your first item</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayed.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(product.id)}
                onImageClick={() => {
                  if (isSelectionMode) { toggleSelect(product.id); return }
                  setCurrentProduct(product)
                  setLightboxIndex(0)
                  setActiveModal('lightbox')
                }}
                onEdit={() => {
                  setCurrentProduct(product)
                  setActiveModal('edit')
                }}
                hideControls={isSharedView}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FAB ── */}
      {!isSharedView && !isSelectionMode && (
        <button
          onClick={() => { setCurrentProduct(null); setActiveModal('add') }}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-transform z-20"
          aria-label="Add product"
        >
          <Plus size={28} />
        </button>
      )}

      {/* ── MODALS ── */}
      {activeModal === 'shareOptions' && (
        <ShareOptionsModal
          onClose={() => setActiveModal(null)}
          onShareAll={() => { shareAllLink(); setActiveModal(null) }}
          onShareBranded={() => { shareCategoryLink('branded'); setActiveModal(null) }}
          onShareUnbranded={() => { shareCategoryLink('unbranded'); setActiveModal(null) }}
          onCustomSelect={() => { setActiveModal(null); setIsSelectionMode(true) }}
        />
      )}

      {(activeModal === 'add' || activeModal === 'edit') && (
        <ProductFormModal
          product={activeModal === 'edit' ? currentProduct : null}
          onClose={() => setActiveModal(null)}
          onSave={handleSave}
          onDelete={activeModal === 'edit' ? handleDelete : null}
        />
      )}

      {activeModal === 'lightbox' && currentProduct && (
        <LightboxModal
          product={currentProduct}
          initialIndex={lightboxIndex}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-50 text-sm font-semibold animate-fade-in-up whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, isSelectionMode, isSelected, onImageClick, onEdit, hideControls }) {
  return (
    <div className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${
      isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-100'
    }`}>
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden group"
        onClick={onImageClick}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300">
            <ImageIcon size={48} />
          </div>
        )}

        {product.images?.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            1/{product.images.length}
          </div>
        )}

        {isSelectionMode && (
          <div className="absolute inset-0 bg-black/10 flex items-start justify-start p-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
              isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-transparent'
            }`}>
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
            {product.price && <p className="text-sm text-gray-500 mt-0.5">{product.price}</p>}
            {product.quantity !== undefined && (
              <p className="text-xs text-gray-400 mt-0.5">Qty: {product.quantity}</p>
            )}
          </div>
          {!hideControls && !isSelectionMode && (
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg shrink-0"
              aria-label="Edit product"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
