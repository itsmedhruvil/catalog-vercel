"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Truck, Package, Calendar, Clock, MapPin, User, Settings, Plus, Download, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import SimpleDeliveryManagement from "@/components/SimpleDeliveryManagement";
import { isAdminMode } from "@/lib/admin";
import { fetchProducts } from "@/lib/api";

export default function DeliveryPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(true);
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
        console.log('Delivery page - Fetched products:', productsData);
        console.log('Delivery page - Products count:', productsData.length);
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
          <p className="mt-4 text-gray-600">Loading delivery management...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-sm text-gray-500">Track deliveries and manage suppliers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                <Truck size={16} />
                <span className="text-sm font-medium">Delivery Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SimpleDeliveryManagement
          isOpen={showDeliveryModal}
          onClose={() => router.push('/')}
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