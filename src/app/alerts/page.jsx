"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Bell, AlertCircle, CheckCircle, Clock, TrendingDown, Star, Calendar, Plus, Settings, Download, Filter, Package, ShoppingCart, Eye, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import SimpleInventoryAlerts from "@/components/SimpleInventoryAlerts";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchProducts, fetchOrders, updateOrder } from "@/lib/api";

// Tab types
const TABS = {
  ORDERS: 'orders',
  INVENTORY: 'inventory'
};

export default function AlertsPage() {
  const router = useRouter();
  const { isAdmin, isLoaded } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.ORDERS);
  const [toast, setToast] = useState(null);
  const [confirmingOrders, setConfirmingOrders] = useState({});

  useEffect(() => {
    // Wait for auth to load before checking admin status
    if (isLoaded) {
      if (!isAdmin) {
        // Redirect to main catalog if not in admin mode
        router.push('/');
        return;
      }
      
      // Fetch products and orders data
      const loadData = async () => {
        try {
          const [productsData, ordersData] = await Promise.all([
            fetchProducts(),
            fetchOrders()
          ]);
          setProducts(productsData);
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isLoaded, isAdmin, router]);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Get pending orders (incoming order alerts)
  const pendingOrders = orders.filter(order => 
    order.orderStatus === 'pending' || order.status === 'pending'
  ).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.orderDate || 0);
    const dateB = new Date(b.createdAt || b.orderDate || 0);
    return dateB - dateA; // Most recent first
  });

  // Confirm an order - this will update the order status and show a message
  const confirmOrder = async (orderId, orderNumber) => {
    if (confirmingOrders[orderId]) return; // Prevent double-click
    
    setConfirmingOrders(prev => ({ ...prev, [orderId]: true }));
    
    try {
      // Update order status to confirmed
      const updatedOrder = await updateOrder(orderId, {
        orderStatus: 'confirmed'
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId || order._id === orderId ? updatedOrder : order
        )
      );
      
      showToast(`Order #${orderNumber} confirmed! Stock has been deducted.`, 'success');
    } catch (error) {
      console.error('Error confirming order:', error);
      showToast(`Failed to confirm order #${orderNumber}`, 'error');
    } finally {
      setConfirmingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // View order details
  const viewOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  // Show loading state while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect automatically in useEffect
  }

  // Loading state is handled above

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

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
                <h1 className="text-2xl font-bold text-gray-900">Admin Alerts</h1>
                <p className="text-sm text-gray-500">Monitor orders and inventory in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Bell size={16} />
                <span className="text-sm font-medium">Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab(TABS.ORDERS)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === TABS.ORDERS
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              Incoming Orders
              {pendingOrders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab(TABS.INVENTORY)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === TABS.INVENTORY
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={18} />
              Inventory Alerts
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === TABS.ORDERS ? (
          /* Incoming Orders Tab */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock size={24} className="text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Order Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{pendingOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Zap size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Items to Process</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {pendingOrders.reduce((sum, order) => {
                        const items = order.items || [];
                        return sum + items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
                      }, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Package size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Orders List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Incoming Order Alerts
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Confirm orders to deduct stock and begin processing
                </p>
              </div>
              
              {pendingOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No pending orders to process right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingOrders.map((order) => {
                    const orderNumber = order.orderNumber || order.id?.slice(-6).toUpperCase() || 'N/A';
                    const items = order.items || [];
                    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
                    
                    return (
                      <div key={order.id || order._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">
                                Order #{orderNumber}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                Pending
                              </span>
                              <span className="text-sm text-gray-500">
                                {orderDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {/* Customer Info */}
                            <div className="text-sm text-gray-600 space-y-1 mb-3">
                              <p><strong>Customer:</strong> {order.customer?.name || 'N/A'}</p>
                              <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
                              <p><strong>Phone:</strong> {order.customer?.phone || 'N/A'}</p>
                            </div>
                            
                            {/* Items Preview */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {items.slice(0, 4).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                                  {item.productImage ? (
                                    <img src={item.productImage} alt="" className="w-6 h-6 rounded object-cover" />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-200 rounded" />
                                  )}
                                  <span className="text-xs text-gray-700">
                                    {item.productName} ×{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {items.length > 4 && (
                                <span className="text-xs text-gray-500">+{items.length - 4} more</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Order Total */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{order.totalAmount?.toFixed(0) || '0'}
                            </p>
                            <p className="text-sm text-gray-500">{totalItems} items</p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => confirmOrder(order.id || order._id, orderNumber)}
                              disabled={confirmingOrders[order.id || order._id]}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {confirmingOrders[order.id || order._id] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={18} />
                                  Confirm
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => viewOrder(order.id || order._id)}
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 justify-center"
                            >
                              <Eye size={18} />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Inventory Alerts Tab */
          <SimpleInventoryAlerts 
            products={products}
            setProducts={setProducts}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}