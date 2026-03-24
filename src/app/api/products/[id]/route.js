import { NextResponse } from 'next/server'
import { getProductById, updateProductById, deleteProductById } from '@/lib/db'
import { getProductById as getProductByIdMemory, updateProductById as updateProductByIdMemory, deleteProductById as deleteProductByIdMemory } from '@/lib/db-memory'

// GET /api/products/:id
export async function GET(request, { params }) {
  try {
    const product = await getProductById(params.id)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (err) {
    console.error('MongoDB failed, using in-memory fallback:', err.message)
    try {
      const product = await getProductByIdMemory(params.id)
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(product)
    } catch (fallbackErr) {
      console.error('In-memory fallback also failed:', fallbackErr.message)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
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
    console.error('MongoDB failed, using in-memory fallback:', err.message)
    try {
      const updated = await updateProductByIdMemory(params.id, body)
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(updated)
    } catch (fallbackErr) {
      console.error('In-memory fallback also failed:', fallbackErr.message)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
  }
}

// DELETE /api/products/:id
export async function DELETE(request, { params }) {
  try {
    const deleted = await deleteProductById(params.id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('MongoDB failed, using in-memory fallback:', err.message)
    try {
      const deleted = await deleteProductByIdMemory(params.id)
      if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    } catch (fallbackErr) {
      console.error('In-memory fallback also failed:', fallbackErr.message)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
  }
}
