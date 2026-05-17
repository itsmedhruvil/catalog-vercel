"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, Package, Box, Layers, Truck, Bell, Download, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SimpleAnalyticsDashboard from "@/components/SimpleAnalyticsDashboard";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchProducts, fetchOrders } from "@/lib/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isSignedIn, isAdmin, isLoading } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [router, isSignedIn, isAdmin]);

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
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:flex lg:pb-0">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-500">Real-time insights and performance metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 sm:px-6">
          <SimpleAnalyticsDashboard 
            products={products}
            orders={orders}
            setProducts={setProducts}
            showToast={(message) => {
              alert(message);
            }}
          />
        </div>
      </div>
    </div>
  );
}
