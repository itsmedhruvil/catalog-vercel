import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrdersByCustomer } from '@/lib/orderSchema'
import Link from 'next/link'

export const metadata = {
  title: 'My Orders - Product Catalog',
  description: 'View your order history, receipts, and invoices',
}

export default async function MyOrdersPage() {
  const { userId } = await auth()
  
  // If not signed in, redirect to sign in
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Get user's email from session claims
  const { sessionClaims } = await auth()
  const userEmail =
    sessionClaims?.email ||
    sessionClaims?.email_address ||
    sessionClaims?.primary_email_address ||
    sessionClaims?.primaryEmailAddress
  
  let orders = []
  try {
    // Fetch orders directly from database filtered by user's email
    // This is more efficient than fetching all orders and filtering client-side
    if (userEmail) {
      orders = await getOrdersByCustomer(String(userEmail))
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      delivered: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Delivered' },
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            View your order history, download receipts, and track deliveries
          </p>
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.orderStatus === 'completed' || o.orderStatus === 'delivered').length}
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">
              Your order history will appear here once you place your first order.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        Order #{order.orderNumber?.slice(-6).toUpperCase() || 'N/A'}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Placed on {formatDate(order.orderDate || order.createdAt)}</p>
                      <p>
                        {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} items •{' '}
                        {formatCurrency(order.totalAmount || 0)}
                      </p>
                      {order.customer?.name && (
                        <p className="text-gray-400">Shipped to: {order.customer.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden"
                      >
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-400">No img</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-500">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}/receipt`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                    >
                      View Receipt
                    </Link>
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}