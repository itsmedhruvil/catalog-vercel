"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Eye, Filter, Download, Plus, Search, Clock, Truck } from "lucide-react";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchOrders } from "@/lib/api";

export default function OrdersPage() {
  const router = useRouter();
  const { isAdmin, isLoaded } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Wait for auth to load before checking admin status
    if (isLoaded) {
      if (!isAdmin) {
        // Redirect to main catalog if not in admin mode
        router.push('/catalog');
        return;
      }
      
      // Fetch orders data
      const loadOrders = async () => {
        try {
          const ordersData = await fetchOrders();
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadOrders();
    }
  }, [isAdmin, isLoaded, router]);

  // Show loading state while checking auth
  if (!isLoaded || loading) {
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
    return null; // Will redirect automatically in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const status = order.orderStatus || order.status || 'pending';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
      (order.customer?.email && order.customer.email.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  // Get unique statuses for filter
  const statuses = ['all', ...new Set(orders.map(o => o.orderStatus || o.status || 'pending'))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/catalog')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-sm text-gray-500">Manage all customer orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/orders/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                New Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter(o => (o.orderStatus || o.status) === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-3xl font-bold text-blue-600">
                  {orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.orderStatus || o.status)).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Download size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order number, customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {statuses.map(status => (
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">
              {orders.length === 0 
                ? "No orders have been placed yet." 
                : "No orders match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = order.orderStatus || order.status || 'pending';
              const statusColors = {
                pending: 'bg-yellow-100 text-yellow-700',
                confirmed: 'bg-green-100 text-green-700',
                processing: 'bg-blue-100 text-blue-700',
                shipped: 'bg-purple-100 text-purple-700',
                delivered: 'bg-green-100 text-green-700',
                cancelled: 'bg-red-100 text-red-700',
                refunded: 'bg-orange-100 text-orange-700',
              };
              const statusLabels = {
                pending: 'Pending',
                confirmed: 'Confirmed',
                processing: 'Processing',
                shipped: 'Shipped',
                delivered: 'Delivered',
                cancelled: 'Cancelled',
                refunded: 'Refunded',
              };

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          Order #{order.orderNumber || order.id?.slice(-6).toUpperCase() || 'N/A'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[status] || statusColors.pending
                          }`}
                        >
                          {statusLabels[status] || 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          Placed on {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p>{order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} items • ₹{(order.totalAmount || 0).toFixed(2)}</p>
                        {order.customer?.name && (
                          <p>Customer: {order.customer.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="flex items-center gap-2">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden"
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-500">
                            +{(order.items?.length || 0) - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/orders/${order.id}`);
                        }}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}