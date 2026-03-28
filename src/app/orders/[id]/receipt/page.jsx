"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download, Mail, Share2, Eye, EyeOff } from "lucide-react";
import { isAdminMode } from "@/lib/admin";
import { fetchOrderById } from "@/lib/api";

export default function OrderReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

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
    
    // Fetch order data
    const loadOrder = async () => {
      try {
        const orderData = await fetchOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        alert('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
    loadOrder();
  }, [router, orderId]);

  if (!isAdmin) {
    return null; // Will redirect automatically in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order receipt...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal + order.tax + order.shipping - order.discount;
    return { subtotal, total };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareData = {
      title: `Order ${order.orderNumber}`,
      text: `Order Details: ${formatCurrency(order.totalAmount)}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Receipt</h1>
                <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Order"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print Receipt"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={showDetails ? "Hide Details" : "Show Details"}
              >
                {showDetails ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Receipt Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Receipt</h2>
              <p className="text-gray-600">Thank you for your order!</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-lg font-semibold">{formatDate(order.orderDate)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Number</p>
              <p className="font-semibold">#{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {order.payment.status}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-semibold">{order.payment.method}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-semibold">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{order.customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{order.customer.phone}</p>
            </div>
            {order.customer.address && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-semibold">
                  {order.customer.address.street}, {order.customer.address.city}, 
                  {order.customer.address.state} {order.customer.address.zipCode}, {order.customer.address.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {showDetails && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    {item.size && (
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600">Notes: {item.notes}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)} each</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateTotals().subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount:</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        {showDetails && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="font-semibold">{order.delivery.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-semibold">{order.delivery.estimatedDate ? formatDate(order.delivery.estimatedDate) : 'Not set'}</p>
              </div>
              {order.delivery.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-semibold">{order.delivery.trackingNumber}</p>
                </div>
              )}
              {order.delivery.actualDate && (
                <div>
                  <p className="text-sm text-gray-600">Actual Delivery</p>
                  <p className="font-semibold">{formatDate(order.delivery.actualDate)}</p>
                </div>
              )}
            </div>
            
            {order.delivery.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Delivery Notes</p>
                <p className="font-semibold">{order.delivery.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Order Notes */}
        {showDetails && (order.notes || order.internalNotes) && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Customer Notes</p>
                  <p className="text-gray-900">{order.notes}</p>
                </div>
              )}
              
              {order.internalNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Internal Notes</p>
                  <p className="text-gray-900">{order.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <p className="text-gray-600 mb-2">Thank you for your business!</p>
          <p className="text-sm text-gray-500">For any questions about this order, please contact our support team.</p>
        </div>
      </main>
    </div>
  );
}