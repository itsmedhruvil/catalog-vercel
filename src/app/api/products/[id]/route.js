import { NextResponse } from 'next/server'
import { getProductById, updateProductById, deleteProductById } from '@/lib/db'

// GET /api/products/:id
export async function GET(request, { params }) {
  const product = await getProductById(params.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

// PUT /api/products/:id
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const updated = await updateProductById(params.id, body)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/products/:id
export async function DELETE(request, { params }) {
  const deleted = await deleteProductById(params.id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
