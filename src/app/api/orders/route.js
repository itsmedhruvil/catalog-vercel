import { NextResponse } from 'next/server'
import { readOrders, createOrder, getOrderAnalytics } from '@/lib/orderSchema'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customer = searchParams.get('customer')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const analytics = searchParams.get('analytics')

    // Return analytics data if requested
    if (analytics === 'true') {
      const analyticsData = await getOrderAnalytics()
      return Response.json(analyticsData)
    }

    // Filter orders based on query parameters
    let orders
    if (status) {
      const { getOrdersByStatus } = await import('@/lib/orderSchema')
      orders = await getOrdersByStatus(status)
    } else if (customer) {
      const { getOrdersByCustomer } = await import('@/lib/orderSchema')
      orders = await getOrdersByCustomer(customer)
    } else if (startDate && endDate) {
      const { getOrdersByDateRange } = await import('@/lib/orderSchema')
      orders = await getOrdersByDateRange(startDate, endDate)
    } else {
      orders = await readOrders()
    }

    return Response.json(orders)
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.customer || !data.items || data.items.length === 0) {
      return Response.json({ 
        error: 'Customer information and items are required' 
      }, { status: 400 })
    }

    // Validate customer information
    if (!data.customer.name || !data.customer.email || !data.customer.phone) {
      return Response.json({ 
        error: 'Customer name, email, and phone are required' 
      }, { status: 400 })
    }

    // Validate items
    for (const item of data.items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return Response.json({ 
          error: 'Each item must have productId, quantity, and unitPrice' 
        }, { status: 400 })
      }
    }

    const order = await createOrder(data)
    return Response.json(order, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}