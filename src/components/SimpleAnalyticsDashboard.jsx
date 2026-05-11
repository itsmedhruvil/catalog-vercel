"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Star,
  DollarSign,
  Zap,
  Clock,
  Eye,
  BarChart3,
  ShoppingCart,
  Award,
  Flame,
  ArrowUp,
  ArrowDown,
  Target,
  PieChart
} from 'lucide-react';

export default function SimpleAnalyticsDashboard({ products = [], orders = [], setProducts, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('high-value');

  // Product-level analytics computed from products and orders
  const productAnalytics = useMemo(() => {
    // Build per-product metrics from orders
    const productMetrics = {};
    
    products.forEach(product => {
      const productId = product.id || product._id;
      productMetrics[productId] = {
        ...product,
        productId,
        stock: parseInt(product.totalQuantity) || 0,
        price: parseFloat(product.price) || 0,
        totalOrdered: 0,
        orderCount: 0,
        revenueGenerated: 0,
        totalRevenue: 0,
        lastOrderedDate: null,
        averageOrderQty: 0
      };
    });

    // Process all delivered/completed orders to calculate sales velocity
    orders.forEach(order => {
      const orderStatus = order.orderStatus || order.status;
      if (orderStatus !== 'delivered' && orderStatus !== 'confirmed') return;
      
      (order.items || []).forEach(item => {
        const pid = typeof item.productId === 'string' ? item.productId : item.productId?._id || item.productId?.id;
        if (!pid || !productMetrics[pid]) return;
        
        const quantity = item.quantity || 0;
        const itemTotal = item.totalPrice || (quantity * (item.unitPrice || 0));
        
        productMetrics[pid].totalOrdered += quantity;
        productMetrics[pid].orderCount += 1;
        productMetrics[pid].revenueGenerated += itemTotal;
        productMetrics[pid].totalRevenue += item.totalPrice || 0;
        
        const orderDate = order.createdAt || order.orderDate;
        if (orderDate && (!productMetrics[pid].lastOrderedDate || new Date(orderDate) > new Date(productMetrics[pid].lastOrderedDate))) {
          productMetrics[pid].lastOrderedDate = orderDate;
        }
      });
    });

    // Calculate derived metrics
    Object.values(productMetrics).forEach(pm => {
      pm.averageOrderQty = pm.orderCount > 0 ? Math.round(pm.totalOrdered / pm.orderCount) : 0;
      pm.daysSinceLastOrder = pm.lastOrderedDate 
        ? Math.floor((Date.now() - new Date(pm.lastOrderedDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      pm.stockTurnoverRate = pm.stock > 0 && pm.totalOrdered > 0 ? (pm.totalOrdered / pm.stock).toFixed(1) : 0;
      pm.isFastMoving = pm.orderCount >= 3 && pm.totalOrdered >= 10;
      pm.isHighValue = pm.price >= 5000 || pm.revenueGenerated >= 10000;
      pm.isLowStock = pm.stock > 0 && pm.stock <= 10;
      pm.isOutOfStock = pm.stock === 0;
      pm.isSlowMoving = pm.orderCount > 0 && pm.orderCount <= 2;
    });

    return Object.values(productMetrics);
  }, [products, orders]);

  // Analytical categories
  const analysisCategories = useMemo(() => {
    const highValue = [...productAnalytics]
      .filter(p => p.isHighValue)
      .sort((a, b) => b.price - a.price);

    const fastMoving = [...productAnalytics]
      .filter(p => p.isFastMoving)
      .sort((a, b) => b.totalOrdered - a.totalOrdered);

    const lowStock = [...productAnalytics]
      .filter(p => p.isLowStock && !p.isOutOfStock)
      .sort((a, b) => a.stock - b.stock);

    const outOfStock = [...productAnalytics]
      .filter(p => p.isOutOfStock)
      .sort((a, b) => (b.revenueGenerated || 0) - (a.revenueGenerated || 0));

    const slowMoving = [...productAnalytics]
      .filter(p => p.isSlowMoving)
      .sort((a, b) => (b.stock || 0) - (a.stock || 0));

    const neverOrdered = [...productAnalytics]
      .filter(p => p.orderCount === 0)
      .sort((a, b) => b.stock - a.stock);

    const topRevenue = [...productAnalytics]
      .filter(p => p.revenueGenerated > 0)
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
      .slice(0, 20);

    return {
      highValue,
      fastMoving,
      lowStock,
      outOfStock,
      slowMoving,
      neverOrdered,
      topRevenue,
      total: productAnalytics.length
    };
  }, [productAnalytics]);

  const filteredAnalytics = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case 'high-value': data = analysisCategories.highValue; break;
      case 'fast-moving': data = analysisCategories.fastMoving; break;
      case 'low-stock': data = analysisCategories.lowStock; break;
      case 'out-of-stock': data = analysisCategories.outOfStock; break;
      case 'slow-moving': data = analysisCategories.slowMoving; break;
      case 'never-ordered': data = analysisCategories.neverOrdered; break;
      case 'top-revenue': data = analysisCategories.topRevenue; break;
      default: data = analysisCategories.highValue;
    }

    if (selectedCategory !== 'all') {
      data = data.filter(p => p.category === selectedCategory);
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case 'stock': return a.stock - b.stock;
        case 'orders': return b.orderCount - a.orderCount;
        case 'price': return b.price - a.price;
        case 'revenue': return (b.revenueGenerated || 0) - (a.revenueGenerated || 0);
        case 'quantity': return b.totalOrdered - a.totalOrdered;
        default: return (b.revenueGenerated || 0) - (a.revenueGenerated || 0);
      }
    });

    return data;
  }, [activeTab, selectedCategory, sortBy, analysisCategories]);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category || 'uncategorized'))];
  }, [products]);

  const exportData = () => {
    const csvContent = [
      ['Product', 'Category', 'Stock', 'Price', 'Total Ordered', 'Order Count', 'Revenue', 'Last Ordered', 'Analysis Type'],
      ...filteredAnalytics.map(p => [
        p.name,
        p.category || 'uncategorized',
        p.stock,
        p.price,
        p.totalOrdered,
        p.orderCount,
        p.revenueGenerated.toFixed(2),
        p.lastOrderedDate ? new Date(p.lastOrderedDate).toLocaleDateString() : 'Never',
        activeTab
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-analysis-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Analysis report exported');
  };

  const tabs = [
    { id: 'high-value', label: 'High Value', icon: DollarSign, count: analysisCategories.highValue.length, color: 'purple' },
    { id: 'fast-moving', label: 'Fast Moving', icon: Zap, count: analysisCategories.fastMoving.length, color: 'green' },
    { id: 'low-stock', label: 'Low Stock', icon: AlertTriangle, count: analysisCategories.lowStock.length, color: 'yellow' },
    { id: 'out-of-stock', label: 'Out of Stock', icon: Package, count: analysisCategories.outOfStock.length, color: 'red' },
    { id: 'slow-moving', label: 'Slow Moving', icon: Clock, count: analysisCategories.slowMoving.length, color: 'orange' },
    { id: 'never-ordered', label: 'Never Ordered', icon: Eye, count: analysisCategories.neverOrdered.length, color: 'gray' },
    { id: 'top-revenue', label: 'Top Revenue', icon: TrendingUp, count: analysisCategories.topRevenue.length, color: 'blue' },
  ];

  const getTabStyle = (tabId) => {
    const isActive = activeTab === tabId;
    const colors = {
      purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-700 bg-purple-50 hover:bg-purple-100',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-700 bg-green-50 hover:bg-green-100',
      yellow: isActive ? 'bg-yellow-600 text-white' : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
      red: isActive ? 'bg-red-600 text-white' : 'text-red-700 bg-red-50 hover:bg-red-100',
      orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-700 bg-orange-50 hover:bg-orange-100',
      gray: isActive ? 'bg-gray-600 text-white' : 'text-gray-700 bg-gray-50 hover:bg-gray-100',
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-700 bg-blue-50 hover:bg-blue-100',
    };
    return colors[tabId] || colors.blue;
  };

  const stockLabel = (product) => {
    if (product.isOutOfStock) return { text: 'Out of Stock', cls: 'bg-red-100 text-red-800' };
    if (product.isLowStock) return { text: `Only ${product.stock} left`, cls: 'bg-yellow-100 text-yellow-800' };
    return { text: `${product.stock} in stock`, cls: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">High Value Products</p>
              <p className="text-3xl font-bold text-gray-900">{analysisCategories.highValue.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-purple-600">Price ≥ ₹5,000 or Revenue ≥ ₹10,000</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Fast Moving</p>
              <p className="text-3xl font-bold text-gray-900">{analysisCategories.fastMoving.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Flame size={24} className="text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600">3+ orders & 10+ units sold</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Low Stock (Need Restock)</p>
              <p className="text-3xl font-bold text-gray-900">{analysisCategories.lowStock.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-yellow-600">Stock ≤ 10 units</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900">{analysisCategories.outOfStock.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Package size={24} className="text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-xs text-red-600">Zero inventory — urgent</p>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{analysisCategories.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Products Ever Ordered</p>
              <p className="text-2xl font-bold text-gray-900">{productAnalytics.filter(p => p.orderCount > 0).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Never Ordered</p>
              <p className="text-2xl font-bold text-gray-900">{analysisCategories.neverOrdered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Analysis</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter size={16} />
                Filters
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
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
                    <option value="revenue">Revenue</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock Level</option>
                    <option value="orders">Order Count</option>
                    <option value="quantity">Total Quantity Sold</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSortBy('revenue');
                    }}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Buttons */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getTabStyle(tab.color)}`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          {filteredAnalytics.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products in this category</h3>
              <p className="text-gray-500">No products match the current analysis view and filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Sold</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAnalytics.map(product => {
                  const sl = stockLabel(product);
                  return (
                    <tr key={product.productId || product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package size={16} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            {product.size && <p className="text-xs text-gray-500">{product.size}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {product.category || 'uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sl.cls}`}>
                          {sl.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-900">{product.orderCount}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-900">{product.totalOrdered}</span>
                        {product.orderCount > 0 && (
                          <span className="text-xs text-gray-500 ml-1">({product.averageOrderQty}/order)</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        ₹{product.revenueGenerated.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {product.lastOrderedDate ? (
                          <span className="text-xs text-gray-500">
                            {new Date(product.lastOrderedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {product.daysSinceLastOrder !== null && (
                              <span className={`ml-1 ${product.daysSinceLastOrder > 30 ? 'text-red-500' : 'text-gray-400'}`}>
                                ({product.daysSinceLastOrder}d ago)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {filteredAnalytics.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
            Showing {filteredAnalytics.length} product{filteredAnalytics.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Restock Priority</h3>
          </div>
          <p className="text-sm text-gray-600">
            {analysisCategories.lowStock.length > 0 
              ? `${analysisCategories.lowStock.length} products need restocking. Focus on fast-moving low-stock items first.`
              : 'Stock levels are healthy. No immediate restocking needed.'}
          </p>
          {analysisCategories.lowStock.filter(p => p.isFastMoving).length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 font-medium">
              <Flame size={16} />
              {analysisCategories.lowStock.filter(p => p.isFastMoving).length} fast-moving items are low on stock!
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="font-semibold text-gray-900">Revenue Drivers</h3>
          </div>
          <p className="text-sm text-gray-600">
            {analysisCategories.topRevenue.length > 0 
              ? `Top ${Math.min(5, analysisCategories.topRevenue.length)} products generate the most revenue. Ensure they stay in stock.`
              : 'No revenue data available yet. Orders need to be completed.'}
          </p>
          {analysisCategories.topRevenue.slice(0, 3).map(p => (
            <div key={p.productId || p.id} className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate max-w-[200px]">{p.name}</span>
              <span className="font-semibold text-green-700">₹{p.revenueGenerated.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={20} className="text-orange-600" />
            <h3 className="font-semibold text-gray-900">Attention Needed</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Slow-moving products</span>
              <span className="font-semibold text-orange-700">{analysisCategories.slowMoving.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Never ordered products</span>
              <span className="font-semibold text-gray-700">{analysisCategories.neverOrdered.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Out of stock items</span>
              <span className="font-semibold text-red-700">{analysisCategories.outOfStock.length}</span>
            </div>
          </div>
          {(analysisCategories.slowMoving.length > 0 || analysisCategories.neverOrdered.length > 0) && (
            <p className="mt-3 text-xs text-orange-600">
              Consider promotions or bundling for slow-moving and never-ordered products.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}