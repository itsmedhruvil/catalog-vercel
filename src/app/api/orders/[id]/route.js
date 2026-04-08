import { NextResponse } from 'next/server'
import { getOrderById, updateOrderById, deleteOrderById } from '@/lib/orderSchema'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    return Response.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Validate ID format
    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Invalid order ID' }, { status: 400 })
    }
    
    const data = await request.json()
    
    // Validate that we have data to update
    if (!data || typeof data !== 'object') {
      return Response.json({ error: 'No update data provided' }, { status: 400 })
    }
    
    const order = await updateOrderById(id, data)
    if (!order) {
      return Response.json({ error: 'Order not found or update failed' }, { status: 404 })
    }
    return Response.json(order)
  } catch (err) {
    console.error('API error updating order:', err)
    return Response.json({ error: err.message || 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteOrderById(id)
    if (!result) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    return Response.json({ message: 'Order deleted successfully' })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
