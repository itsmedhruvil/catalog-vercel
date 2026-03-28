'use client'

import { useState, useRef } from 'react'
import { X, Plus, Loader2, Trash2, Truck, Calendar, MapPin, User, BarChart3, TrendingUp, Package, Tag, Flag, Star, Clock, CheckCircle } from 'lucide-react'
import { uploadImage } from '@/lib/api'

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function ProductFormModalEnhanced({ product, categories, onClose, onSave, onDelete }) {
  const isEdit = !!product
  const defaultCategory = categories.length > 0 ? categories[0] : 'uncategorized'
  
  const [form, setForm] = useState(
    product
      ? { 
          ...product, 
          availableQuantity: product.availableQuantity ?? '', 
          size: product.size ?? '', 
          pcsPerCarton: product.pcsPerCarton ?? '',
          deliveryStatus: product.deliveryStatus || 'pending',
          deliveryTracking: product.deliveryTracking || '',
          deliveryNotes: product.deliveryNotes || '',
          estimatedDelivery: product.estimatedDelivery ? new Date(product.estimatedDelivery).toISOString().split('T')[0] : '',
          supplier: product.supplier || '',
          supplierContact: product.supplierContact || '',
          supplierLeadTime: product.supplierLeadTime || '',
          warehouseLocation: product.warehouseLocation || '',
          binLocation: product.binLocation || '',
          batchNumber: product.batchNumber || '',
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
          priority: product.priority || 'medium',
          reorderLevel: product.reorderLevel || '',
          reorderQuantity: product.reorderQuantity || '',
          tags: product.tags || [],
          isFeatured: product.isFeatured || false,
          salesLast30Days: product.salesLast30Days || 0,
          salesPrevious30Days: product.salesPrevious30Days || 0,
          totalSales: product.totalSales || 0,
          views: product.views || 0,
          conversionRate: product.conversionRate || 0,
          returnRate: product.returnRate || 0,
          avgDeliveryTime: product.avgDeliveryTime || 0,
          avgRating: product.avgRating || 0,
        }
      : { 
          name: '', 
          price: '', 
          category: defaultCategory, 
          description: '', 
          images: [], 
          availableQuantity: '', 
          size: '', 
          pcsPerCarton: '',
          deliveryStatus: 'pending',
          deliveryTracking: '',
          deliveryNotes: '',
          estimatedDelivery: '',
          supplier: '',
          supplierContact: '',
          supplierLeadTime: '',
          warehouseLocation: '',
          binLocation: '',
          batchNumber: '',
          expiryDate: '',
          priority: 'medium',
          reorderLevel: '',
          reorderQuantity: '',
          tags: [],
          isFeatured: false,
          salesLast30Days: 0,
          salesPrevious30Days: 0,
          totalSales: 0,
          views: 0,
          conversionRate: 0,
          returnRate: 0,
          avgDeliveryTime: 0,
          avgRating: 0,
        }
  )
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [newTag, setNewTag] = useState('')
  const fileRef = useRef(null)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
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

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    
    // Prepare data for API
    const submitData = {
      ...form,
      estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery) : null,
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
      supplierLeadTime: parseInt(form.supplierLeadTime) || 0,
      reorderLevel: parseInt(form.reorderLevel) || 0,
      reorderQuantity: parseInt(form.reorderQuantity) || 0,
      salesLast30Days: parseInt(form.salesLast30Days) || 0,
      salesPrevious30Days: parseInt(form.salesPrevious30Days) || 0,
      totalSales: parseInt(form.totalSales) || 0,
      views: parseInt(form.views) || 0,
      conversionRate: parseFloat(form.conversionRate) || 0,
      returnRate: parseFloat(form.returnRate) || 0,
      avgDeliveryTime: parseInt(form.avgDeliveryTime) || 0,
      avgRating: parseFloat(form.avgRating) || 0,
    }
    
    setSaving(true)
    setError('')
    try {
      await onSave(submitData)
    } catch (err) {
      setError(err.message || 'Save failed')
      setSaving(false)
    }
  }

  const calculateMetrics = () => {
    const salesGrowth = form.salesPrevious30Days > 0 
      ? ((form.salesLast30Days - form.salesPrevious30Days) / form.salesPrevious30Days) * 100 
      : 0

    const stockLevel = parseInt(form.availableQuantity) || 0
    const reorderAlert = stockLevel <= parseInt(form.reorderLevel) && form.reorderLevel > 0

    return {
      salesGrowth,
      reorderAlert,
      stockLevel,
      turnoverRate: stockLevel > 0 ? (form.salesLast30Days / stockLevel) * 100 : 0
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-gray-900/50 flex flex-col md:items-center md:justify-center">
      <div className="flex-1 w-full bg-white md:max-w-4xl md:flex-none md:max-h-[90vh] md:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up md:animate-zoom-in">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 bg-white/20 hover:bg-white/30 rounded-full">
              <X size={24} />
            </button>
            <div>
              <h2 className="text-lg font-bold">{isEdit ? 'Edit Product' : 'New Product'}</h2>
              <p className="text-sm opacity-90">Complete all sections for optimal management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'basic', label: 'Basic Info', icon: '📋' },
            { id: 'delivery', label: 'Delivery', icon: '🚚' },
            { id: 'warehouse', label: 'Warehouse', icon: '🏢' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'inventory', label: 'Inventory', icon: '📦' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Images {uploading && <span className="text-blue-500 font-normal">(uploading…)</span>}
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
                    placeholder="e.g. Premium Leather Watch"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₹</span>
                      <input
                        type="text"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="e.g. 2999"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-8 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="e.g. Standard, 42mm"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
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

                {/* Available Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    name="availableQuantity"
                    value={form.availableQuantity}
                    onChange={handleChange}
                    placeholder="Total items in stock"
                    min="0"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Product details, features, specifications..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Featured Product Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <h4 className="font-medium text-gray-900">Featured Product</h4>
                    <p className="text-sm text-gray-600">Display this product prominently in the catalog</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'isFeatured', type: 'checkbox', checked: !form.isFeatured } })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      form.isFeatured
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {form.isFeatured ? 'Featured' : 'Make Featured'}
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Management Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck size={20} />
                    Delivery Status & Tracking
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                      <select
                        name="deliveryStatus"
                        value={form.deliveryStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {DELIVERY_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                      <input
                        type="text"
                        name="deliveryTracking"
                        value={form.deliveryTracking}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., TRK123456789"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                      <input
                        type="date"
                        name="estimatedDelivery"
                        value={form.estimatedDelivery}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {PRIORITY_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                    <textarea
                      name="deliveryNotes"
                      value={form.deliveryNotes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Special delivery instructions, handling requirements..."
                    />
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Supplier Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                      <input
                        type="text"
                        name="supplier"
                        value={form.supplier}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Supplier Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                      <input
                        type="text"
                        name="supplierContact"
                        value={form.supplierContact}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Phone/Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (Days)</label>
                      <input
                        type="number"
                        name="supplierLeadTime"
                        value={form.supplierLeadTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avg Delivery Time (Days)</label>
                      <input
                        type="number"
                        name="avgDeliveryTime"
                        value={form.avgDeliveryTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warehouse Management Tab */}
            {activeTab === 'warehouse' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Warehouse Management
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Location</label>
                      <input
                        type="text"
                        name="warehouseLocation"
                        value={form.warehouseLocation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Warehouse A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bin Location</label>
                      <input
                        type="text"
                        name="binLocation"
                        value={form.binLocation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., A-12-B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={form.batchNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., BN-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={form.expiryDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Key Metrics Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Key Performance Metrics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sales Growth</p>
                          <p className={`text-2xl font-bold ${metrics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metrics.salesGrowth >= 0 ? '+' : ''}{metrics.salesGrowth.toFixed(1)}%
                          </p>
                        </div>
                        {metrics.salesGrowth >= 0 ? <TrendingUp size={24} className="text-green-500" /> : <TrendingDown size={24} className="text-red-500" />}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Stock Level</p>
                          <p className="text-2xl font-bold text-blue-600">{metrics.stockLevel}</p>
                        </div>
                        <Package size={24} className="text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Turnover Rate</p>
                          <p className="text-2xl font-bold text-purple-600">{metrics.turnoverRate.toFixed(1)}%</p>
                        </div>
                        <Clock size={24} className="text-purple-500" />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                          <p className="text-2xl font-bold text-yellow-600">{form.avgRating.toFixed(1)}</p>
                        </div>
                        <CheckCircle size={24} className="text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {metrics.reorderAlert && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle size={20} className="text-red-600" />
                      <span className="text-red-800 font-medium">Low Stock Alert: Reorder recommended</span>
                    </div>
                  )}
                </div>

                {/* Sales Analytics */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Sales Analytics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Last 30 Days</label>
                      <input
                        type="number"
                        name="salesLast30Days"
                        value={form.salesLast30Days}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Previous 30 Days</label>
                      <input
                        type="number"
                        name="salesPrevious30Days"
                        value={form.salesPrevious30Days}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Sales</label>
                      <input
                        type="number"
                        name="totalSales"
                        value={form.totalSales}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Views</label>
                      <input
                        type="number"
                        name="views"
                        value={form.views}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="conversionRate"
                        value={form.conversionRate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Return Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="returnRate"
                        value={form.returnRate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avg Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        name="avgRating"
                        value={form.avgRating}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Management Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Inventory Management
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={form.reorderLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                      <input
                        type="number"
                        name="reorderQuantity"
                        value={form.reorderQuantity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>

                  {/* Tags Management */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Section */}
            {isEdit && onDelete && (
              <div className="pt-6 border-t">
                {confirmDelete ? (
                  <div className="flex gap-3 items-center p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="flex-1 text-sm text-red-700 font-medium">Delete this product?</p>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
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