"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Plus,
  Eye,
  EyeOff,
  Users,
  Star
} from 'lucide-react';

export default function SimpleAnalyticsDashboard({ products = [], setProducts, showToast }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Simple analytics calculations based on existing data
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    
    // Calculate total stock with detailed breakdown
    let totalStockValue = 0;
    let totalHoldsValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;
    
    products.forEach(p => {
      const stock = parseInt(p.totalQuantity) || parseInt(p.availableQuantity) || 0;
      const holds = p.holds || [];
      const totalHold = holds.reduce((sum, h) => sum + (parseInt(h.quantity) || 0), 0);
      const available = Math.max(0, stock - totalHold);
      
      totalStockValue += available;
      totalHoldsValue += totalHold;
      
      if (available === 0) {
        outOfStockCount++;
      } else if (available <= (p.reorderLevel || 5)) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });
    
    const categories = [...new Set(products.map(p => p.category || 'uncategorized'))];
    const categoryDistribution = products.reduce((acc, p) => {
      const cat = p.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Count products with delivery times
    const productsWithDelivery = products.filter(p => p.deliveryTime).length;
    
    // Count products with images
    const productsWithImages = products.filter(p => p.images && p.images.length > 0).length;

    return {
      totalProducts,
      totalStock: totalStockValue,
      totalHolds: totalHoldsValue,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      categories,
      categoryDistribution,
      productsWithDelivery,
      productsWithImages
    };
  }, [products]);

  // Filtered products for detailed view
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'stock':
          const stockA = parseInt(a.totalQuantity || a.availableQuantity) || 0;
          const holdsA = a.holds || [];
          const totalHoldA = holdsA.reduce((sum, h) => sum + (parseInt(h.quantity) || 0), 0);
          const availableA = Math.max(0, stockA - totalHoldA);
          
          const stockB = parseInt(b.totalQuantity || b.availableQuantity) || 0;
          const holdsB = b.holds || [];
          const totalHoldB = holdsB.reduce((sum, h) => sum + (parseInt(h.quantity) || 0), 0);
          const availableB = Math.max(0, stockB - totalHoldB);
          
          aValue = availableA;
          bValue = availableB;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'delivery':
          aValue = a.deliveryTime || '';
          bValue = b.deliveryTime || '';
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
  }, [products, selectedCategory, sortBy, sortOrder]);

  const exportData = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Stock', 'Delivery Time', 'Price'],
      ...filteredProducts.map(p => [
        p.name,
        p.category || 'uncategorized',
        p.totalQuantity || 0,
        p.deliveryTime || 'N/A',
        p.price || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report exported successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Simple analytics for your catalog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download size={18} />
            Export Report
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Object.keys(analytics.categoryDistribution).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
                <option value="stock">Stock Level</option>
                <option value="category">Category</option>
                <option value="delivery">Delivery Time</option>
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
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSortBy('name');
                  setSortOrder('asc');
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
            </div>
            <Package size={40} className="text-blue-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{analytics.categories.length} categories</span>
          </div>
        </div>

        {/* Total Available Stock */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Available Stock</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalStock}</p>
            </div>
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Eye size={16} />
            <span>{analytics.inStockCount} in stock</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Products</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.lowStockCount}</p>
            </div>
            <AlertTriangle size={40} className="text-yellow-600" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-700">
            <TrendingDown size={16} />
            <span>Needs reorder</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.outOfStockCount}</p>
            </div>
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-red-700">
            <Package size={16} />
            <span>Critical attention needed</span>
          </div>
        </div>
      </div>

      {/* Additional Stock Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Holds */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock on Hold</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHolds}</p>
            </div>
            <Clock size={32} className="text-orange-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Items reserved in customer holds</p>
        </div>

        {/* Products with Delivery */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products with Delivery Info</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.productsWithDelivery}</p>
            </div>
            <Truck size={32} className="text-purple-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">{((analytics.productsWithDelivery / analytics.totalProducts) * 100).toFixed(1)}% of catalog</p>
        </div>

        {/* Products with Images */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products with Images</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.productsWithImages}</p>
            </div>
            <Star size={32} className="text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">{((analytics.productsWithImages / analytics.totalProducts) * 100).toFixed(1)}% of catalog</p>
        </div>
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Category Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => {
              const percentage = ((count / analytics.totalProducts) * 100).toFixed(1);
              const barWidth = `${percentage}%`;
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-500">{count} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
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

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Average Stock per Product</span>
              <span className="font-bold text-blue-700">
                {analytics.totalProducts > 0 ? Math.round(analytics.totalStock / analytics.totalProducts) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Products with Delivery Info</span>
              <span className="font-bold text-green-700">
                {((analytics.productsWithDelivery / analytics.totalProducts) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Products with Images</span>
              <span className="font-bold text-purple-700">
                {((analytics.productsWithImages / analytics.totalProducts) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Products per Category</span>
              <span className="font-bold text-orange-700">
                {analytics.totalProducts > 0 ? Math.round(analytics.totalProducts / analytics.categories.length) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-semibold text-gray-600">Product</th>
                  <th className="pb-3 font-semibold text-gray-600">Category</th>
                  <th className="pb-3 font-semibold text-gray-600">Available Stock</th>
                  <th className="pb-3 font-semibold text-gray-600">Delivery Time</th>
                  <th className="pb-3 font-semibold text-gray-600">Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stock = parseInt(product.totalQuantity || product.availableQuantity) || 0;
                  const holds = product.holds || [];
                  const totalHold = holds.reduce((sum, h) => sum + (parseInt(h.quantity) || 0), 0);
                  const availableStock = Math.max(0, stock - totalHold);
                  
                  return (
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
                            <p className="text-sm text-gray-500">{product.size || 'No size'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {product.category || 'uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          availableStock > 10 ? 'bg-green-100 text-green-800' : 
                          availableStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {availableStock}
                        </span>
                      </td>
                      <td className="py-3">
                        {product.deliveryTime ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {product.deliveryTime}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </td>
                      <td className="py-3 font-medium">{product.price || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}