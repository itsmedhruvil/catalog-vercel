'use client'

import { useState, useRef } from 'react'
import { X, Plus, Loader2, Trash2 } from 'lucide-react'
import { uploadImage } from '@/lib/api'

export default function ProductFormModal({ product, categories, onClose, onSave, onDelete }) {
  const isEdit = !!product
  const defaultCategory = categories.length > 0 ? categories[0] : 'uncategorized'
  const [form, setForm] = useState(
    product
      ? { 
          ...product, 
          // Use totalQuantity as the single source of truth for stock
          totalQuantity: product.totalQuantity ?? product.availableQuantity ?? '', 
          size: product.size ?? '', 
          pcsPerCarton: product.pcsPerCarton ?? '' 
        }
      : { name: '', price: '', category: defaultCategory, description: '', images: [], totalQuantity: '', size: '', pcsPerCarton: '' }
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)))
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = idx =>
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Save failed')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-gray-900/50 flex flex-col md:items-center md:justify-center">
      <div className="flex-1 w-full bg-white md:max-w-2xl md:flex-none md:max-h-[90vh] md:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up md:animate-zoom-in">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold">{isEdit ? 'Edit Item' : 'New Item'}</h2>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="text-blue-600 font-bold px-2 py-1 disabled:opacity-40 flex items-center gap-1"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Save
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images {uploading && <span className="text-blue-500 font-normal">(uploading…)</span>}
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                    <img src={img} alt="" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? <Loader2 size={22} className="animate-spin" />
                    : <><Plus size={22} className="mb-1" /><span className="text-xs font-medium">Add Photo</span></>
                  }
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFiles}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Leather Bag"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Price + Category */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-8 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-white capitalize"
                >
                  {categories.length === 0 && <option value="uncategorized">Uncategorized</option>}
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Size + Pcs Per Carton */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Size</label>
                <input
                  type="text"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  placeholder="e.g. Large, 42mm"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pcs / Carton</label>
                <input
                  type="text"
                  name="pcsPerCarton"
                  value={form.pcsPerCarton}
                  onChange={handleChange}
                  placeholder="e.g. 50 pcs"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Total Quantity (Stock) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Total Stock Quantity *
              </label>
              <input
                type="number"
                name="totalQuantity"
                value={form.totalQuantity}
                onChange={handleChange}
                placeholder="Total items in stock (e.g., 100)"
                min="0"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the total available stock. Stock will be reduced when orders are confirmed.
              </p>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Time</label>
              <input
                type="text"
                name="deliveryTime"
                value={form.deliveryTime || ""}
                onChange={handleChange}
                placeholder="e.g., 3-5 days, 1 week, 10-15 days"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estimated delivery time for this product
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Details (Optional)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Sizes, colours, notes…"
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Delete */}
            {isEdit && onDelete && (
              <div className="pt-2">
                {confirmDelete ? (
                  <div className="flex gap-3 items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="flex-1 text-sm text-red-700 font-medium">Delete this product?</p>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600"
                  >
                    <Trash2 size={15} /> Delete product
                  </button>
                )}
              </div>
            )}

            <div className="h-8" />
          </form>
        </div>
      </div>
    </div>
  )
}
