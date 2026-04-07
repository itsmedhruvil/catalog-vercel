import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchOrders } from '@/lib/api'
import { getAdminEmails } from '@/lib/admin'

export const metadata = {
  title: 'Orders - Product Catalog',
  description: 'Manage orders',
}

export default async function OrdersPage() {
  const { userId } = await auth()
  
  // If not signed in, redirect to sign in
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Get user's primary email from Clerk
  // For server-side, we need to check if user has admin access
  // We'll use the session to get user info
  const { sessionClaims } = await auth()
  const userEmail = sessionClaims?.email
  
  // Check if user is admin
  const adminEmails = getAdminEmails()
  const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase())
  
  // If user is not admin, redirect to catalog
  if (!isAdmin) {
    redirect('/catalog')
  }
  
  let orders = []
  try {
    orders = await fetchOrders()
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your order history and view order details
          </p>
        </div>

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
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Browse Catalog
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
  const totalPrice = order.totalAmount || 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-900">
              Order #{order.id?.slice(-6).toUpperCase() || 'N/A'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusColors[order.status] || statusColors.pending
              }`}
            >
              {statusLabels[order.status] || 'Pending'}
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Placed on {formatDate(order.createdAt)}</p>
            <p>{totalItems} items • {totalPrice.toFixed(2)} pts</p>
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
          {totalItems > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">
                +{totalItems - 3}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`/orders/${order.id}`}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  )
}