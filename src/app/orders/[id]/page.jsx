"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Download, Printer, Mail, Phone, MapPin, Calendar, Clock, Truck, CreditCard, Users, Eye, EyeOff, Plus, Save, X } from "lucide-react";
import { isAdminMode } from "@/lib/admin";
import { fetchOrderById, updateOrder } from "@/lib/api";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showStatusHistory, setShowStatusHistory] = useState(false);

  // Order status options
  const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash on Delivery' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'online', label: 'Online Payment' },
    { value: 'upi', label: 'UPI Payment' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const DELIVERY_METHODS = [
    { value: 'standard', label: 'Standard Delivery' },
    { value: 'express', label: 'Express Delivery' },
    { value: 'pickup', label: 'Store Pickup' }
  ];

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
        setEditData(orderData);
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
          <p className="mt-4 text-gray-600">Loading order details...</p>
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

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(order);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const updatedOrder = await updateOrder(orderId, editData);
      setOrder(updatedOrder);
      setEditData(updatedOrder);
      setIsEditing(false);
      alert('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const handlePaymentChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }));
  };

  const handleDeliveryChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value
      }
    }));
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const statusObj = PAYMENT_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">Order details and management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push('/orders')}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Back to Orders
                  </button>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit Order
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                {isEditing ? (
                  <select
                    value={editData.orderStatus}
                    onChange={(e) => handleFieldChange('orderStatus', e.target.value)}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                {isEditing ? (
                  <select
                    value={editData.payment.status}
                    onChange={(e) => handlePaymentChange('status', e.target.value)}
                    className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PAYMENT_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                    {order.payment.status}
                  </span>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              {isEditing && (
                <button
                  onClick={() => router.push(`mailto:${order.customer.email}`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Mail size={20} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{order.customer.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-blue-600">{order.customer.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.customer.phone}</p>
                )}
              </div>
              
              {order.customer.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Street"
                        value={editData.customer.address.street || ''}
                        onChange={(e) => handleCustomerChange('address', { ...editData.customer.address, street: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={editData.customer.address.city || ''}
                          onChange={(e) => handleCustomerChange('address', { ...editData.customer.address, city: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={editData.customer.address.state || ''}
                          onChange={(e) => handleCustomerChange('address', { ...editData.customer.address, state: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={editData.customer.address.zipCode || ''}
                          onChange={(e) => handleCustomerChange('address', { ...editData.customer.address, zipCode: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={editData.customer.address.country || ''}
                          onChange={(e) => handleCustomerChange('address', { ...editData.customer.address, country: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 space-y-1">
                      <p>{order.customer.address.street}</p>
                      <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}</p>
                      <p>{order.customer.address.country}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
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

            {/* Order Totals */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateTotals().subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Discount:</span>
                <span>- {formatCurrency(order.discount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                {isEditing ? (
                  <select
                    value={editData.payment.method}
                    onChange={(e) => handlePaymentChange('method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{PAYMENT_METHODS.find(m => m.value === order.payment.method)?.label || order.payment.method}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.payment.transactionId || ''}
                    onChange={(e) => handlePaymentChange('transactionId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.payment.transactionId || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.payment.paymentReference || ''}
                    onChange={(e) => handlePaymentChange('paymentReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.payment.paymentReference || 'N/A'}</p>
                )}
              </div>
              
              {order.payment.paymentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <p className="text-gray-900">{formatDate(order.payment.paymentDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
              {isEditing && (
                <button
                  onClick={() => setShowStatusHistory(!showStatusHistory)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showStatusHistory ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showStatusHistory ? 'Hide' : 'Show'} Status History
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                {isEditing ? (
                  <select
                    value={editData.delivery.method}
                    onChange={(e) => handleDeliveryChange('method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {DELIVERY_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{DELIVERY_METHODS.find(m => m.value === order.delivery.method)?.label || order.delivery.method}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.delivery.estimatedDate ? new Date(editData.delivery.estimatedDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDeliveryChange('estimatedDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.delivery.estimatedDate ? formatDate(order.delivery.estimatedDate) : 'Not set'}</p>
                )}
              </div>
              
              {order.delivery.actualDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery</label>
                  <p className="text-gray-900">{formatDate(order.delivery.actualDate)}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.delivery.trackingNumber || ''}
                    onChange={(e) => handleDeliveryChange('trackingNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.delivery.trackingNumber || 'Not available'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                {isEditing ? (
                  <textarea
                    value={editData.delivery.notes || ''}
                    onChange={(e) => handleDeliveryChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.delivery.notes || 'No notes'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                {isEditing ? (
                  <textarea
                    value={editData.delivery.deliveryInstructions || ''}
                    onChange={(e) => handleDeliveryChange('deliveryInstructions', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{order.delivery.deliveryInstructions || 'No instructions'}</p>
                )}
              </div>
            </div>

            {/* Status History */}
            {showStatusHistory && order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Status History</h4>
                <div className="space-y-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{history.status}</span>
                        <p className="text-sm text-gray-600">{formatDate(history.date)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{history.updatedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Notes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{order.notes || 'No customer notes'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.internalNotes || ''}
                  onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{order.internalNotes || 'No internal notes'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Printer size={18} />
                Print Invoice
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download size={18} />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Mail size={18} />
                Send Email
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 size={18} />
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}