"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Truck, Package, Calendar, Clock, MapPin, User, Settings, Plus, Download, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import SimpleDeliveryManagement from "@/components/SimpleDeliveryManagement";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchProducts } from "@/lib/api";

export default function DeliveryPage() {
  const router = useRouter();
  const { isSignedIn, isAdmin, isLoading } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn !== undefined) {
      if (isSignedIn && !isAdmin) {
        // User is signed in but not an admin - redirect to catalog
        router.push('/catalog');
      } else if (!isSignedIn) {
        // User is not signed in - redirect to sign in
        router.push('/sign-in');
      }
    }
    
    if (isAdmin) {
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
      
      loadProducts();
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