"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Filter, Download, Users, CreditCard, Truck, Calendar, TrendingUp, TrendingDown, DollarSign, Package, Eye, Edit2, Trash2, RefreshCw, BarChart3 } from "lucide-react";
import { isAdminMode } from "@/lib/admin";
import { fetchOrders, fetchOrderAnalytics, deleteOrder } from "@/lib/api";

export default function OrdersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Order status options
  const ORDER_STATUSES = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    // Check if user is in admin mode using persistent state
    const checkAdmin = () => {
      const adminEnabled = isAdminMode();
      setIsAdmin(adminEnabled);
      
      if (!adminEnabled) {
        // Redirect to main catalog if not in admin mode
        router.push('/');
      }
    };
    
    // Fetch orders and analytics data
    const loadData = async () => {
      try {
        const [ordersData, analyticsData] = await Promise.all([
          fetchOrders(),
          fetchOrderAnalytics()
        ]);
        
        setOrders(ordersData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
    loadData();
  }, [router]);

  if (!isAdmin) {
    return null; // Will redirect automatically in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders management...</p>
        </div>
      </div>
    );
  }

  // Filtered and sorted orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return order.customer.name.toLowerCase().includes(query) ||
             order.customer.email.toLowerCase().includes(query) ||
             order.orderNumber.toLowerCase().includes(query) ||
             order.items.some(item => item.productName.toLowerCase().includes(query));
    }
    return true;
  }).filter(order => {
    // Status filter
    if (filterStatus !== 'all') {
      return order.orderStatus === filterStatus;
    }
    return true;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'orderDate':
        aValue = new Date(a.orderDate);
        bValue = new Date(b.orderDate);
        break;
      case 'customer':
        aValue = a.customer.name || '';
        bValue = b.customer.name || '';
        break;
      case 'total':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'status':
        aValue = a.orderStatus || '';
        bValue = b.orderStatus || '';
        break;
      default:
        aValue = new Date(a.orderDate);
        bValue = new Date(b.orderDate);
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

  const handleDeleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        setOrders(orders.filter(order => order.id !== orderId));
        alert('Order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-500">Manage customer orders and track sales</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 size={18} />
                Analytics
              </button>
              <button
                onClick={() => router.push('/orders/create')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                New Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Overview */}
      {analytics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.totalOrders > 0 ? formatCurrency(analytics.totalRevenue / analytics.totalOrders) : '₹0'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Status</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.statusCounts.find(s => s._id === 'delivered')?.count || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Truck size={24} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by customer, order number, or product..."
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
                {ORDER_STATUSES.map(status => (
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
                <option value="orderDate">Order Date</option>
                <option value="customer">Customer</option>
                <option value="total">Total Amount</option>
                <option value="status">Status</option>
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

        {/* Orders List */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-semibold text-gray-600">Order #</th>
                  <th className="pb-3 font-semibold text-gray-600">Customer</th>
                  <th className="pb-3 font-semibold text-gray-600">Date</th>
                  <th className="pb-3 font-semibold text-gray-600">Items</th>
                  <th className="pb-3 font-semibold text-gray-600">Total</th>
                  <th className="pb-3 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 font-semibold text-gray-600">Payment</th>
                  <th className="pb-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        <span className="text-xs text-gray-500">{order.orderType}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDate(order.orderDate)}</span>
                        <span className="text-xs text-gray-500">{order.age} days ago</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.summary.itemCount} items</span>
                        <span className="text-sm text-gray-500">{order.summary.totalItems} units</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment.status}
                        </span>
                        <span className="text-xs text-gray-500">{order.payment.method}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => router.push(`/orders/${order.id}/edit`)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit Order"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}