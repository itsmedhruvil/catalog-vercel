"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Package, TrendingDown, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SimpleInventoryAlerts from "@/components/SimpleInventoryAlerts";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchProducts, fetchOrders } from "@/lib/api";

export default function AlertsPage() {
  const router = useRouter();
  const { isAdmin, isLoaded } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Wait for auth to load before checking admin status
    if (isLoaded) {
      if (!isAdmin) {
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

  // Calculate committed stock from pending/confirmed/processing/shipped orders (excludes delivered/completed)
  const committedStock = {};
  orders.forEach(order => {
    const status = order.orderStatus || order.status;
    // Stock is only deducted on delivery, so committed stock is orders that aren't delivered yet
    if (['pending', 'confirmed', 'processing', 'shipped'].includes(status)) {
      (order.items || []).forEach(item => {
        const pid = typeof item.productId === 'string' ? item.productId : item.productId?._id || item.productId?.id;
        if (pid) {
          committedStock[pid] = (committedStock[pid] || 0) + (item.quantity || 0);
        }
      });
    }
  });

  // Calculate real available stock by subtracting committed stock
  const productsWithRealStock = products.map(product => {
    const totalStock = parseInt(product.totalQuantity) || 0;
    const committed = committedStock[product.id] || 0;
    const available = Math.max(0, totalStock - committed);
    return { ...product, totalQuantity: totalStock, committedStock: committed, realAvailable: available };
  });

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:flex lg:pb-0">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center font-bold">!</div>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Alerts</h1>
                <p className="text-sm text-gray-500">Monitor inventory levels in real-time</p>
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

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 sm:px-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {productsWithRealStock.filter(p => p.realAvailable > 0 && p.realAvailable <= 5).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingDown size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">
                    {productsWithRealStock.filter(p => p.totalQuantity === 0 || p.realAvailable === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Star size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Stock</p>
                  <p className="text-3xl font-bold text-green-600">
                    {productsWithRealStock.reduce((sum, p) => sum + (p.totalQuantity || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Alerts Component */}
          <SimpleInventoryAlerts 
            products={productsWithRealStock}
            orders={orders}
            setProducts={setProducts}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
}
