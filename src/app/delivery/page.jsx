"use client";

import { useState, useEffect } from "react";
import { Truck, Package, Calendar, Clock, MapPin, User, Eye, CheckCircle, XCircle, Search, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchOrders, updateOrder, fetchProducts } from "@/lib/api";

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export default function DeliveryPage() {
  const router = useRouter();
  const { isSignedIn, isAdmin, isLoading } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isSignedIn !== undefined) {
      if (isSignedIn && !isAdmin) {
        router.push('/catalog');
      } else if (!isSignedIn) {
        router.push('/sign-in');
      }
    }
    
    if (isAdmin) {
      const loadData = async () => {
        try {
          const [ordersData, productsData] = await Promise.all([
            fetchOrders(),
            fetchProducts()
          ]);
          setOrders(ordersData);
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [router, isSignedIn, isAdmin]);

  const updateDeliveryStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrder(orderId, {
        orderStatus: newStatus
      });
      setOrders(prev => prev.map(o => 
        (o.id === orderId || o._id === orderId) ? updatedOrder : o
      ));
      showToast(`Order delivery updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      showToast('Failed to update delivery status', 'error');
    }
  };

  // Filter and search orders - exclude pending (payment pending) and confirmed (confirmation pending) orders
  const filteredOrders = orders.filter(order => {
    const status = order.orderStatus || order.status || 'pending';
    // Skip orders that are still in payment/confirmation pending phase
    if (status === 'pending' || status === 'confirmed') return false;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(query));
    
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    const statusOrder = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: 4 };
    const aStatus = a.orderStatus || a.status || 'pending';
    const bStatus = b.orderStatus || b.status || 'pending';
    return (statusOrder[aStatus] || 0) - (statusOrder[bStatus] || 0);
  });

  // Delivery stats - only count orders in delivery-relevant statuses
  const deliveryStats = {
    pending: orders.filter(o => (o.orderStatus || o.status) === 'pending').length,
    confirmed: orders.filter(o => (o.orderStatus || o.status) === 'confirmed').length,
    processing: orders.filter(o => (o.orderStatus || o.status) === 'processing').length,
    shipped: orders.filter(o => (o.orderStatus || o.status) === 'shipped').length,
    delivered: orders.filter(o => (o.orderStatus || o.status) === 'delivered').length,
    total: orders.filter(o => {
      const status = o.orderStatus || o.status || 'pending';
      return !['pending', 'confirmed'].includes(status);
    }).length,
  };

  // Show loading state while checking auth
  if (isLoading || isSignedIn === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery management...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = DELIVERY_STATUSES.find(ds => ds.value === status);
    return s ? `${s.color} px-3 py-1 rounded-full text-xs font-medium` : 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:flex lg:pb-0">
      {/* Admin Sidebar */}
      <AdminSidebar />

      <div className="min-w-0 flex-1 flex flex-col">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-sm text-gray-500">Track order-wise deliveries and fulfillment status</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6 sm:px-6">
          {/* Delivery Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.total}</p>
                </div>
                <Package size={32} className="text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{deliveryStats.pending}</p>
                </div>
                <Clock size={32} className="text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{deliveryStats.processing}</p>
                </div>
                <Truck size={32} className="text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-purple-600">{deliveryStats.shipped}</p>
                </div>
                <Truck size={32} className="text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</p>
                </div>
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Delivery Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck size={20} />
                Order-Wise Delivery Tracking
              </h3>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Delivery Orders</h3>
                <p className="text-gray-500">No orders found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Order</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Customer</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Items</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Amount</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Delivery Method</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Est. Delivery</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Tracking</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const status = order.orderStatus || order.status || 'pending';
                      const items = order.items || [];
                      const delivery = order.delivery || {};
                      
                      return (
                        <tr key={order.id || order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              #{order.orderNumber || order.id?.slice(-6).toUpperCase() || 'N/A'}
                            </span>
                            <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{order.customer?.phone || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900">{items.length} items</p>
                            <p className="text-xs text-gray-500">
                              {items.reduce((sum, item) => sum + (item.quantity || 0), 0)} units
                            </p>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm capitalize">{delivery.method || 'standard'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-sm">{formatDate(delivery.estimatedDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-blue-600 font-medium">
                              {delivery.trackingNumber || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={status}
                              onChange={(e) => updateDeliveryStatus(order.id || order._id, e.target.value)}
                              className={getStatusBadge(status) + ' cursor-pointer border-0 focus:ring-2 focus:ring-blue-500'}
                            >
                              {DELIVERY_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => router.push(`/orders/${order.id || order._id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
