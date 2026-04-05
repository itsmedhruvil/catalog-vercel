"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  User,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SimpleDeliveryManagement({ isOpen, onClose, products = [], setProducts, showToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Initialize default suppliers and warehouses
  useEffect(() => {
    const defaultSuppliers = [
      { id: 's1', name: 'Local Supplier', leadTime: '3-5 days', contact: 'contact@local.com', phone: '+1234567890' },
      { id: 's2', name: 'Regional Distributor', leadTime: '5-7 days', contact: 'sales@regional.com', phone: '+1234567891' },
      { id: 's3', name: 'National Warehouse', leadTime: '7-10 days', contact: 'orders@national.com', phone: '+1234567892' }
    ];
    
    const defaultWarehouses = [
      { id: 'w1', name: 'Main Warehouse', location: 'City Center', capacity: 'High', contact: 'warehouse@main.com' },
      { id: 'w2', name: 'Regional Hub', location: 'Suburban Area', capacity: 'Medium', contact: 'hub@regional.com' },
      { id: 'w3', name: 'Distribution Center', location: 'Industrial Zone', capacity: 'High', contact: 'center@dist.com' }
    ];

    setSuppliers(defaultSuppliers);
    setWarehouses(defaultWarehouses);
  }, []);

  // Delivery status options
  const DELIVERY_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'processing', label: 'Processing', color: 'bg-gray-100 text-gray-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-gray-100 text-gray-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];

  // Enhanced products with delivery information
  const enhancedProducts = useMemo(() => {
    return products.map(product => {
      const supplier = suppliers.find(s => s.id === product.supplierId) || { name: 'Unknown Supplier', leadTime: 'N/A' };
      const warehouse = warehouses.find(w => w.id === product.warehouseId) || { name: 'Unknown Warehouse', location: 'N/A' };
      
      return {
        ...product,
        supplierName: supplier.name,
        supplierLeadTime: supplier.leadTime,
        warehouseName: warehouse.name,
        warehouseLocation: warehouse.location,
        deliveryStatus: product.deliveryStatus || 'pending',
        estimatedDelivery: product.estimatedDelivery || 'N/A',
        trackingNumber: product.trackingNumber || 'N/A'
      };
    });
  }, [products, suppliers, warehouses]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = enhancedProducts;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.supplierName.toLowerCase().includes(query) ||
        p.warehouseName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.deliveryStatus === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'supplier':
          aValue = a.supplierName || '';
          bValue = b.supplierName || '';
          break;
        case 'warehouse':
          aValue = a.warehouseName || '';
          bValue = b.warehouseName || '';
          break;
        case 'status':
          aValue = a.deliveryStatus || '';
          bValue = b.deliveryStatus || '';
          break;
        case 'delivery':
          aValue = a.estimatedDelivery || '';
          bValue = b.estimatedDelivery || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (sortOrder === 'desc') {
        if (typeof aValue === 'string') {
          return bValue.localeCompare(aValue);
        }
        return bValue - aValue;
      } else {
        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue);
        }
        return aValue - bValue;
      }
    });

    return filtered;
  }, [enhancedProducts, searchQuery, filterStatus, sortBy, sortOrder]);

  const updateDeliveryStatus = (productId, newStatus) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, deliveryStatus: newStatus }
        : p
    ));
    showToast(`Updated delivery status to ${newStatus}`);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addSupplier':
        showToast('Redirecting to add new supplier...');
        // In a real app, this would navigate to supplier management
        break;
      case 'updateWarehouse':
        showToast('Redirecting to warehouse management...');
        // In a real app, this would navigate to warehouse management
        break;
      case 'trackShipment':
        showToast('Redirecting to shipment tracking...');
        // In a real app, this would navigate to shipment tracking
        break;
      case 'generateReport':
        exportDeliveryReport();
        break;
      default:
        showToast('Action in development');
    }
  };

  const handleProductAction = (productId, action) => {
    const product = enhancedProducts.find(p => p.id === productId);
    switch (action) {
      case 'edit':
        showToast(`Editing product: ${product?.name}`);
        // In a real app, this would open an edit modal or navigate to edit page
        break;
      case 'view':
        showToast(`Viewing details for: ${product?.name}`);
        // In a real app, this would open a details modal or navigate to product page
        break;
      default:
        showToast('Action in development');
    }
  };

  const exportDeliveryReport = () => {
    const csvContent = [
      ['Product Name', 'Supplier', 'Warehouse', 'Status', 'Estimated Delivery', 'Tracking Number'],
      ...filteredProducts.map(p => [
        p.name,
        p.supplierName,
        p.warehouseName,
        p.deliveryStatus,
        p.estimatedDelivery,
        p.trackingNumber
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Delivery report exported successfully');
  };

  const getStatusColor = (status) => {
    const statusObj = DELIVERY_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-sm text-gray-500">Track deliveries and manage suppliers</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportDeliveryReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{enhancedProducts.length}</p>
              </div>
              <Package size={32} className="text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enhancedProducts.filter(p => p.deliveryStatus === 'delivered').length}
                </p>
              </div>
              <Truck size={32} className="text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enhancedProducts.filter(p => ['processing', 'shipped'].includes(p.deliveryStatus)).length}
                </p>
              </div>
              <Clock size={32} className="text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
              <User size={32} className="text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
              <MapPin size={32} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products, suppliers, warehouses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                {DELIVERY_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Product Name</option>
                <option value="supplier">Supplier</option>
                <option value="warehouse">Warehouse</option>
                <option value="status">Status</option>
                <option value="delivery">Delivery Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Delivery Status Overview
            </h3>
            <div className="space-y-3">
              {DELIVERY_STATUSES.map(status => {
                const count = enhancedProducts.filter(p => p.deliveryStatus === status.value).length;
                const percentage = ((count / enhancedProducts.length) * 100).toFixed(1);
                const barWidth = `${percentage}%`;
                return (
                  <div key={status.value} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="capitalize font-medium text-gray-900">{status.label}</span>
                        <span className="text-sm text-gray-500">{count} products</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gray-600"
                          style={{ width: barWidth }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleQuickAction('addSupplier')}
                className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors text-left cursor-pointer"
              >
                <div className="font-semibold">Add New Supplier</div>
                <div className="text-xs text-gray-600">Manage your supplier network</div>
              </button>
              <button 
                onClick={() => handleQuickAction('updateWarehouse')}
                className="w-full p-3 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left cursor-pointer"
              >
                <div className="font-semibold">Update Warehouse</div>
                <div className="text-xs text-gray-600">Manage warehouse locations</div>
              </button>
              <button 
                onClick={() => handleQuickAction('trackShipment')}
                className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors text-left cursor-pointer"
              >
                <div className="font-semibold">Track Shipment</div>
                <div className="text-xs text-gray-600">Monitor delivery progress</div>
              </button>
              <button 
                onClick={() => handleQuickAction('generateReport')}
                className="w-full p-3 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors text-left cursor-pointer"
              >
                <div className="font-semibold">Generate Report</div>
                <div className="text-xs text-gray-600">Export delivery analytics</div>
              </button>
            </div>
          </div>
        </div>

        {/* Product Delivery List */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Deliveries</h3>
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-semibold text-gray-600">Product</th>
                  <th className="pb-3 font-semibold text-gray-600">Supplier</th>
                  <th className="pb-3 font-semibold text-gray-600">Warehouse</th>
                  <th className="pb-3 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 font-semibold text-gray-600">Estimated Delivery</th>
                  <th className="pb-3 font-semibold text-gray-600">Tracking</th>
                  <th className="pb-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.supplierName}</p>
                        <p className="text-sm text-gray-500">{product.supplierLeadTime}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.warehouseName}</p>
                        <p className="text-sm text-gray-500">{product.warehouseLocation}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <select
                        value={product.deliveryStatus}
                        onChange={(e) => updateDeliveryStatus(product.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.deliveryStatus)}`}
                      >
                        {DELIVERY_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 font-medium">{product.estimatedDelivery}</td>
                    <td className="py-3">
                      {product.trackingNumber !== 'N/A' ? (
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {product.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not available</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleProductAction(product.id, 'edit')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleProductAction(product.id, 'view')}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}