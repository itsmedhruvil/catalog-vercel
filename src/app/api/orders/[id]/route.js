import { NextResponse } from 'next/server'
import { getOrderById, updateOrderById, deleteOrderById } from '@/lib/orderSchema'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const order = await getOrderById(params.id)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    return Response.json(order)
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const order = await updateOrderById(params.id, data)
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
    const result = await deleteOrderById(params.id)
    if (!result) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    return Response.json({ message: 'Order deleted successfully' })
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}