"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, X, User, Mail, Phone, MapPin, CreditCard, Truck, Calendar, Package, Search, PlusCircle, Trash2, MinusCircle, Eye, EyeOff } from "lucide-react";
import { isAdminMode } from "@/lib/admin";
import { fetchProducts, createOrder } from "@/lib/api";

export default function CreateOrderPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [orderData, setOrderData] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    },
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 0,
    payment: {
      method: 'cod',
      status: 'pending'
    },
    delivery: {
      method: 'standard',
      estimatedDate: '',
      notes: '',
      deliveryInstructions: ''
    },
    notes: '',
    orderType: 'online'
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Order status and payment options
  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash on Delivery' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'online', label: 'Online Payment' },
    { value: 'upi', label: 'UPI Payment' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const DELIVERY_METHODS = [
    { value: 'standard', label: 'Standard Delivery (3-5 days)' },
    { value: 'express', label: 'Express Delivery (1-2 days)' },
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
    
    // Fetch products data
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
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
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const handleCustomerChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        address: {
          ...prev.customer.address,
          [field]: value
        }
      }
    }));
  };

  const handlePaymentChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }));
  };

  const handleDeliveryChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value
      }
    }));
  };

  const handleOrderChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProductToOrder = (product) => {
    const existingItem = orderData.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity if product already exists
      const updatedItems = orderData.items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: item.unitPrice * (item.quantity + 1) }
          : item
      );
      updateOrderTotals(updatedItems);
    } else {
      // Add new product
      const newItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        quantity: 1,
        unitPrice: parseFloat(product.price) || 0,
        totalPrice: parseFloat(product.price) || 0,
        size: product.size || ''
      };
      
      const updatedItems = [...orderData.items, newItem];
      updateOrderTotals(updatedItems);
    }
  };

  const removeProductFromOrder = (productId) => {
    const updatedItems = orderData.items.filter(item => item.productId !== productId);
    updateOrderTotals(updatedItems);
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = orderData.items.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
        : item
    );
    updateOrderTotals(updatedItems);
  };

  const updateItemPrice = (productId, newPrice) => {
    const updatedItems = orderData.items.map(item =>
      item.productId === productId
        ? { ...item, unitPrice: parseFloat(newPrice) || 0, totalPrice: (parseFloat(newPrice) || 0) * item.quantity }
        : item
    );
    updateOrderTotals(updatedItems);
  };

  const updateItemNotes = (productId, notes) => {
    const updatedItems = orderData.items.map(item =>
      item.productId === productId
        ? { ...item, notes }
        : item
    );
    updateOrderTotals(updatedItems);
  };

  const updateOrderTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + orderData.tax + orderData.shipping - orderData.discount;
    
    setOrderData(prev => ({
      ...prev,
      items,
      subtotal,
      totalAmount
    }));
  };

  const handleSaveOrder = async () => {
    try {
      // Validate required fields
      if (!orderData.customer.name || !orderData.customer.email || !orderData.customer.phone) {
        alert('Please fill in all customer information');
        return;
      }

      if (orderData.items.length === 0) {
        alert('Please add at least one product to the order');
        return;
      }

      // Create order
      const order = await createOrder(orderData);
      alert('Order created successfully!');
      
      // Use window.location.href for immediate navigation to avoid routing issues
      window.location.href = `/orders/${order.id}`;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return product.name.toLowerCase().includes(query) ||
           product.category.toLowerCase().includes(query) ||
           (product.description && product.description.toLowerCase().includes(query));
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
                <p className="text-sm text-gray-500">Add customer and product information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/orders')}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Create Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {showAddressForm ? <EyeOff size={18} /> : <Eye size={18} />}
                {showAddressForm ? 'Hide' : 'Show'} Address
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={orderData.customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={orderData.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={orderData.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {showAddressForm && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900">Shipping Address</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={orderData.customer.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={orderData.customer.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={orderData.customer.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={orderData.customer.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={orderData.customer.address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <div className="text-sm text-gray-600">
                {orderData.items.length} items • {orderData.items.reduce((sum, item) => sum + item.quantity, 0)} units
              </div>
            </div>

            {/* Product Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products to add to order..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Available Products */}
            <div className="mb-6 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProducts.map(product => {
                    const isInOrder = orderData.items.some(item => item.productId === product.id);
                    return (
                      <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">{product.category}</p>
                              {product.size && <p className="text-sm text-gray-600">Size: {product.size}</p>}
                              <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => addProductToOrder(product)}
                            disabled={isInOrder}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isInOrder
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isInOrder ? 'Added' : 'Add to Order'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items List */}
            {orderData.items.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Selected Items</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.productImage ? (
                              <img src={item.productImage} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Package size={32} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.productName}</h5>
                            {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                            <div className="flex items-center gap-4 mt-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Unit Price</label>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(item.productId, e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <MinusCircle size={18} />
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <PlusCircle size={18} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Total</label>
                                <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="block text-xs text-gray-600 mb-1">Notes</label>
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => updateItemNotes(item.productId, e.target.value)}
                                placeholder="Special instructions..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeProductFromOrder(item.productId)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary and Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Payment Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={orderData.payment.method}
                  onChange={(e) => handlePaymentChange('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={orderData.payment.status}
                  onChange={(e) => handlePaymentChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Delivery Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                <select
                  value={orderData.delivery.method}
                  onChange={(e) => handleDeliveryChange('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DELIVERY_METHODS.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={orderData.delivery.estimatedDate}
                    onChange={(e) => handleDeliveryChange('estimatedDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                <textarea
                  value={orderData.delivery.notes}
                  onChange={(e) => handleDeliveryChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special delivery instructions..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                <textarea
                  value={orderData.delivery.deliveryInstructions}
                  onChange={(e) => handleDeliveryChange('deliveryInstructions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Call before delivery, Leave at door..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(orderData.subtotal)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Tax</p>
              <input
                type="number"
                value={orderData.tax}
                onChange={(e) => {
                  const tax = parseFloat(e.target.value) || 0;
                  const totalAmount = orderData.subtotal + tax + orderData.shipping - orderData.discount;
                  setOrderData(prev => ({ ...prev, tax, totalAmount }));
                }}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                placeholder="0"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Shipping</p>
              <input
                type="number"
                value={orderData.shipping}
                onChange={(e) => {
                  const shipping = parseFloat(e.target.value) || 0;
                  const totalAmount = orderData.subtotal + orderData.tax + shipping - orderData.discount;
                  setOrderData(prev => ({ ...prev, shipping, totalAmount }));
                }}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                placeholder="0"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Discount</p>
              <input
                type="number"
                value={orderData.discount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  const totalAmount = orderData.subtotal + orderData.tax + orderData.shipping - discount;
                  setOrderData(prev => ({ ...prev, discount, totalAmount }));
                }}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>Total Amount</span>
              <span className="text-2xl">{formatCurrency(orderData.totalAmount)}</span>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
            <textarea
              value={orderData.notes}
              onChange={(e) => handleOrderChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or notes for this order..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 flex justify-between">
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveOrder}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save size={20} />
            Create Order
          </button>
        </div>
      </main>
    </div>
  );
}