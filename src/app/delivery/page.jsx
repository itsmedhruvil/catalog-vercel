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
      <SimpleDeliveryManagement
        isOpen={true}
        onClose={() => router.push('/')}
        products={products}
        setProducts={setProducts}
        showToast={(message) => {
          // Simple toast implementation
          alert(message);
        }}
      />
    </div>
  );
}