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
    const data = await request.json()
    const order = await updateOrderById(id, data)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    return Response.json(order)
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
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
