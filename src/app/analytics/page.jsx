"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, Package, Box, Layers, Settings, Bell, Truck, Plus, Download, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import SimpleAnalyticsDashboard from "@/components/SimpleAnalyticsDashboard";
import { isAdminMode } from "@/lib/admin";
import { fetchProducts } from "@/lib/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    
    // Fetch products data
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        console.log('Fetched products:', productsData);
        console.log('Products count:', productsData.length);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
    loadProducts();
  }, [router]);

  if (!isAdmin) {
    return null; // Will redirect automatically in useEffect
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SimpleAnalyticsDashboard 
          products={products}
          setProducts={setProducts}
          showToast={(message) => {
            // Simple toast implementation
            alert(message);
          }}
        />
      </main>
    </div>
  );
}