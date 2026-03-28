import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Truck,
  Calendar,
  MapPin,
  User,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

const CATEGORIES = ['branded', 'unbranded', 'featured', 'high-priority', 'low-stock'];

export default function AdvancedDashboard({ products, setProducts, showToast }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('sales');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (parseInt(p.availableQuantity) || 0), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.totalSales || 0), 0);
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const avgRating = products.length > 0 
      ? (products.reduce((sum, p) => sum + (p.avgRating || 0), 0) / products.length) 
      : 0;

    // Delivery metrics
    const deliveredProducts = products.filter(p => p.deliveryStatus === 'delivered').length;
    const pendingProducts = products.filter(p => p.deliveryStatus === 'pending').length;
    const shippedProducts = products.filter(p => p.deliveryStatus === 'shipped').length;
    
    const deliveryRate = totalProducts > 0 ? (deliveredProducts / totalProducts) * 100 : 0;
    const avgDeliveryTime = products.reduce((sum, p) => sum + (p.avgDeliveryTime || 0), 0) / totalProducts || 0;

    // Sales performance
    const salesLast30Days = products.reduce((sum, p) => sum + (p.salesLast30Days || 0), 0);
    const salesPrevious30Days = products.reduce((sum, p) => sum + (p.salesPrevious30Days || 0), 0);
    const salesGrowth = salesPrevious30Days > 0 
      ? ((salesLast30Days - salesPrevious30Days) / salesPrevious30Days) * 100 
      : 0;

    // Inventory health
    const lowStockProducts = products.filter(p => {
      const stock = parseInt(p.availableQuantity) || 0;
      const reorderLevel = parseInt(p.reorderLevel) || 0;
      return stock <= reorderLevel && reorderLevel > 0;
    }).length;

    const highStockProducts = products.filter(p => {
      const stock = parseInt(p.availableQuantity) || 0;
      const sales = p.salesLast30Days || 0;
      return stock > 100 && sales < 10; // High stock, low sales
    }).length;

    // Category distribution
    const categoryDistribution = products.reduce((acc, p) => {
      const cat = p.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Top performing products
    const topProducts = [...products]
      .sort((a, b) => (b.salesLast30Days || 0) - (a.salesLast30Days || 0))
      .slice(0, 5);

    // Supplier performance
    const supplierPerformance = products.reduce((acc, p) => {
      const supplier = p.supplier || 'Unknown';
      if (!acc[supplier]) {
        acc[supplier] = {
          productCount: 0,
          totalStock: 0,
          avgLeadTime: 0,
          totalSales: 0
        };
      }
      acc[supplier].productCount++;
      acc[supplier].totalStock += parseInt(p.availableQuantity) || 0;
      acc[supplier].avgLeadTime += p.supplierLeadTime || 0;
      acc[supplier].totalSales += p.totalSales || 0;
      return acc;
    }, {});

    Object.keys(supplierPerformance).forEach(supplier => {
      const data = supplierPerformance[supplier];
      data.avgLeadTime = data.productCount > 0 ? data.avgLeadTime / data.productCount : 0;
    });

    return {
      totalProducts,
      totalStock,
      totalSales,
      totalViews,
      avgRating,
      deliveredProducts,
      pendingProducts,
      shippedProducts,
      deliveryRate,
      avgDeliveryTime,
      salesLast30Days,
      salesPrevious30Days,
      salesGrowth,
      lowStockProducts,
      highStockProducts,
      categoryDistribution,
      topProducts,
      supplierPerformance
    };
  }, [products]);

  // Filtered products for detailed view
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.deliveryStatus === selectedStatus);
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'sales':
          aValue = a.salesLast30Days || 0;
          bValue = b.salesLast30Days || 0;
          break;
        case 'stock':
          aValue = parseInt(a.availableQuantity) || 0;
          bValue = parseInt(b.availableQuantity) || 0;
          break;
        case 'rating':
          aValue = a.avgRating || 0;
          bValue = b.avgRating || 0;
          break;
        case 'delivery':
          aValue = a.avgDeliveryTime || 0;
          bValue = b.avgDeliveryTime || 0;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    return filtered;
  }, [products, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const exportData = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Stock', 'Sales (30d)', 'Total Sales', 'Rating', 'Delivery Status', 'Supplier'],
      ...filteredProducts.map(p => [
        p.name,
        p.category,
        p.availableQuantity || 0,
        p.salesLast30Days || 0,
        p.totalSales || 0,
        p.avgRating || 0,
        p.deliveryStatus,
        p.supplier || 'Unknown'
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced analytics and delivery management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Export Report
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
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
                <option value="sales">Sales (30d)</option>
                <option value="stock">Stock Level</option>
                <option value="rating">Rating</option>
                <option value="delivery">Delivery Time</option>
                <option value="name">Product Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
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
            <span>{analytics.totalStock} total stock</span>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sales (30d)</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.salesLast30Days}</p>
              <p className={`text-sm mt-1 ${analytics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.salesGrowth >= 0 ? '▲' : '▼'} {Math.abs(analytics.salesGrowth).toFixed(1)}%
              </p>
            </div>
            <TrendingUp size={40} className="text-green-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{analytics.avgDeliveryTime.toFixed(1)} days avg delivery</span>
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.deliveryRate.toFixed(1)}%</p>
            </div>
            <Truck size={40} className="text-purple-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle size={16} />
            <span>{analytics.deliveredProducts} delivered</span>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.lowStockProducts}</p>
            </div>
            <AlertTriangle size={40} className="text-orange-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Eye size={16} />
            <span>{analytics.highStockProducts} high stock</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top Performing Products
          </h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.salesLast30Days || 0} sales</p>
                  <p className="text-sm text-gray-500">{product.avgRating?.toFixed(1)} ⭐</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Category Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => {
              const percentage = ((count / analytics.totalProducts) * 100).toFixed(1);
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="capitalize font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{count}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} />
            Supplier Performance
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.supplierPerformance).map(([supplier, data]) => (
              <div key={supplier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center font-semibold">
                    {supplier.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{supplier}</p>
                    <p className="text-sm text-gray-500">{data.productCount} products</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{data.totalSales} total sales</p>
                  <p className="text-sm text-gray-500">{data.avgLeadTime.toFixed(1)} days avg lead time</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Status Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck size={20} />
            Delivery Status Overview
          </h3>
          <div className="space-y-3">
            {DELIVERY_STATUSES.map(status => {
              const count = products.filter(p => p.deliveryStatus === status.value).length;
              const percentage = ((count / analytics.totalProducts) * 100).toFixed(1);
              return (
                <div key={status.value} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{count}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={20} />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              Add New Product
            </button>
            <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors">
              Update Inventory
            </button>
            <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors">
              Generate Report
            </button>
            <button className="w-full p-3 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors">
              Review Orders
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <RefreshCw size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">New order placed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Inventory updated</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium">Supplier shipment received</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Product List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
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
                <th className="pb-3 font-semibold text-gray-600">Stock</th>
                <th className="pb-3 font-semibold text-gray-600">Sales (30d)</th>
                <th className="pb-3 font-semibold text-gray-600">Rating</th>
                <th className="pb-3 font-semibold text-gray-600">Delivery</th>
                <th className="pb-3 font-semibold text-gray-600">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{product.availableQuantity || 0}</td>
                  <td className="py-3 font-medium text-green-600">{product.salesLast30Days || 0}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500" />
                      <span className="font-medium">{product.avgRating?.toFixed(1) || 0}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      DELIVERY_STATUSES.find(s => s.value === product.deliveryStatus)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.deliveryStatus}
                    </span>
                  </td>
                  <td className="py-3">{product.supplier || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}