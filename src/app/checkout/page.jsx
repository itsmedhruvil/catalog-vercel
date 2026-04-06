'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package,
  CheckCircle,
  AlertCircle,
  ShoppingCart
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/api'
import CartSidebar from '@/components/CartSidebar'
import { isAdminMode } from '@/lib/admin'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, clearCart, cartTotals, openCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const { subtotal } = cartTotals()

  const [formData, setFormData] = useState({
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
  })

  // Shipping rates configuration
  const SHIPPING_RATES = {
    standard: { baseRate: 50, freeThreshold: 500 },    // Free shipping above ₹500
    express: { baseRate: 120, freeThreshold: 1000 },   // Free shipping above ₹1000
    pickup: { baseRate: 0, freeThreshold: 0 }          // Always free
  }

  // Tax rate (GST - 18%)
  const TAX_RATE = 0.18

  // Discount tiers (auto-applied based on subtotal)
  const DISCOUNT_TIERS = [
    { threshold: 5000, percentage: 0.10 },   // 10% off above ₹5000
    { threshold: 3000, percentage: 0.05 },   // 5% off above ₹3000
    { threshold: 1000, percentage: 0.02 }    // 2% off above ₹1000
  ]

  // Calculate shipping based on delivery method and subtotal
  const calculateShipping = () => {
    const method = formData.delivery.method
    const rate = SHIPPING_RATES[method] || SHIPPING_RATES.standard
    return subtotal >= rate.freeThreshold ? 0 : rate.baseRate
  }

  // Calculate tax (18% GST)
  const calculateTax = () => {
    return Math.round(subtotal * TAX_RATE)
  }

  // Calculate auto-discount based on subtotal
  const calculateDiscount = () => {
    for (const tier of DISCOUNT_TIERS) {
      if (subtotal >= tier.threshold) {
        return Math.round(subtotal * tier.percentage)
      }
    }
    return 0
  }

  // Get applied discount description
  const getDiscountDescription = () => {
    for (const tier of DISCOUNT_TIERS) {
      if (subtotal >= tier.threshold) {
        return `${tier.percentage * 100}% auto-discount (Orders above ₹${tier.threshold})`
      }
    }
    return 'No discount applied'
  }

  // Get shipping description
  const getShippingDescription = () => {
    const method = formData.delivery.method
    const rate = SHIPPING_RATES[method] || SHIPPING_RATES.standard
    if (method === 'pickup') return 'Store Pickup (Free)'
    if (subtotal >= rate.freeThreshold) return `Free shipping (Above ₹${rate.freeThreshold})`
    return `${SHIPPING_RATES[method]?.label || 'Standard'} Shipping`
  }

  const shipping = calculateShipping()
  const tax = calculateTax()
  const discount = calculateDiscount()

  // Check if user is admin - redirect to orders/create if so
  useEffect(() => {
    if (isAdminMode()) {
      // Admins should use the manual order creation page, not checkout
      router.push('/orders/create')
      return
    }
    
    if (cartItems.length === 0 && !isSubmitting) {
      // Redirect to catalog if cart is empty
      router.push('/catalog')
    }
  }, [cartItems, router, isSubmitting])

  // Early return for admins (in case useEffect hasn't run yet)
  if (isAdminMode()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Admins should use the Order Management system</p>
          <button
            onClick={() => router.push('/orders/create')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Create Order
          </button>
        </div>
      </div>
    )
  }

  const handleCustomerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }))
  }

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        address: {
          ...prev.customer.address,
          [field]: value
        }
      }
    }))
  }

  const handlePaymentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }))
  }

  const handleDeliveryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value
      }
    }))
  }

  const totalAmount = subtotal + tax + shipping - discount

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.customer.name || !formData.customer.email || !formData.customer.phone) {
      alert('Please fill in all customer information')
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          size: item.size
        })),
        subtotal,
        tax,
        shipping,
        discount,
        totalAmount
      }

      const order = await createOrder(orderData)
      clearCart()
      
      // Store order ID in sessionStorage for customer access to receipt
      sessionStorage.setItem('lastOrderId', order.id)
      
      // Redirect to order confirmation/receipt
      router.push(`/orders/${order.id}/receipt`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">{cartItems.length} items in cart</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer & Delivery Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customer.name}
                      onChange={(e) => handleCustomerChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={formData.customer.email}
                          onChange={(e) => handleCustomerChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          value={formData.customer.phone}
                          onChange={(e) => handleCustomerChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Address
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.customer.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.customer.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.customer.address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={formData.customer.address.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.customer.address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Information */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'cod', label: 'Cash on Delivery' },
                      { value: 'upi', label: 'UPI Payment' },
                      { value: 'card', label: 'Credit/Debit Card' },
                      { value: 'online', label: 'Online Payment' }
                    ].map(method => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.payment.method === method.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.payment.method === method.value}
                          onChange={(e) => handlePaymentChange('method', e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck size={20} />
                    Delivery Method
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'standard', label: 'Standard (3-5 days)' },
                      { value: 'express', label: 'Express (1-2 days)' },
                      { value: 'pickup', label: 'Store Pickup' }
                    ].map(method => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.delivery.method === method.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.value}
                          checked={formData.delivery.method === method.value}
                          onChange={(e) => handleDeliveryChange('method', e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions
                    </label>
                    <textarea
                      value={formData.delivery.deliveryInstructions}
                      onChange={(e) => handleDeliveryChange('deliveryInstructions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                {/* Cart Items Preview */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600">Tax (18% GST)</span>
                      <p className="text-xs text-gray-400">Auto-calculated</p>
                    </div>
                    <span className="text-right font-medium text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600">Shipping</span>
                      <p className="text-xs text-gray-400">
                        {shipping === 0 
                          ? 'Free (Order above threshold)' 
                          : formData.delivery.method === 'express'
                            ? 'Express delivery'
                            : formData.delivery.method === 'pickup'
                              ? 'Store pickup'
                              : 'Standard delivery'}
                      </p>
                    </div>
                    <span className={`text-right font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600">Discount</span>
                      <p className="text-xs text-gray-400">{getDiscountDescription()}</p>
                    </div>
                    <span className={`text-right font-medium ${discount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {discount > 0 ? `- ${formatCurrency(discount)}` : formatCurrency(discount)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full mt-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={22} />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <CartSidebar />
        </div>
      )}
    </div>
  )
}