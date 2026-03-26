import { NextResponse } from 'next/server'
import { getProductById, updateProductById, deleteProductById } from '@/lib/db'

// GET /api/products/:id
export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (err) {
    console.error('Failed to fetch product:', err.message)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/:id
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const updated = await updateProductById(params.id, body)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Failed to update product:', err.message)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/:id
export async function DELETE(request, { params }) {
  try {
    const deleted = await deleteProductById(params.id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete product:', err.message)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
