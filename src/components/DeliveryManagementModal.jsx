import { useState, useEffect } from 'react';
import {
  Truck,
  Calendar,
  MapPin,
  Package,
  User,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

export default function DeliveryManagementModal({ product, onClose, onSave }) {
  const [deliveryData, setDeliveryData] = useState({
    deliveryStatus: product.deliveryStatus || 'pending',
    deliveryTracking: product.deliveryTracking || '',
    deliveryNotes: product.deliveryNotes || '',
    estimatedDelivery: product.estimatedDelivery || '',
    supplier: product.supplier || '',
    supplierContact: product.supplierContact || '',
    supplierLeadTime: product.supplierLeadTime || '',
    warehouseLocation: product.warehouseLocation || '',
    binLocation: product.binLocation || '',
    batchNumber: product.batchNumber || '',
    expiryDate: product.expiryDate || '',
    priority: product.priority || 'medium',
    reorderLevel: product.reorderLevel || '',
    reorderQuantity: product.reorderQuantity || '',
    tags: product.tags || [],
    isFeatured: product.isFeatured || false
  });

  const [newTag, setNewTag] = useState('');
  const [analytics, setAnalytics] = useState({
    salesLast30Days: product.salesLast30Days || 0,
    salesPrevious30Days: product.salesPrevious30Days || 0,
    totalSales: product.totalSales || 0,
    views: product.views || 0,
    conversionRate: product.conversionRate || 0,
    returnRate: product.returnRate || 0,
    avgDeliveryTime: product.avgDeliveryTime || 0,
    avgRating: product.avgRating || 0,
    customerReviews: product.customerReviews || []
  });

  const handleDeliveryChange = (field, value) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyticsChange = (field, value) => {
    setAnalytics(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !deliveryData.tags.includes(newTag.trim())) {
      setDeliveryData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setDeliveryData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateMetrics = () => {
    const salesGrowth = analytics.salesPrevious30Days > 0 
      ? ((analytics.salesLast30Days - analytics.salesPrevious30Days) / analytics.salesPrevious30Days) * 100 
      : 0;

    const stockLevel = parseInt(product.totalQuantity) || 0;
    const reorderAlert = stockLevel <= parseInt(deliveryData.reorderLevel) && deliveryData.reorderLevel > 0;

    return {
      salesGrowth,
      reorderAlert,
      stockLevel,
      turnoverRate: stockLevel > 0 ? (analytics.salesLast30Days / stockLevel) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

  const handleSubmit = () => {
    const updatedProduct = {
      ...product,
      ...deliveryData,
      ...analytics,
      estimatedDelivery: deliveryData.estimatedDelivery ? new Date(deliveryData.estimatedDelivery) : null,
      expiryDate: deliveryData.expiryDate ? new Date(deliveryData.expiryDate) : null,
      supplierLeadTime: parseInt(deliveryData.supplierLeadTime) || 0,
      reorderLevel: parseInt(deliveryData.reorderLevel) || 0,
      reorderQuantity: parseInt(deliveryData.reorderQuantity) || 0
    };
    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <Truck size={28} />
            <div>
              <h2 className="text-xl font-bold">Delivery & Analytics Management</h2>
              <p className="text-sm opacity-90">{product.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Delivery Management */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={20} />
                Delivery Status
              </h3>
              
              <div className="space-y-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <div className="grid grid-cols-5 gap-2">
                    {DELIVERY_STATUSES.map(status => (
                      <button
                        key={status.value}
                        onClick={() => handleDeliveryChange('deliveryStatus', status.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          deliveryData.deliveryStatus === status.value
                            ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={deliveryData.deliveryTracking}
                      onChange={(e) => handleDeliveryChange('deliveryTracking', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., TRK123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                    <input
                      type="date"
                      value={deliveryData.estimatedDelivery}
                      onChange={(e) => handleDeliveryChange('estimatedDelivery', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                  <textarea
                    value={deliveryData.deliveryNotes}
                    onChange={(e) => handleDeliveryChange('deliveryNotes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Special delivery instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Warehouse Management */}
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
                    value={deliveryData.warehouseLocation}
                    onChange={(e) => handleDeliveryChange('warehouseLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Warehouse A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bin Location</label>
                  <input
                    type="text"
                    value={deliveryData.binLocation}
                    onChange={(e) => handleDeliveryChange('binLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A-12-B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    value={deliveryData.batchNumber}
                    onChange={(e) => handleDeliveryChange('batchNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BN-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={deliveryData.expiryDate}
                    onChange={(e) => handleDeliveryChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                    value={deliveryData.supplier}
                    onChange={(e) => handleDeliveryChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Supplier Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                  <input
                    type="text"
                    value={deliveryData.supplierContact}
                    onChange={(e) => handleDeliveryChange('supplierContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone/Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={deliveryData.supplierLeadTime}
                    onChange={(e) => handleDeliveryChange('supplierLeadTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select
                    value={deliveryData.priority}
                    onChange={(e) => handleDeliveryChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PRIORITY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & Inventory */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Key Performance Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-2xl font-bold text-yellow-600">{analytics.avgRating.toFixed(1)}</p>
                    </div>
                    <CheckCircle size={24} className="text-yellow-500" />
                  </div>
                </div>
              </div>

              {metrics.reorderAlert && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-600" />
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
                    value={analytics.salesLast30Days}
                    onChange={(e) => handleAnalyticsChange('salesLast30Days', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sales Previous 30 Days</label>
                  <input
                    type="number"
                    value={analytics.salesPrevious30Days}
                    onChange={(e) => handleAnalyticsChange('salesPrevious30Days', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Sales</label>
                  <input
                    type="number"
                    value={analytics.totalSales}
                    onChange={(e) => handleAnalyticsChange('totalSales', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Views</label>
                  <input
                    type="number"
                    value={analytics.views}
                    onChange={(e) => handleAnalyticsChange('views', parseInt(e.target.value) || 0)}
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
                    value={analytics.conversionRate}
                    onChange={(e) => handleAnalyticsChange('conversionRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={analytics.returnRate}
                    onChange={(e) => handleAnalyticsChange('returnRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avg Delivery Time (Days)</label>
                  <input
                    type="number"
                    value={analytics.avgDeliveryTime}
                    onChange={(e) => handleAnalyticsChange('avgDeliveryTime', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Management */}
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
                    value={deliveryData.reorderLevel}
                    onChange={(e) => handleDeliveryChange('reorderLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                  <input
                    type="number"
                    value={deliveryData.reorderQuantity}
                    onChange={(e) => handleDeliveryChange('reorderQuantity', e.target.value)}
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
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {deliveryData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Product Toggle */}
              <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-900">Featured Product</h4>
                  <p className="text-sm text-gray-600">Display this product prominently</p>
                </div>
                <button
                  onClick={() => handleDeliveryChange('isFeatured', !deliveryData.isFeatured)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    deliveryData.isFeatured
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {deliveryData.isFeatured ? 'Featured' : 'Make Featured'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}